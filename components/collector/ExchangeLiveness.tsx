'use client';

import { CollectorNow } from '@/lib/api/quantlab';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export function ExchangeLiveness({ data }: { data: CollectorNow | null }) {
    const exchanges = ['binance', 'bybit', 'okx'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exchanges.map((ex, i) => {
                // Strict check: explicitly check strict equality to true if needed, or just truthy if boolean.
                // But user demanded strict pass "NO DATA" if false.
                const isConnected = data?.ws_connected?.[ex] === true;
                const eps = data?.eps_by_exchange?.[ex];

                // Note: EPS can be 0. Do not mask it.
                // logic: if not connected, show NO DATA. If connected, show real EPS.

                return (
                    <motion.div
                        key={ex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={clsx(
                            "relative overflow-hidden rounded-xl border p-4 flex flex-col justify-between h-28 transition-all duration-500",
                            isConnected
                                ? "border-emerald-500/20 bg-emerald-500/5 group"
                                : "border-red-500/20 bg-red-500/5"
                        )}
                    >
                        <div className="flex justify-between items-start z-10">
                            <span className="font-bold text-lg tracking-tight uppercase text-white/90">{ex}</span>
                            {isConnected ? (
                                <Wifi className="w-5 h-5 text-emerald-500 group-hover:animate-pulse" />
                            ) : (
                                <WifiOff className="w-5 h-5 text-red-500" />
                            )}
                        </div>

                        <div className="z-10 mt-2">
                            {isConnected ? (
                                <>
                                    <div className="text-3xl font-mono font-bold tracking-tighter text-white">
                                        {eps != null ? eps.toFixed(1) : "ERR"}
                                    </div>
                                    <div className="text-[10px] opacity-50 font-medium uppercase mt-1 flex items-center gap-1">
                                        <Activity className="w-3 h-3" /> Events / Sec
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col">
                                    <span className="text-xl font-mono font-bold text-red-400">NO DATA</span>
                                    <span className="text-[10px] text-red-400/60 uppercase">Connection Lost</span>
                                </div>
                            )}
                        </div>

                        {/* Background Pulse for Connected State */}
                        {isConnected && (
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
