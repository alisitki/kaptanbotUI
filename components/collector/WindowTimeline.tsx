'use client';

import { CollectorWindow, QualityState } from '@/lib/api/quantlab';
import clsx from 'clsx';
import { motion } from 'framer-motion';

function QualityDot({ quality }: { quality: QualityState }) {
    const colors = {
        GOOD: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
        DEGRADED: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
        BAD: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    };
    return <div className={clsx("w-2 h-2 rounded-full", colors[quality])} />;
}

export function WindowTimeline({ data }: { data: CollectorWindow[] | null }) {
    if (!data) {
        return (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden p-8 flex items-center justify-center">
                <span className="font-mono text-sm uppercase opacity-40">No Audit Window Data</span>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">

            <div className="max-h-[200px] overflow-y-auto overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 z-10 bg-[#0A0A0A] bg-opacity-95 backdrop-blur-md uppercase tracking-wider font-bold opacity-90 border-b border-white/5">
                        <tr>
                            <th className="p-4">Time</th>
                            <th className="p-4">Quality</th>
                            <th className="p-4 text-right">Queue Peak</th>
                            <th className="p-4 text-right">Drops</th>
                            <th className="p-4 text-right">Reconnects</th>
                            <th className="p-4 text-right">Offline (s)</th>
                            <th className="p-4 text-right">Drain (s)</th>
                            <th className="p-4 text-right">Binance EPS</th>
                            <th className="p-4 text-right">Bybit EPS</th>
                            <th className="p-4 text-right">OKX EPS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((win, i) => (
                            <motion.tr
                                key={`${win.window}-${i}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={clsx(
                                    "hover:bg-white/5 transition-colors",
                                    win.quality === 'BAD' ? "bg-red-500/5" : "",
                                    win.is_partial ? "opacity-60 border-l-2 border-l-white/20" : ""
                                )}
                            >
                                <td className="p-4 font-mono font-bold text-white/90">
                                    {win.window}
                                    {win.is_partial && <span className="ml-2 text-[8px] uppercase border border-white/20 px-1 rounded opacity-50">Partial</span>}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <QualityDot quality={win.quality} />
                                        <span className={clsx("font-bold", {
                                            'text-emerald-400': win.quality === 'GOOD',
                                            'text-amber-400': win.quality === 'DEGRADED',
                                            'text-red-400': win.quality === 'BAD',
                                        })}>
                                            {win.quality}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-mono text-white/70">
                                    {win?.queue_peak_pct?.toFixed(1) ?? '0.0'}%
                                </td>
                                <td className={clsx("p-4 text-right font-mono font-bold", (win?.drops ?? 0) > 0 ? "text-red-400" : "text-white/50")}>
                                    {win?.drops ?? 0}
                                </td>
                                <td className={clsx("p-4 text-right font-mono font-bold", (win?.reconnects ?? 0) > 0 ? "text-amber-400" : "text-white/50")}>
                                    {win?.reconnects ?? 0}
                                </td>
                                {/* Offline Seconds Compact */}
                                <td className="p-4 text-right font-mono text-xs">
                                    <div className="flex flex-col gap-1 items-end">
                                        {Object.entries(win?.offline_seconds ?? {}).map(([ex, s]) => s > 0 ? (
                                            <span key={ex} className="text-red-400 font-bold">{ex.slice(0, 3).toUpperCase()}:{s.toFixed(0)}s</span>
                                        ) : null)}
                                        {Object.values(win?.offline_seconds ?? {}).every(s => s === 0) && <span className="opacity-20">-</span>}
                                    </div>
                                </td>
                                <td className={clsx("p-4 text-right font-mono font-bold", (win?.accelerated_drain_seconds ?? 0) > 0 ? "text-amber-400" : "text-white/50")}>
                                    {(win?.accelerated_drain_seconds ?? 0) > 0 ? (win?.accelerated_drain_seconds ?? 0).toFixed(0) + 's' : '-'}
                                </td>

                                <td className="p-4 text-right font-mono opacity-70">
                                    {win?.eps?.['binance']?.avg?.toFixed(1) ?? '-'}
                                </td>
                                <td className="p-4 text-right font-mono opacity-70">
                                    {win?.eps?.['bybit']?.avg?.toFixed(1) ?? '-'}
                                </td>
                                <td className="p-4 text-right font-mono opacity-70">
                                    {win?.eps?.['okx']?.avg?.toFixed(1) ?? '-'}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
