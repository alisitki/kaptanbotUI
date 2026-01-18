
import { create } from 'zustand';
import { getBaseUrl, getToken } from './api/runtime';
import { apiGet } from './api/api';
import { AppState, Watch, BotEvent } from './api/client/types';

interface BotStore {
    state: AppState | null;
    watches: Watch[];
    events: BotEvent[];
    sseConnected: boolean;
    lastEventId: string | null;
    accessDenied: boolean;
    accessDeniedReason?: "TOKEN_INVALID" | "IP_NOT_ALLOWED";

    // Actions
    fetchState: () => Promise<void>;
    fetchWatches: () => Promise<void>;
    addEvent: (event: BotEvent) => void;
    start: () => void;
    stop: () => void;
    setAccessDenied: (denied: boolean, reason?: "TOKEN_INVALID" | "IP_NOT_ALLOWED") => void;
}

export const useBotStore = create<BotStore>((set, get) => {
    let eventSource: EventSource | null = null;
    let pollIntervalState: NodeJS.Timeout | null = null;
    let pollIntervalWatches: NodeJS.Timeout | null = null;
    let connectionTimeout: NodeJS.Timeout | null = null;

    const startPolling = () => {
        if (pollIntervalState) return; // Already polling

        console.log("Starting fallback polling...");

        // Initial fetch
        get().fetchState();
        get().fetchWatches();

        pollIntervalState = setInterval(() => {
            get().fetchState().catch(console.error);
        }, 5000);

        pollIntervalWatches = setInterval(() => {
            get().fetchWatches().catch(console.error);
        }, 2000);
    };

    const stopPolling = () => {
        if (pollIntervalState) {
            clearInterval(pollIntervalState);
            pollIntervalState = null;
        }
        if (pollIntervalWatches) {
            clearInterval(pollIntervalWatches);
            pollIntervalWatches = null;
        }
    };

    return {
        state: null,
        watches: [],
        events: [],
        sseConnected: false,
        lastEventId: null,
        accessDenied: false,

        start: () => {
            const token = getToken();
            if (!token) return;

            // Health check timeout - if no connection/event in 10s, start polling
            connectionTimeout = setTimeout(() => {
                if (!get().sseConnected) {
                    startPolling();
                }
            }, 10000);

            const url = `${getBaseUrl()}/v1/stream?token=${encodeURIComponent(token)}`;
            eventSource = new EventSource(url);

            eventSource.onopen = () => {
                console.log("SSE Connected");
                set({ sseConnected: true });
                if (connectionTimeout) clearTimeout(connectionTimeout);
                stopPolling(); // Stop polling if we connect
            };

            eventSource.onerror = (err) => {
                console.error("SSE Error:", err);
                set({ sseConnected: false });

                // Simple logic: if error persists, it might be auth, but EventSource onerror doesn't give status code easily.
                // However, usually browser logs it.
                // We will rely on api calls (polling) to detect 401/403 if SSE fails silently or closes.
                eventSource?.close();
                // If SSE fails, start polling
                startPolling();
            };

            eventSource.addEventListener('state', (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data);
                    set({ state: data });
                } catch (err) {
                    console.error("Error parsing state event", err);
                }
            });

            eventSource.addEventListener('watches', (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data);
                    set({ watches: data });
                } catch (err) {
                    console.error("Error parsing watches event", err);
                }
            });

            eventSource.addEventListener('events', (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data);
                    // data can be single event or array? Prompt says "merge". Assume list or single.
                    // But usually stream sends one by one or list. Let's assume list of events or single event object.
                    // If it's a "snapshot" style, it might be a list.
                    // If it's "incremental", it might be a single event.
                    // Prompt says: "event: events -> merge (id unique), truncate 200"
                    // Let's assume it sends an array of recent events or a single new event.
                    // To be safe, let's handle both.
                    let newEvents: BotEvent[] = Array.isArray(data) ? data : [data];

                    set(state => {
                        const existingIds = new Set(state.events.map(ev => ev.id));
                        const uniqueNewEvents = newEvents.filter(ev => !existingIds.has(ev.id));

                        const merged = [...uniqueNewEvents, ...state.events].slice(0, 200);
                        return { events: merged };
                    });
                } catch (err) {
                    console.error("Error parsing events event", err);
                }
            });
        },

        stop: () => {
            if (eventSource) {
                eventSource.close();
                eventSource = null;
            }
            if (connectionTimeout) clearTimeout(connectionTimeout);
            stopPolling();
            set({ sseConnected: false });
        },

        setAccessDenied: (denied, reason) => set({ accessDenied: denied, accessDeniedReason: reason }),

        fetchState: async () => {
            const { accessDenied } = get();
            if (accessDenied) return;
            try {
                const data = await apiGet<AppState>('/v1/state');
                set({ state: data });
            } catch (error) {
                console.error("Failed to fetch state polling", error);
            }
        },

        fetchWatches: async () => {
            const { accessDenied } = get();
            if (accessDenied) return;
            try {
                const data = await apiGet<Watch[]>('/v1/watches');
                set({ watches: data });
            } catch (error) {
                console.error("Failed to fetch watches polling", error);
            }
        },

        addEvent: (event) => set((s) => ({ events: [event, ...s.events].slice(0, 200) })),
    };
});
