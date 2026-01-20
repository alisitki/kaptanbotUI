"use client";

import { Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBotStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function formatRelativeTime(timestamp: string | number | null): string {
    if (!timestamp) return "—";
    const now = Date.now();
    const tsMs = typeof timestamp === 'number'
        ? (timestamp < 1e12 ? timestamp * 1000 : timestamp)
        : new Date(timestamp).getTime();
    const diffSeconds = Math.floor((now - tsMs) / 1000);

    if (diffSeconds < 0) return "just now";
    if (diffSeconds < 5) return "just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
}

export function Topbar() {
    const { state, sseConnected } = useBotStore();
    const isLive = state?.mode === 'LIVE';

    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#050505]/80 px-6 backdrop-blur-md">
            {/* Left Area: Symbol & Status */}
            <div className="flex items-center gap-6">
                {/* Connection Status */}
                <div className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1 transition-colors",
                    sseConnected
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                        : "border-rose-500/20 bg-rose-500/10 text-rose-500"
                )}>
                    <Wifi className="h-3 w-3" />
                    <span className="text-xs font-mono font-medium tracking-tight">
                        {sseConnected ? (state?.latency ? `${state.latency}ms` : 'Connected') : 'Disconnected'}
                    </span>
                </div>

                {/* Engine Status (Internal) */}
                {state?.connected === false && (state?.price === 0 || state?.price === undefined) && (
                    <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-8">
                        <Badge variant="destructive" className="bg-rose-500/15 text-rose-500 border-rose-500/20 px-2 py-0.5 font-mono text-[10px] animate-pulse">
                            ENGINE STOPPED
                        </Badge>
                        <div className="flex flex-col -space-y-0.5">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Internal</span>
                            <span className="text-[11px] text-rose-400/80 font-medium italic whitespace-nowrap">Bot engine not running</span>
                        </div>
                        <button
                            className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-2 py-1 rounded text-[10px] font-bold transition-all border border-white/10 active:scale-95 uppercase tracking-wider"
                            onClick={() => alert("Backend Engine'i başlatın: pm2 start engine")}
                        >
                            Start worker
                        </button>
                    </div>
                )}

                {/* Sync Status */}
                <div className="flex items-center gap-3 border-l border-white/10 pl-6 h-8">
                    {state?.connected ? (
                        <>
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 px-2 py-0.5 font-mono text-[10px]">
                                SYNC OK
                            </Badge>
                            {state?.last_sync_at && (
                                <span className="text-[11px] text-zinc-500 font-mono">
                                    {formatRelativeTime(state.last_sync_at)}
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 px-2 py-0.5 font-mono text-[10px]">
                                NO SYNC
                            </Badge>
                            <a
                                href="/tradingbotv1/onboarding"
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                            >
                                Go to Onboarding
                            </a>
                        </>
                    )}
                </div>
            </div>

            {/* Right Area */}
            <div className="flex items-center gap-4">
                <Badge variant="outline" className={cn(
                    "border-0 px-3 py-1",
                    isLive
                        ? "bg-rose-500/10 text-rose-500 animate-pulse"
                        : "bg-indigo-500/10 text-indigo-400"
                )}>
                    {state?.mode || 'PAPER'}
                </Badge>

                <div className="h-6 w-px bg-white/10" />

                <div className="flex items-center gap-2 text-zinc-400">
                    <span className="bg-zinc-800 rounded px-2 py-0.5 text-xs font-mono">v1.0.0</span>
                </div>
            </div>
        </header>
    );
}
