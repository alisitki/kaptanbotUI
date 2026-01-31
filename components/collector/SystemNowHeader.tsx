'use client';

import { ComponentState, CollectorNow } from '@/lib/api/quantlab';
import { Activity, Clock, Database, Zap, Cpu } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface SystemNowHeaderProps {
    data: CollectorNow | null;
    lastUpdated: Date | null;
    title?: string;
}

function StatusBadge({ state }: { state: ComponentState }) {
    const colors = {
        READY: 'bg-emerald-500 text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
        DEGRADED: 'bg-amber-500 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
        BAD: 'bg-red-500 text-red-950 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
        OFFLINE: 'bg-red-500 text-red-950 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
        ERROR: 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]',
    };

    return (
        <span className={clsx("px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase", colors[state] || colors.OFFLINE)}>
            {state}
        </span>
    );
}

function MetricItem({ label, value, unit, icon: Icon, alert = false }: any) {
    return (
        <div className={clsx("flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm transition-all",
            alert ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5"
        )}>
            {Icon && <Icon className={clsx("w-4 h-4", alert ? "text-red-400" : "text-slate-400")} />}
            <div>
                <div className="text-[10px] uppercase tracking-wider opacity-50">{label}</div>
                <div className="font-mono font-bold text-lg leading-none mt-1">
                    {value ?? '--'}
                    {unit && <span className="text-xs opacity-50 ml-0.5 font-normal">{unit}</span>}
                </div>
            </div>
        </div>
    );
}

export function SystemNowHeader({ data, lastUpdated, title = "Collector Observer" }: SystemNowHeaderProps) {
    const formatUptime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-white/10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <StatusBadge state={data?.state ?? 'OFFLINE'} />
                        <span className="text-xs opacity-50 font-mono uppercase tracking-widest">
                            Last Heartbeat (UTC): <span className="text-white">{data?.last_heartbeat_utc ?? '--:--:--'}</span>
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        {title}
                    </h1>
                </div>

                <div className="flex gap-2">
                    <MetricItem
                        label="Uptime"
                        value={data?.uptime_seconds != null ? formatUptime(data.uptime_seconds) : "NO DATA"}
                        icon={Clock}
                    />
                    <MetricItem
                        label="Queue"
                        value={data?.queue_pct != null ? data.queue_pct.toFixed(1) : "NO DATA"}
                        unit="%"
                        icon={Database}
                        alert={(data?.queue_pct ?? 0) > 80}
                    />
                    <MetricItem
                        label="RSS Mem"
                        value={data?.memory_rss_mb != null ? data.memory_rss_mb.toFixed(0) : "NO DATA"}
                        unit="MB"
                        icon={Cpu}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className={clsx(
                            "px-4 py-2 border rounded-xl flex flex-col justify-center items-center",
                            data?.drain_mode === 'drain'
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-500"
                                : "bg-white/5 border-white/5 text-slate-400"
                        )}
                    >
                        <Zap className={clsx("w-4 h-4 mb-1", data?.drain_mode === 'drain' ? "animate-pulse" : "opacity-30")} />
                        <div className="text-[10px] font-bold uppercase tracking-wider">Drain Mode</div>
                        <div className="text-[10px] font-mono">{data?.drain_mode ?? "NO DATA"}</div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
