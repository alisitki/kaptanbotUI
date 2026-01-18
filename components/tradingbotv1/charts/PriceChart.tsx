
"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OhlcCandle } from "@/lib/api/client/types";

interface PriceChartProps {
    data?: OhlcCandle[];
    symbol?: string;
    loading?: boolean;
}

export function PriceChart({ data, symbol = "BTCUSDT", loading }: PriceChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map(d => {
            const timeMs = d.ts < 10000000000 ? d.ts * 1000 : d.ts;
            return {
                timeMs: timeMs,
                label: new Date(timeMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                fullTime: new Date(timeMs).toLocaleString(),
                price: d.close,
                ts: d.ts
            };
        }).sort((a, b) => a.timeMs - b.timeMs);
    }, [data]);

    const latest = chartData.at(-1)?.price || 0;
    const start = chartData[0]?.price || 0;
    const pnl = latest - start;
    const pnlPct = start ? (pnl / start) * 100 : 0;
    const isPos = pnl >= 0;

    return (
        <Card className="bg-[#0A0A0A]/50 border-white/5 h-[400px] flex flex-col relative text-white">
            {process.env.NODE_ENV !== 'production' && chartData.length > 0 && (
                <div className="absolute top-0 right-0 bg-yellow-500/10 text-yellow-500 text-[10px] p-1 z-50 rounded-bl border-b border-l border-yellow-500/20">
                    DEBUG: ts={chartData[0].ts} | ms={chartData[0].timeMs}
                </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-zinc-400 text-sm font-medium">Price Action</CardTitle>
                    <div className="flex gap-2 items-baseline">
                        <span className="text-2xl font-bold text-white">{symbol}</span>
                        {chartData.length > 0 && (
                            <span className={`text-sm font-mono ${isPos ? 'text-emerald-500' : 'text-rose-500'}`}>
                                ${latest.toLocaleString()}
                                <span className="ml-1 opacity-70">({isPos ? '+' : ''}{pnlPct.toFixed(2)}%)</span>
                            </span>
                        )}
                    </div>
                </div>
                <Badge variant="outline" className="border-white/10 text-zinc-400 bg-white/5">1m</Badge>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-zinc-600 animate-pulse">Loading...</div>
                ) : chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-600">No Data</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="gPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPos ? "#10b981" : "#f43f5e"} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isPos ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis
                                dataKey="label"
                                stroke="#52525b"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                stroke="#52525b"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                width={60}
                                tickFormatter={(v) => `$${v.toLocaleString()}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#a1a1aa' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke={isPos ? "#10b981" : "#f43f5e"}
                                fill="url(#gPrice)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
