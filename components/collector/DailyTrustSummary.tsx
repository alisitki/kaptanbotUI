'use client';

import { CollectorDaySummary, QualityState } from '@/lib/api/quantlab';
import { ShieldCheck, ShieldAlert, ShieldX, Database, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

function QualityBadge({ quality }: { quality: QualityState }) {
    const styles = {
        GOOD: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        DEGRADED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        BAD: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    const Icons = {
        GOOD: ShieldCheck,
        DEGRADED: ShieldAlert,
        BAD: ShieldX
    };

    const Icon = Icons[quality];

    return (
        <div className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg border", styles[quality])}>
            <Icon className="w-5 h-5" />
            <span className="font-bold tracking-wider">{quality}</span>
        </div>
    );
}

interface DailyTrustSummaryProps {
    data: CollectorDaySummary | null;
    selectedDate: string;
    onDateChange: (date: string) => void;
    isToday: boolean;
}

export function DailyTrustSummary({ data, selectedDate, onDateChange, isToday }: DailyTrustSummaryProps) {
    const handlePrevDay = () => {
        const d = new Date(selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6) + '-' + selectedDate.substring(6, 8));
        d.setUTCDate(d.getUTCDate() - 1);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        onDateChange(`${year}${month}${day}`);
    };

    const handleNextDay = () => {
        if (isToday) return;
        const d = new Date(selectedDate.substring(0, 4) + '-' + selectedDate.substring(4, 6) + '-' + selectedDate.substring(6, 8));
        d.setUTCDate(d.getUTCDate() + 1);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        onDateChange(`${year}${month}${day}`);
    };

    if (!data) {
        return (
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-lg font-medium flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            Daily Trust Summary
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <button
                                onClick={handlePrevDay}
                                className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                                {selectedDate.substring(0, 4)}-{selectedDate.substring(4, 6)}-{selectedDate.substring(6, 8)} (UTC)
                            </div>
                            <button
                                onClick={handleNextDay}
                                disabled={isToday}
                                className={clsx(
                                    "p-1 rounded transition-colors",
                                    isToday ? "opacity-20 cursor-not-allowed" : "hover:bg-white/10 text-slate-400 hover:text-white"
                                )}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="h-48 border border-dashed border-white/5 rounded-xl flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                        <ShieldX className="w-8 h-8" />
                        <span className="font-mono text-sm uppercase text-center">No Summary Data for this date<br /><span className="text-[10px] opacity-60">(Try another day)</span></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-medium flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        Daily Trust Summary
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                        <button
                            onClick={handlePrevDay}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                            {data.date} (UTC)
                        </div>
                        <button
                            onClick={handleNextDay}
                            disabled={isToday}
                            className={clsx(
                                "p-1 rounded transition-colors",
                                isToday ? "opacity-20 cursor-not-allowed" : "hover:bg-white/10 text-slate-400 hover:text-white"
                            )}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={clsx("flex flex-col items-end", data.trust_epoch ? "opacity-100" : "opacity-40")}>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Trust Epoch</span>
                        <span className={clsx("font-mono font-bold", data.trust_epoch ? "text-emerald-400" : "text-slate-500")}>
                            {data.trust_epoch ? 'VERIFIED' : 'FAILED'}
                        </span>
                    </div>
                    <QualityBadge quality={data.overall_quality} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Window Stats */}
                <div className="col-span-2 grid grid-cols-3 gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="text-center">
                        <div className="text-xs text-emerald-500/60 uppercase font-bold mb-1">Good</div>
                        <div className="text-2xl font-mono font-bold text-emerald-400">{data?.window_counts?.GOOD ?? 0}</div>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <div className="text-xs text-amber-500/60 uppercase font-bold mb-1">Degraded</div>
                        <div className="text-2xl font-mono font-bold text-amber-400">{data?.window_counts?.DEGRADED ?? 0}</div>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <div className="text-xs text-red-500/60 uppercase font-bold mb-1">Bad</div>
                        <div className="text-2xl font-mono font-bold text-red-400">{data?.window_counts?.BAD ?? 0}</div>
                    </div>
                </div>

                {/* Max Queue */}
                <div className="p-3 rounded-xl border border-white/5 bg-white/5 flex flex-col justify-center">
                    <div className="text-[10px] uppercase tracking-wide opacity-50 mb-1">Max Queue (Day)</div>
                    <div className={clsx("text-2xl font-mono font-bold", (data?.max_queue_pct ?? 0) > 80 ? "text-red-400" : "text-white")}>
                        {(data?.max_queue_pct ?? 0).toFixed(1)}%
                    </div>
                </div>

                {/* Drops/Reconnects */}
                <div className="p-3 rounded-xl border border-white/5 bg-white/5 flex flex-col justify-center">
                    <div className="text-[10px] uppercase tracking-wide opacity-50 mb-1">Total Drops</div>
                    <div className={clsx("text-xl font-mono font-bold", (data?.total_drops ?? 0) > 0 ? "text-red-400" : "text-white")}>
                        {data?.total_drops ?? 0}
                    </div>
                    <div className="text-[10px] opacity-40 mt-1">
                        {data?.total_reconnects ?? 0} Reconnects
                    </div>
                </div>

                {/* Offline & Drain Stats */}
                <div className="col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    <div className="p-3 rounded-xl border border-white/5 bg-white/5 md:col-span-3 flex items-center justify-between">
                        <span className="text-xs uppercase opacity-50 font-bold ml-2">Offline Duration (s)</span>
                        <div className="flex gap-6 mr-4">
                            {Object.entries(data?.total_offline_seconds ?? {}).map(([ex, secs]) => (
                                <div key={ex} className="flex items-baseline gap-2">
                                    <span className="text-[10px] uppercase opacity-40">{ex}</span>
                                    <span className={clsx("font-mono font-bold", secs > 0 ? "text-red-400" : "text-emerald-400")}>
                                        {secs.toFixed(1)}s
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-white/5 flex flex-col justify-center">
                        <div className="text-[10px] uppercase tracking-wide opacity-50 mb-1">Drain Mode Duration</div>
                        <div className={clsx("text-xl font-mono font-bold", (data?.accelerated_drain_seconds ?? 0) > 0 ? "text-amber-400" : "text-white")}>
                            {(data?.accelerated_drain_seconds ?? 0).toFixed(1)}s
                        </div>
                    </div>
                </div>
            </div>

            {/* Bad Windows List */}
            {(data?.bad_windows?.length ?? 0) > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="text-xs text-red-400 font-bold uppercase mb-2">Affected Windows (UTC)</div>
                    <div className="flex flex-wrap gap-2">
                        {data?.bad_windows?.map((win, i) => (
                            <span key={`${win}-${i}`} className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs font-mono text-red-300">
                                {win}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
