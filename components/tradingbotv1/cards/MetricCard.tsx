"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface MetricCardProps {
    title: string;
    value: string;
    delta?: string;
    positive?: boolean; // true=good(green), false=bad(red), undefined=neutral
    neutral?: boolean;
    loading?: boolean;
    subtext?: string;
    chartData?: { value: number }[]; // for sparkline
}

export function MetricCard({
    title,
    value,
    delta,
    positive,
    neutral,
    loading,
    subtext,
    chartData
}: MetricCardProps) {
    if (loading) {
        return (
            <Card className="p-5 border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm h-32 flex flex-col justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/5" />
                    <Skeleton className="h-8 w-32 bg-white/10" />
                </div>
                <Skeleton className="h-4 w-16 bg-white/5" />
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden p-5 border-white/5 bg-[#0A0A0A]/50 hover:bg-[#0A0A0A]/80 transition-colors backdrop-blur-sm group">

            {/* Background Sparkline (Absolute) */}
            {chartData && (
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={positive ? "#10b981" : positive === false ? "#ef4444" : "#6366f1"} stopOpacity={0.5} />
                                    <stop offset="100%" stopColor={positive ? "#10b981" : positive === false ? "#ef4444" : "#6366f1"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={positive ? "#10b981" : positive === false ? "#ef4444" : "#6366f1"}
                                fill={`url(#grad-${title})`}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <h3 className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors uppercase tracking-wider text-[11px]">{title}</h3>
                    {delta && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border",
                            positive && "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                            positive === false && "text-rose-400 bg-rose-500/10 border-rose-500/20",
                            neutral && "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
                        )}>
                            {positive && <TrendingUp className="h-3 w-3" />}
                            {positive === false && <TrendingDown className="h-3 w-3" />}
                            {neutral && <Minus className="h-3 w-3" />}
                            {delta}
                        </div>
                    )}
                </div>

                {/* Value */}
                <div>
                    <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
                    {subtext && <div className="text-xs text-zinc-500 mt-1">{subtext}</div>}
                </div>
            </div>
        </Card>
    );
}
