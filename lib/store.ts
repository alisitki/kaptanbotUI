
import { create } from 'zustand';
import { getBaseUrl, getToken, getAuthMethod } from './api/runtime';
import { apiGet } from './api/api';
import { AppState, Watch, BotEvent } from './api/client/types';
import { fetchSSE } from './api/client/sse';

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
    let abortController: AbortController | null = null;
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

        start: async () => {
            const token = getToken();
            if (!token) return;

            // Health check timeout - if no connection/event in 10s, start polling
            connectionTimeout = setTimeout(() => {
                if (!get().sseConnected) {
                    startPolling();
                }
            }, 10000);

            const method = getAuthMethod();
            const url = `${getBaseUrl()}/v1/stream`;

            // Build headers/params based on method
            const fetchOptions: RequestInit = {
                headers: {
                    'Accept': 'text/event-stream',
                }
            };

            const headers = fetchOptions.headers as Record<string, string>;
            if (method === 'BEARER' && url.includes('/v1/stream')) {
                // Force Query for stream as per backend requirement
            } else if (method === 'BEARER') {
                headers['Authorization'] = `Bearer ${token}`;
            } else if (method === 'API_KEY') {
                headers['x-api-key'] = token;
            }

            const streamUrl = `${url}?token=${encodeURIComponent(token)}`;

            abortController = new AbortController();
            fetchOptions.signal = abortController.signal;

            console.log("Starting SSE via Fetch...");

            fetchSSE(
                streamUrl,
                fetchOptions,
                (ev) => {
                    // Handle events
                    if (!get().sseConnected) {
                        set({ sseConnected: true });
                        if (connectionTimeout) clearTimeout(connectionTimeout);
                        stopPolling();
                    }

                    try {
                        const data = JSON.parse(ev.data);
                        if (ev.event === 'state') set({ state: data });
                        else if (ev.event === 'watches') set({ watches: data });
                        else if (ev.event === 'events') {
                            let newEvents: BotEvent[] = Array.isArray(data) ? data : [data];
                            set(state => {
                                const existingIds = new Set(state.events.map(ev => ev.id));
                                const uniqueNewEvents = newEvents.filter(ev => !existingIds.has(ev.id));
                                const merged = [...uniqueNewEvents, ...state.events].slice(0, 200);
                                return { events: merged };
                            });
                        }
                    } catch (err) {
                        console.error(`Error parsing ${ev.event} event`, err);
                    }
                },
                (err) => {
                    console.error("SSE Error:", err);
                    set({ sseConnected: false });
                    startPolling();
                }
            );
        },

        stop: () => {
            if (abortController) {
                abortController.abort();
                abortController = null;
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
