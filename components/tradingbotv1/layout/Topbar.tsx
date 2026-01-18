
"use client";

import { Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBotStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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
