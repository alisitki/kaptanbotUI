'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Activity, Server, Clock, Play, CheckCircle2, CloudOff, RefreshCw, Zap, PauseCircle } from 'lucide-react';
import {
    getQuantLabState,
    getQuantLabJobs,
    getQuantLabRuns,
    getQuantLabMetrics,
    getCollectorNow,
    getCollectorUploaderNow,
    getCollectorDaySummary,
    getCollectorDayWindows,
    QuantLabState,
    Job,
    Run,
    Metrics,
    CollectorNow,
    CollectorUploaderNow,
    CollectorDaySummary,
    CollectorWindow,
    StrategyDecision,
    listQuantLabDecisions,
    getQuantLabActiveHealth,
    RunsHealth
} from '@/lib/api/quantlab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, LayoutList } from 'lucide-react';
import clsx from 'clsx';

// New Components
import { SystemNowHeader } from '@/components/collector/SystemNowHeader';
import { ExchangeLiveness } from '@/components/collector/ExchangeLiveness';
import { DailyTrustSummary } from '@/components/collector/DailyTrustSummary';
import { RecommendedUsage } from '@/components/collector/RecommendedUsage';
import { WindowTimeline } from '@/components/collector/WindowTimeline';
import { UploaderStatus } from '@/components/collector/UploaderStatus';
import { StrategyRunsTable } from '@/components/quantlab/StrategyRunsTable';
import { DecisionDetailDrawer } from '@/components/quantlab/DecisionDetailDrawer';

// --- Polling Infrastructure ---
const BASE_BACKOFF = 3000;
const MAX_BACKOFF = 30000;

