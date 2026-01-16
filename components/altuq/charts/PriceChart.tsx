"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Line
} from "recharts";

// Mock Data Generation
const generateMockData = (count: number) => {
    const data = [];
    let price = 98000;
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.5) * 200;
        price += change;
        data.push({
            time: i.toString() + "m",
            price: price,
            ma20: price + (Math.random() - 0.5) * 50,
            ma50: price + (Math.random() - 0.5) * 100,
            bb_upper: price + 150 + Math.random() * 20,
            bb_lower: price - 150 - Math.random() * 20,
        });
    }
    return data;
};

export function PriceChart() {
    const [timeframe, setTimeframe] = useState("15m");
    const [indicators, setIndicators] = useState({
        ma: true,
        bb: false,
    });

    const data = useMemo(() => generateMockData(60), [timeframe]);

    return (
        <Card className="h-[460px] p-0 overflow-hidden border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm flex flex-col relative w-full">
            {/* Chart Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/2">
                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                    {["1m", "5m", "15m", "1h", "4h", "D"].map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                timeframe === tf
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            )}
                        >
                            {tf}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="ma"
                            checked={indicators.ma}
                            onCheckedChange={(c) => setIndicators(prev => ({ ...prev, ma: !!c }))}
                            className="data-[state=checked]:bg-indigo-500 border-white/20"
                        />
                        <label htmlFor="ma" className="text-xs text-zinc-400 font-medium cursor-pointer">MA(20/50)</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="bb"
                            checked={indicators.bb}
                            onCheckedChange={(c) => setIndicators(prev => ({ ...prev, bb: !!c }))}
                            className="data-[state=checked]:bg-purple-500 border-white/20"
                        />
                        <label htmlFor="bb" className="text-xs text-zinc-400 font-medium cursor-pointer">Bollinger</label>
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis
                            orientation="right"
                            domain={['auto', 'auto']}
                            tick={{ fill: '#52525b', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => val.toFixed(0)}
                            width={50}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
                            itemStyle={{ color: '#e4e4e7' }}
                            labelStyle={{ color: '#a1a1aa' }}
                        />

                        {/* Indicators */}
                        {indicators.bb && (
                            <>
                                <Area type="monotone" dataKey="bb_upper" stroke="none" fill="#a855f7" fillOpacity={0.05} />
                                <Area type="monotone" dataKey="bb_lower" stroke="none" fill="#a855f7" fillOpacity={0.05} />
                                <Line type="monotone" dataKey="bb_upper" stroke="#a855f7" strokeWidth={1} strokeOpacity={0.3} dot={false} strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="bb_lower" stroke="#a855f7" strokeWidth={1} strokeOpacity={0.3} dot={false} strokeDasharray="5 5" />
                            </>
                        )}

                        {indicators.ma && (
                            <>
                                <Line type="monotone" dataKey="ma20" stroke="#fbbf24" strokeWidth={1} dot={false} strokeOpacity={0.7} />
                                <Line type="monotone" dataKey="ma50" stroke="#f472b6" strokeWidth={1} dot={false} strokeOpacity={0.7} />
                            </>
                        )}

                        {/* Main Price */}
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#818cf8"
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            strokeWidth={2}
                        />

                        {/* Reference - Last Price */}
                        <ReferenceLine y={data[data.length - 1].price} stroke="#c084fc" strokeDasharray="3 3">
                            <text x="10" y="5" fill="white" fontSize="10" fontWeight="bold">LIVE</text>
                        </ReferenceLine>

                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Floating Info */}
            <div className="absolute top-20 left-6 bg-black/40 backdrop-blur px-3 py-2 rounded border border-white/5 space-y-1">
                <div className="text-2xl font-bold font-mono text-white">98,245.20 <span className="text-sm text-zinc-500 font-sans font-normal">USDT</span></div>
                <div className="flex gap-2 text-xs">
                    <span className="text-emerald-400">24h High: 99,102.00</span>
                    <span className="text-rose-400">Low: 96,230.50</span>
                </div>
            </div>
        </Card>
    );
}
