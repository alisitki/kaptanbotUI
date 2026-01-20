
import { create } from 'zustand';
import { getBaseUrl } from './api/runtime';
import { apiGet, apiPost } from './api/api';
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

    // Auth State
    user: any | null;
    hasBinanceKeys: boolean;
    initialized: boolean;

    // Actions
    fetchState: () => Promise<void>;
    fetchWatches: () => Promise<void>;
    addEvent: (event: BotEvent) => void;
    start: () => void;
    stop: () => void;
    setAccessDenied: (denied: boolean, reason?: "TOKEN_INVALID" | "IP_NOT_ALLOWED") => void;
    checkAuth: () => Promise<{ user: any, has_binance_keys: boolean } | null>;
    logout: () => Promise<void>;
}

export const useBotStore = create<BotStore>((set, get) => {
    let abortController: AbortController | null = null;
    let pollIntervalState: NodeJS.Timeout | null = null;
    let pollIntervalWatches: NodeJS.Timeout | null = null;
    let connectionTimeout: NodeJS.Timeout | null = null;
    let isConnecting = false;

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
        user: null,
        hasBinanceKeys: false,
        initialized: false,

        checkAuth: async () => {
            try {
                const data = await apiGet<any>('/auth/me');
                set({ user: data.user, hasBinanceKeys: data.has_binance_keys, initialized: true, accessDenied: false });
                return data;
            } catch (error: any) {
                set({ user: null, hasBinanceKeys: false, initialized: true });
                if (error.status === 401) {
                    set({ accessDenied: true, accessDeniedReason: "TOKEN_INVALID" });
                }
                return null;
            }
        },

        start: async () => {
            if (get().sseConnected || isConnecting) return;

            isConnecting = true;

            // Health check timeout - if no connection/event in 10s, start polling
            connectionTimeout = setTimeout(() => {
                if (!get().sseConnected) {
                    startPolling();
                }
                isConnecting = false;
            }, 10000);

            const url = `${getBaseUrl()}/v1/stream`;

            const fetchOptions: RequestInit = {
                headers: {
                    'Accept': 'text/event-stream',
                },
                credentials: 'include' // Important for session cookies
            };

            abortController = new AbortController();
            fetchOptions.signal = abortController.signal;

            console.log("Starting SSE via Fetch (Cookie Auth)...");

            fetchSSE(
                url,
                fetchOptions,
                (ev) => {
                    // Handle events
                    if (!get().sseConnected) {
                        set({ sseConnected: true });
                        if (connectionTimeout) clearTimeout(connectionTimeout);
                        stopPolling();
                        isConnecting = false;
                    }

                    try {
                        if (!ev.data) return;
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
                        console.error(`Error parsing ${ev.event} event`, err, ev.data);
                    }
                },
                (err) => {
                    // Only start polling if not aborted
                    if (err.name !== 'AbortError') {
                        set({ sseConnected: false });
                        startPolling();
                    }
                    isConnecting = false;
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
            try {
                const data = await apiGet<AppState>('/v1/state');
                set({ state: data });
            } catch (error) {
                console.error("Failed to fetch state polling", error);
            }
        },

        fetchWatches: async () => {
            try {
                const data = await apiGet<Watch[]>('/v1/watches');
                set({ watches: data });
            } catch (error) {
                console.error("Failed to fetch watches polling", error);
            }
        },

        addEvent: (event) => set((s) => ({ events: [event, ...s.events].slice(0, 200) })),

        logout: async () => {
            try {
                await apiPost('/auth/logout', {});
            } catch (error) {
                console.error("Logout API failed", error);
            } finally {
                get().stop();
                set({ user: null, hasBinanceKeys: false, sseConnected: false, state: null, watches: [] });
            }
        },
    };
});