export default function QuantLabPage() {
    // --- Polling Guards (StrictMode safe) ---
    const mountedRef = useRef(false);
    const inFlightRef = useRef<Record<string, boolean>>({});
    const backoffRef = useRef<Record<string, number>>({});
    const timerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // --- System State ---
    const [systemState, setSystemState] = useState<QuantLabState | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [runs, setRuns] = useState<Run[]>([]);
    const [metrics, setMetrics] = useState<Metrics | null>(null);

    // --- Core Logic State (Restored) ---
    const [eventRate, setEventRate] = useState(0);
    const [lastEvent, setLastEvent] = useState<number | null>(null);
    const [emaEventRate, setEmaEventRate] = useState(0);
    const [emaQueueDepth, setEmaQueueDepth] = useState(0);
    const [emaProcessingLatency, setEmaProcessingLatency] = useState(0);
    const [emaEventLoopLag, setEmaEventLoopLag] = useState(0);

    // --- Collector State ---
    const [collectorNow, setCollectorNow] = useState<CollectorNow | null>(null);
    const [collectorUploader, setCollectorUploader] = useState<CollectorUploaderNow | null>(null);
    const [collectorSummary, setCollectorSummary] = useState<CollectorDaySummary | null>(null);
    const [collectorWindows, setCollectorWindows] = useState<CollectorWindow[] | null>(null);

    // --- UI/Control State ---
    const [rateLimited, setRateLimited] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // --- Strategy Runs State ---
    const [strategyDecisions, setStrategyDecisions] = useState<StrategyDecision[]>([]);
    const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
    const [isStrategyLoading, setIsStrategyLoading] = useState(false);
    const [runsHealth, setRunsHealth] = useState<RunsHealth | null>(null);

    // Date Navigation
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    });

    const getUtcTodayString = () => {
        const d = new Date();
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    // --- Safe Fetch with Backoff ---
    const safeFetch = useCallback(async <T,>(
        key: string,
        fn: () => Promise<T>,
        onSuccess: (data: T) => void,
        onRateLimit?: () => void
    ): Promise<'ok' | 'skipped' | 'error' | 'rate_limited'> => {
        // Skip if already in-flight
        if (inFlightRef.current[key]) {
            return 'skipped';
        }

        inFlightRef.current[key] = true;

        try {
            const result = await fn();
            // Reset backoff on success
            backoffRef.current[key] = BASE_BACKOFF;
            onSuccess(result);
            setError(null);
            return 'ok';
        } catch (err: any) {
            const isRateLimit = err?.status === 429 || err?.message?.includes('429');
            if (isRateLimit) {
                // Increase backoff
                backoffRef.current[key] = Math.min(
                    (backoffRef.current[key] || BASE_BACKOFF) * 2,
                    MAX_BACKOFF
                );
                onRateLimit?.();
                return 'rate_limited';
            }
            // Increase backoff on error too
            backoffRef.current[key] = Math.min(
                (backoffRef.current[key] || BASE_BACKOFF) * 1.5,
                MAX_BACKOFF
            );
            return 'error';
        } finally {
            inFlightRef.current[key] = false;
        }
    }, []);

    // --- Logic Restoration: Metrics Parsing & EMA ---
    const parseMetric = (raw: string, name: string) => {
        const match = raw.match(new RegExp(`${name} (\\d+)`));
        return match ? Number(match[1]) : 0;
    };

    const rawMetrics = metrics?.raw || '';
    const queueDepth = parseMetric(rawMetrics, 'replay_queue_depth');
    const backpressure = parseMetric(rawMetrics, 'replay_backpressure_total');
    const rawLastTs = parseMetric(rawMetrics, 'collector_last_file_ts');
    const lastEventMetric = parseMetric(rawMetrics, 'replay_stream_last_event_ts');
    const processingLatencyMs = parseMetric(rawMetrics, 'replay_processing_latency_ms');
    const eventLoopLagMs = parseMetric(rawMetrics, 'replay_event_loop_lag_ms');

    const updateEma = (current: number, previous: number) => {
        if (previous === 0 && current > 0) return current;
        return (current * 0.2) + (previous * 0.8);
    };

    useEffect(() => {
        setEmaEventRate(prev => updateEma(eventRate, prev));
        setEmaQueueDepth(prev => updateEma(queueDepth, prev));
        setEmaProcessingLatency(prev => updateEma(processingLatencyMs, prev));
        setEmaEventLoopLag(prev => updateEma(eventLoopLagMs, prev));
    }, [eventRate, queueDepth, processingLatencyMs, eventLoopLagMs]);

    // --- FIXED: System State Based on COLLECTOR, not Replay Stream ---
    const computeSystemState = (
        collectorData: CollectorNow | null,
        uploaderData: CollectorUploaderNow | null,
        daySummary: CollectorDaySummary | null,
        replayEventRate: number
    ) => {
        const warnings: string[] = [];
        const now = Date.now();

        // --- RAW Pipeline Status (from Collector Heartbeat) ---
        let rawStatus: "FLOWING" | "DELAYED" | "STOPPED" = "STOPPED";
        if (collectorData?.last_heartbeat_utc) {
            const heartbeatTime = new Date(collectorData.last_heartbeat_utc).getTime();
            const heartbeatAgeSec = (now - heartbeatTime) / 1000;

            if (collectorData.state === 'OFFLINE' || collectorData.state === 'ERROR') {
                rawStatus = "STOPPED";
                warnings.push("Collector offline or error state");
            } else if (heartbeatAgeSec < 10) {
                rawStatus = "FLOWING";
            } else if (heartbeatAgeSec < 60) {
                rawStatus = "DELAYED";
                warnings.push("Collector heartbeat delayed");
            } else {
                rawStatus = "STOPPED";
                warnings.push("Collector heartbeat stale (>60s)");
            }
        } else if (collectorData) {
            // Collector data exists but no heartbeat - check state
            if (collectorData.state === 'READY') {
                rawStatus = "FLOWING";
            } else {
                rawStatus = "DELAYED";
            }
        } else {
            warnings.push("Collector data unavailable");
        }

        // --- Uploader Status ---
        let uploaderStatus: "READY" | "DEGRADED" | "BAD" = "READY";
        if (uploaderData) {
            if (uploaderData.state === 'BAD' || uploaderData.state === 'ERROR') {
                uploaderStatus = "BAD";
                warnings.push("Uploader in bad state");
            } else if (uploaderData.state === 'DEGRADED' || uploaderData.seconds_since_last_success > 300) {
                uploaderStatus = "DEGRADED";
                warnings.push("Uploader degraded or delayed");
            }
        }

        // --- Replay Stream Status (informational only, not used for CRITICAL) ---
        let replayStatus: "IDLE" | "ACTIVE" = replayEventRate > 0 ? "ACTIVE" : "IDLE";
        if (replayStatus === "IDLE" && rawStatus === "FLOWING") {
            // This is normal - replay only emits during active sessions
            // Do NOT add warning here
        }

        // --- System Status (CRITICAL only if collector truly stopped) ---
        let systemStatus: "HEALTHY" | "DEGRADED" | "CRITICAL" = "HEALTHY";

        if (rawStatus === "STOPPED" || uploaderStatus === "BAD") {
            systemStatus = "CRITICAL";
        } else if (rawStatus === "DELAYED" || uploaderStatus === "DEGRADED") {
            systemStatus = "DEGRADED";
        } else if (daySummary && (daySummary.window_counts?.BAD || 0) > 0) {
            systemStatus = "DEGRADED";
            warnings.push(`${daySummary.window_counts.BAD} bad windows today`);
        }

        return {
            systemStatus,
            rawStatus,
            uploaderStatus,
            replayStatus,
            warnings
        };
    };

    // Use collector data for status computation (NOT replay stream metrics)
    const { systemStatus, rawStatus, uploaderStatus, replayStatus, warnings } = computeSystemState(
        collectorNow,
        collectorUploader,
        collectorSummary,
        emaEventRate
    );

    // --- Logic Restoration: System Advisor ---
    const computeSystemAdvice = (
        systemStatus: "HEALTHY" | "DEGRADED" | "CRITICAL",
        rawStatus: "FLOWING" | "DELAYED" | "STOPPED",
        replayStatus: "IDLE" | "ACTIVE",
        queueDepth: number,
        eventRate: number
    ) => {
        let severity: "INFO" | "WARNING" | "ACTION_REQUIRED" = "INFO";
        const messages: string[] = [];

        // SYSTEM LEVEL
        if (systemStatus === "CRITICAL") {
            severity = "ACTION_REQUIRED";
            messages.push("System in critical state — operator intervention needed");
        } else if (systemStatus === "DEGRADED") {
            severity = "WARNING";
            messages.push("System under stress — performance may degrade");
        } else {
            messages.push("System operating normally");
        }

        // ENGINE QUEUE
        if (queueDepth > 1000) {
            severity = "ACTION_REQUIRED";
            messages.push("Engine overloaded — reduce active strategies");
        } else if (queueDepth > 500) {
            severity = severity === "INFO" ? "WARNING" : severity;
            messages.push("Engine heavily loaded — strategy latency increasing");
        }

        // REPLAY STREAM (informational - NOT critical if idle)
        if (replayStatus === "IDLE") {
            // Normal state - replay only emits during active sessions
            // Do NOT escalate severity
        }

        // RAW PIPELINE (Collector-based)
        if (rawStatus === "STOPPED") {
            severity = "ACTION_REQUIRED";
            messages.push("Market data flow stopped — check collector");
        } else if (rawStatus === "DELAYED") {
            severity = severity === "INFO" ? "WARNING" : severity;
            messages.push("Market data ingestion delayed");
        }

        if (emaProcessingLatency > 150) {
            severity = "ACTION_REQUIRED";
            messages.push("Processing latency critical (>150ms)");
        } else if (emaProcessingLatency > 50) {
            severity = severity === "INFO" ? "WARNING" : severity;
            messages.push("Processing latency elevated (>50ms)");
        }

        if (emaEventLoopLag > 200) {
            severity = "ACTION_REQUIRED";
            messages.push("Event loop lag critical (>200ms)");
        } else if (emaEventLoopLag > 50) {
            severity = severity === "INFO" ? "WARNING" : severity;
            messages.push("Event loop lag elevated (>50ms)");
        }

        return { severity, messages };
    };

    const { severity, messages: adviceMessages } = computeSystemAdvice(
        systemStatus,
        rawStatus,
        replayStatus,
        emaQueueDepth,
        emaEventRate
    );

    // 1. Fetch Core System Data (Jobs, Runs, etc.)
    const fetchSystemData = async () => {
        try {
            const stateData = await getQuantLabState();
            setSystemState(stateData);

            try {
                const [jobsData, runsData, metricsData] = await Promise.all([
                    getQuantLabJobs(),
                    getQuantLabRuns(),
                    getQuantLabMetrics()
                ]);
                setJobs(jobsData);
                setRuns(runsData);
                setMetrics(metricsData);
            } catch (innerErr: any) {
                if (innerErr?.status === 429 || innerErr?.message?.includes('429')) {
                    setRateLimited(true);
                    return 'rate_limited';
                }
            }

            setError(null);
            setLastUpdated(new Date());
            return 'ok';
        } catch (err: any) {
            const isRateLimit = err?.status === 429 || err?.message?.includes('429');
            if (isRateLimit) {
                setRateLimited(true);
                return 'rate_limited';
            }
            if (!collectorNow) {
                setError(err.error || err.message || "Failed to connect to QuantLab System.");
            }
            return 'error';
        }
    };

    // 1b. Fetch Strategy Decisions
    const fetchStrategyDecisions = async () => {
        if (rateLimited) return;
        setIsStrategyLoading(true);
        try {
            const data = await listQuantLabDecisions();
            setStrategyDecisions(data);
        } catch (e) {
            console.warn("Strategy decisions fetch failed", e);
        } finally {
            setIsStrategyLoading(false);
        }
    };

    // 1c. Fetch Runs Health
    const fetchRunsHealth = async () => {
        if (rateLimited) return;
        try {
            const health = await getQuantLabActiveHealth();
            setRunsHealth(health);
        } catch (e) {
            console.warn("Runs health fetch failed", e);
        }
    };

    // 2. Fetch Live Collector Data (Fast Poll)
    const fetchCollectorLive = async () => {
        if (rateLimited) return;
        try {
            const [nowResp, uploaderResp] = await Promise.all([
                getCollectorNow(),
                getCollectorUploaderNow(),
            ]);

            if (nowResp.status === 429 || uploaderResp.status === 429) {
                setRateLimited(true);
                return;
            }

            setCollectorNow(nowResp.data);
            setCollectorUploader(uploaderResp.data);
        } catch (e) {
            console.warn("Collector live fetch failed", e);
        }
    };

    // 3. Fetch Day Data (Slow Poll / On Date Change)
    const fetchCollectorDay = async () => {
        if (rateLimited) return;
        try {
            const [summaryResp, windowsResp] = await Promise.all([
                getCollectorDaySummary(selectedDate),
                getCollectorDayWindows(selectedDate),
            ]);

            if (summaryResp.status === 429 || windowsResp.status === 429) {
                setRateLimited(true);
                return;
            }

            setCollectorSummary(summaryResp.data);
            setCollectorWindows(windowsResp.data);
        } catch (e) {
            console.warn("Collector day fetch failed", e);
        }
    };

    // --- Stream Logic (Core) - SSE with StrictMode guard ---
    useEffect(() => {
        // StrictMode guard - prevent double subscription
        if (mountedRef.current) return;
        mountedRef.current = true;

        if (rateLimited) return;

        let es: EventSource | null = null;
        let retry = 3000;
        let retryTimer: ReturnType<typeof setTimeout> | null = null;
        let count = 0;

        const interval = setInterval(() => {
            setEventRate(count);
            count = 0;
        }, 1000);

        const inc = () => {
            count++;
            setLastEvent(Date.now());
        };

        const start = () => {
            es = new EventSource('/api/proxy/api/quantlab/stream');
            es.onmessage = inc;
            es.addEventListener('event', inc);
            es.addEventListener('tick', inc);
            es.onopen = () => { retry = 3000; };
            es.onerror = () => {
                es?.close();
                retry = Math.min(retry * 2, 30000);
                retryTimer = setTimeout(start, retry);
            };
        };

        start();

        return () => {
            es?.close();
            if (retryTimer) clearTimeout(retryTimer);
            clearInterval(interval);
            mountedRef.current = false;
        };
    }, [rateLimited]);


    // --- Consolidated Polling Effect (StrictMode Safe) ---
    useEffect(() => {
        // Skip if already initialized via StrictMode double-mount
        const pollKey = 'main_poll';
        if (timerRef.current[pollKey]) {
            return;
        }

        // Initial fetches
        fetchSystemData();
        fetchCollectorLive();
        fetchCollectorDay();
        fetchStrategyDecisions();
        fetchRunsHealth();

        // System Data Loop (10s) with backoff-aware scheduling
        const scheduleSystem = () => {
            const delay = backoffRef.current['system'] || 10000;
            timerRef.current['system'] = setTimeout(async () => {
                await fetchSystemData();
                await fetchStrategyDecisions(); // Refresh strategy runs on same cycle
                await fetchRunsHealth(); // Refresh runs health
                scheduleSystem();
            }, delay);
        };

        // Collector Live Loop (3s) with backoff-aware scheduling
        const scheduleLive = () => {
            const delay = backoffRef.current['live'] || 3000;
            timerRef.current['live'] = setTimeout(async () => {
                await fetchCollectorLive();
                scheduleLive();
            }, delay);
        };

        // Start polling loops
        timerRef.current[pollKey] = setTimeout(() => {
            scheduleSystem();
            scheduleLive();
        }, 100);

        return () => {
            // Clear all timers on cleanup
            Object.values(timerRef.current).forEach(t => clearTimeout(t));
            timerRef.current = {};
        };
    }, []);

    // Rate Limit Recovery
    useEffect(() => {
        if (rateLimited) {
            const t = setTimeout(() => setRateLimited(false), 30000); // 30s cool off
            return () => clearTimeout(t);
        }
    }, [rateLimited]);

    // Day Data specific loop (triggered by date change)
    useEffect(() => {
        fetchCollectorDay();

        // Only poll day data if selecting TODAY
        if (selectedDate === getUtcTodayString()) {
            const dayInterval = setInterval(fetchCollectorDay, 15000);
            return () => clearInterval(dayInterval);
        }
    }, [selectedDate]);


    // Styles
    const systemColor = systemStatus === "HEALTHY" ? "text-emerald-500" : systemStatus === "DEGRADED" ? "text-amber-500" : "text-red-500";

    // Derived UI values
    const compactTs = (systemState as any)?.last_compact_ts;
    const compactOk = Boolean(compactTs);
    const rawOk = rawLastTs > 0;
    const replayOk = lastEventMetric > 0;
    const heartbeatLabel = lastEvent ? `${((Date.now() - lastEvent) / 1000).toFixed(1)}s ago` : '—';
    const compactLabel = compactTs ? new Date(compactTs * 1000).toLocaleTimeString() : '—';
    const rawLabel = rawLastTs ? new Date(rawLastTs * 1000).toLocaleTimeString() : '—';

    let loadLabel = 'LOW';
    let loadColor = 'text-emerald-500';
    if (emaQueueDepth > 500) {
        loadLabel = 'HIGH';
        loadColor = 'text-red-500';
    } else if (emaQueueDepth > 100) {
        loadLabel = 'MEDIUM';
        loadColor = 'text-amber-500';
    }


    if (error && !collectorNow && !systemState) {
        return (
            <main className="min-h-screen bg-[#050505] text-slate-200 p-4 md:p-8 font-sans flex items-center justify-center">
                <div className="flex flex-col items-center justify-center h-96 text-red-500">
                    <CloudOff className="w-16 h-16 mb-4" />
                    <h1 className="text-2xl font-bold">SYSTEM OFFLINE</h1>
                    <p className="opacity-60 mb-8">{error}</p>
                    <button onClick={() => { setRateLimited(false); fetchSystemData(); fetchCollectorLive(); }} className="flex items-center gap-2 px-4 py-2 bg-red-900/30 rounded border border-red-500/30 hover:bg-red-900/50">
                        <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-slate-200 p-4 md:p-8 font-sans pb-32">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* 1. Global Page Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            QuantLab Dashboard
                        </h1>
                        <p className="text-sm text-slate-400 max-w-2xl">
                            Real-time monitoring of QuantLab Core Engine and Data Collector Pipeline.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">System Time (UTC)</div>
                            <div className="font-mono text-sm text-slate-300">
                                {lastUpdated ? lastUpdated.toISOString().replace('T', ' ').split('.')[0] : '--'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* 2. CORE SYSTEM HEALTH (Top Level) */}
                <section className="space-y-4">
                    <h2 className="text-xs uppercase font-bold opacity-40 tracking-widest pl-1 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Core Engine Status
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* System Status */}
                        <Card className="bg-white/[0.02] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">System Status</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${systemColor} flex items-center gap-2`}>
                                    <div className={`w-3 h-3 rounded-full ${systemStatus === 'HEALTHY' ? 'bg-emerald-500' : systemStatus === 'DEGRADED' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                    {systemStatus}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 truncate" title={warnings.join(', ')}>
                                    {warnings.length > 0 ? warnings[0] : 'All systems normal'}
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Advisor */}
                        <Card className="bg-white/[0.02] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">System Advisor</CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-sm font-semibold ${severity === "INFO" ? "text-blue-400" :
                                    severity === "WARNING" ? "text-amber-400" :
                                        "text-red-400"
                                    }`}>
                                    {severity}
                                </div>
                                <ul className="text-xs text-muted-foreground mt-2 list-disc pl-4 space-y-1">
                                    {adviceMessages.length > 0 ? adviceMessages.slice(0, 2).map((m, i) => <li key={i}>{m}</li>) : <li>No active alerts</li>}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Engine Load */}
                        <Card className="bg-white/[0.02] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Engine Load</CardTitle>
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="text-2xl font-bold"
                                    title={`queue raw=${queueDepth} | queue ema=${emaQueueDepth.toFixed(1)} | latency raw=${processingLatencyMs}ms | latency ema=${emaProcessingLatency.toFixed(1)}ms | lag raw=${eventLoopLagMs}ms | lag ema=${emaEventLoopLag.toFixed(1)}ms`}
                                >
                                    <span className={loadColor}>{loadLabel}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Queue: {queueDepth} · Backpressure: {backpressure}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Latency: {emaProcessingLatency.toFixed(0)}ms · Lag: {emaEventLoopLag.toFixed(0)}ms
                                </p>
                            </CardContent>
                        </Card>

                        {/* Service & Contract */}
                        <Card className="bg-white/[0.02] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Service</CardTitle>
                                <Server className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-slate-200">{systemState?.service || 'Unknown'}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Ver: {systemState?.health?.replay_version || '-'}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1 truncate">
                                    {(systemState?.health?.ordering_contract || []).join('→') || '-'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>


                {/* 3. COLLECTOR SECTION (Moved Down) */}
                <section className="space-y-6 pt-6 border-t border-white/5">
                    {/* Data Pipeline Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Collector Exchange Liveness */}
                        <div className="md:col-span-1">
                            <h3 className="text-xs uppercase font-bold opacity-40 mb-3 tracking-widest pl-1">Exchanges</h3>
                            <ExchangeLiveness data={collectorNow} />
                        </div>

                        {/* 2. Replay Stream (not Market Data - only emits during active replay) */}
                        <div className="pt-7">
                            <Card className="bg-white/[0.02] border-white/5 h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-400">Replay Stream</CardTitle>
                                    {replayStatus === 'IDLE' ? (
                                        <PauseCircle className="h-4 w-4 text-slate-500" />
                                    ) : (
                                        <Activity className="h-4 w-4 text-emerald-400" />
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {replayStatus === 'IDLE' ? (
                                        <div className="text-2xl font-bold text-slate-500 mb-1">IDLE</div>
                                    ) : (
                                        <div className="text-3xl font-bold text-white mb-1">
                                            {eventRate} <span className="text-lg font-normal text-muted-foreground">ev/s</span>
                                        </div>
                                    )}
                                    <div className="text-xs text-muted-foreground">EMA: {emaEventRate.toFixed(1)} ev/s</div>
                                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Last Event: <span className="text-slate-300">{heartbeatLabel}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-2 italic">
                                        Emits only during active replay sessions
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 3. Pipeline Checks */}
                        <div className="pt-7">
                            <Card className="bg-white/[0.02] border-white/5 h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-400">Pipeline Stages</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">RAW Ingestion</span>
                                            <span className={rawOk ? 'text-emerald-500 font-bold' : 'text-slate-600'}>{rawOk ? 'ACTIVE' : 'IDLE'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Compact DB</span>
                                            <span className={compactOk ? 'text-emerald-500 font-bold' : 'text-slate-600'}>{compactOk ? 'SYNCED' : 'LAGGING'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Replay Stream</span>
                                            <span className={replayOk ? 'text-emerald-500 font-bold' : 'text-slate-600'}>{replayOk ? 'FLOWING' : 'HALTED'}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-[10px] text-muted-foreground text-right">
                                        Compact: {compactLabel}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Collector Header - NOW BELOW the data cards */}
                    <SystemNowHeader data={collectorNow} lastUpdated={lastUpdated} title="Collector Observer" />

                    {/* Deep Dive Dashboard (Collector) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                        {/* Trust Summary */}
                        <div className="lg:col-span-2">
                            <DailyTrustSummary
                                data={collectorSummary}
                                selectedDate={selectedDate}
                                onDateChange={setSelectedDate}
                                isToday={selectedDate === getUtcTodayString()}
                            />
                        </div>

                        {/* Right Column: Usage + Uploader */}
                        <div className="space-y-8">
                            <UploaderStatus data={collectorUploader} />
                            <RecommendedUsage data={collectorSummary} />
                        </div>
                    </div>
                </section>


                {/* 4. Logs & History (Merged Core + Collector) */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                    {/* Collector Timeline & Strategy Runs (Tabs) */}
                    <section className="xl:col-span-2">
                        <Tabs defaultValue="audit" className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs uppercase font-bold opacity-40 tracking-widest pl-1">Engineering Logs</h2>
                                <TabsList className="bg-white/5 border-white/10 h-8 p-1">
                                    <TabsTrigger value="audit" className="text-[10px] uppercase font-bold px-3 py-1 data-[state=active]:bg-white/10">
                                        <MessageSquare className="w-3 h-3 mr-2" />
                                        Audit Logs
                                    </TabsTrigger>
                                    <TabsTrigger value="strategy" className="text-[10px] uppercase font-bold px-3 py-1 data-[state=active]:bg-white/10">
                                        <LayoutList className="w-3 h-3 mr-2" />
                                        Strategy Runs
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="audit" className="mt-0 outline-none">
                                <WindowTimeline data={collectorWindows} />
                            </TabsContent>

                            <TabsContent value="strategy" className="mt-0 outline-none">
                                <StrategyRunsTable
                                    decisions={strategyDecisions}
                                    onSelectDecision={(d) => setSelectedDecisionId(d.id)}
                                    isLoading={isStrategyLoading}
                                />
                            </TabsContent>
                        </Tabs>
                    </section>

                    {/* Core Runs & Jobs (1 Col) */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-xs uppercase font-bold opacity-40 mb-3 tracking-widest pl-1">Active System Jobs</h2>
                            <Card className="bg-white/[0.02] border-white/5 h-[200px] overflow-y-auto custom-scrollbar">
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-[#0A0A0A] z-10">
                                            <TableRow className="hover:bg-transparent border-white/5">
                                                <TableHead className="text-[10px] uppercase h-8">Job ID</TableHead>
                                                <TableHead className="text-[10px] uppercase h-8">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {jobs.length === 0 ? (
                                                <TableRow className="hover:bg-transparent border-white/5">
                                                    <TableCell colSpan={2} className="text-center text-muted-foreground text-xs py-10">No active jobs</TableCell>
                                                </TableRow>
                                            ) : (
                                                jobs.map((job) => (
                                                    <TableRow key={job.job_id} className="hover:bg-white/5 border-white/5">
                                                        <TableCell className="font-mono text-xs">{job.job_id.substring(0, 8)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={job.status === 'processing' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                                                {job.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <h2 className="text-xs uppercase font-bold opacity-40 mb-3 tracking-widest pl-1">Recent Strategy Runs</h2>
                            <Card className="bg-white/[0.02] border-white/5 h-[200px] overflow-y-auto custom-scrollbar">
                                <CardContent className="p-3">
                                    <div className="space-y-2">
                                        {runs.length === 0 ? (
                                            <div className="text-xs text-center text-muted-foreground py-10">No run history</div>
                                        ) : (
                                            runs.slice(0, 10).map((run) => (
                                                <div key={run.run_id} className="flex items-center justify-between p-2 rounded border border-white/5 bg-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-white/5 p-1 rounded-full">
                                                            <Play className="h-2.5 w-2.5 text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-200">{run.strategy}</p>
                                                            <p className="text-[8px] text-muted-foreground font-mono">{run.run_id.substring(0, 12)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-300">{run.result}</p>
                                                        {run.timestamp && (
                                                            <p className="text-[8px] text-muted-foreground">{new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </div>

            </div>

            {/* Side Drawer for Details */}
            <DecisionDetailDrawer
                decisionId={selectedDecisionId}
                initialData={strategyDecisions.find(d => d.id === selectedDecisionId)}
                onClose={() => setSelectedDecisionId(null)}
            />
        </main>
    );
}
