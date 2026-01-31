const fetchQuantlab = async (path: string) => {
    const res = await fetch(`/api/proxy/api/quantlab/${path}`, { cache: 'no-store' });
    if (!res.ok) {
        const err: any = new Error('QuantLab fetch failed');
        err.status = res.status;
        throw err;
    }
    const json = await res.json();
    if (!json.ok) {
        const err: any = new Error('QuantLab response not ok');
        err.status = res.status;
        err.payload = json;
        throw err;
    }
    return json;
};

const fetchQuantlabSoft = async (path: string) => {
    try {
        const res = await fetch(`/api/proxy/api/quantlab/${path}`, { cache: 'no-store' });
        if (!res.ok) return { ok: false, status: res.status };
        const json = await res.json();
        return res.ok ? json : { ok: false, status: res.status };
    } catch {
        return { ok: false };
    }
};

export interface QuantLabHealth {
    status: 'ok' | 'degraded' | 'error';
    replay_version?: string;
    ordering_contract?: string[];
}

export interface Metrics {
    raw?: string;
}

export interface QuantLabState {
    ok: true;
    source: string;
    service: string;
    health: QuantLabHealth;
    metrics?: Metrics;
    ts?: number;
}

export interface Job {
    job_id: string;
    type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    started_at: string;
}

export interface Run {
    run_id: string;
    strategy: string;
    result: string; // e.g. "Profit: $100" or generic result string
    timestamp?: string;
}

// --- COLLECTOR TYPES ---

export type QualityState = 'GOOD' | 'DEGRADED' | 'BAD';
export type ComponentState = 'READY' | 'DEGRADED' | 'BAD' | 'OFFLINE' | 'ERROR';

// GET /collector/now
export interface CollectorNow {
    state: ComponentState;
    uptime_seconds: number;
    last_heartbeat_utc: string;
    memory_rss_mb: number;
    queue_pct: number;
    drain_mode: string;
    ws_connected: Record<string, boolean>;
    eps_by_exchange: Record<string, number>;
}

// GET /collector/day/:YYYYMMDD/summary
export interface CollectorDaySummary {
    date: string;
    overall_quality: QualityState;
    trust_epoch: boolean;
    window_counts: {
        GOOD: number;
        DEGRADED: number;
        BAD: number;
    };
    bad_windows: string[];
    max_queue_pct: number;
    total_drops: number;
    total_reconnects: number;
    total_offline_seconds: Record<string, number>;
    accelerated_drain_seconds: number;
    recommended_usage: {
        ml_backtest: boolean;
        production_trading: boolean;
        notes: string;
    };
}

// GET /collector/day/:YYYYMMDD/windows
export interface CollectorWindow {
    window: string;
    quality: QualityState;
    is_partial: boolean;
    queue_peak_pct: number;
    drops: number;
    reconnects: number;
    accelerated_drain_seconds: number;
    offline_seconds: Record<string, number>;
    eps: Record<string, { min: number; avg: number }>;
}

// GET /collector/uploader/now
export interface CollectorUploaderNow {
    state: 'READY' | 'DEGRADED' | 'BAD' | 'ERROR';
    last_success_upload_utc: string;
    seconds_since_last_success: number;
    pending_files: number;
    spool_size_gb: number;
    alert_sent_24h: boolean;
}



// --- RUNS & DECISIONS TYPES ---

export interface StrategyReport {
    id: string;
    strategy_id: string;
    seed: string;
    timestamp: string;
    metrics: Record<string, any>;
}

export interface StrategyDecision {
    id: string;
    run_id: string;
    strategy_id: string;
    seed: string;
    decision: string;
    reason: string;
    reasons?: string[];
    timestamp: string;
    created_at?: string;
    payload?: any;
}

export interface RunsHealth {
    status: 'ok' | 'degraded' | 'error';
    active_workers: number;
    queue_size: number;
}

export const getQuantLabState = async (): Promise<QuantLabState> => {
    return fetchQuantlab('state');
};

export const getQuantLabJobs = async (): Promise<Job[]> => {
    const json = await fetchQuantlab('jobs');
    return json.data?.items || [];
};

export const getQuantLabRuns = async (): Promise<Run[]> => {
    const json = await fetchQuantlab('runs/decision');
    return json.data?.items || [];
};

export const getQuantLabMetrics = async (): Promise<Metrics> => {
    const json = await fetchQuantlab('metrics');
    return json.data || {};
};

// --- New Runs Fetchers ---

export const getQuantLabActiveHealth = async (): Promise<RunsHealth> => {
    const json = await fetchQuantlab('runs/health/active');
    return json.data;
};

export const listQuantLabReports = async (params?: { seed?: string; strategy_id?: string }): Promise<StrategyReport[]> => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const json = await fetchQuantlab(`runs/reports${query}`);
    return json.data?.items || [];
};

export const listQuantLabDecisions = async (params?: { seed?: string; strategy_id?: string }): Promise<StrategyDecision[]> => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const json = await fetchQuantlab(`runs/decision${query}`);
    // Map response strictly as return res.data ?? []
    return json.data || [];
};

export const getQuantLabDecision = async (id: string): Promise<StrategyDecision> => {
    const json = await fetchQuantlab(`runs/decision/${id}`);
    return json.data;
};

// --- COLLECTOR API ---

export const getCollectorNow = async (): Promise<{ data: CollectorNow | null; status?: number }> => {
    const json = await fetchQuantlabSoft('collector/now');
    return json.ok ? { data: json.data || null, status: 200 } : { data: null, status: json.status };
};

export const getCollectorUploaderNow = async (): Promise<{ data: CollectorUploaderNow | null; status?: number }> => {
    const json = await fetchQuantlabSoft('collector/uploader/now');
    return json.ok ? { data: json.data || null, status: 200 } : { data: null, status: json.status };
};

export const getCollectorDaySummary = async (dateYYYYMMDD: string): Promise<{ data: CollectorDaySummary | null; status?: number }> => {
    const json = await fetchQuantlabSoft(`collector/day/${dateYYYYMMDD}/summary`);
    return json.ok ? { data: json.data || null, status: 200 } : { data: null, status: json.status };
};

export const getCollectorDayWindows = async (dateYYYYMMDD: string): Promise<{ data: CollectorWindow[] | null; status?: number }> => {
    const json = await fetchQuantlabSoft(`collector/day/${dateYYYYMMDD}/windows`);
    const data = json.ok ? json.data : null;
    if (!data) return { data: null, status: json.status };
    if (Array.isArray(data)) return { data, status: 200 };
    return { data: data.items || data.windows || null, status: 200 };
};
