"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { Candle, Position } from "@/lib/game/types";

interface GameChartProps {
    candles: Candle[];
    currentIndex: number;
    position: Position | null;
}

export function GameChart({ candles, currentIndex, position }: GameChartProps) {
    // Get visible candles (current index + some buffer for scrolling)
    const visibleData = useMemo(() => {
        const start = Math.max(0, currentIndex - 49); // Show last 50 candles
        const end = currentIndex + 1;

        return candles.slice(start, end).map((c, idx) => ({
            index: start + idx,
            time: c.t,
            price: c.c,
            open: c.o,
            high: c.h,
            low: c.l,
            close: c.c,
            displayTime: new Date(c.t).toLocaleDateString('tr-TR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit'
            }),
        }));
    }, [candles, currentIndex]);

    const currentCandle = candles[currentIndex];
    const currentPrice = currentCandle?.c ?? 0;

    // Calculate domain
    const prices = visibleData.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.998;
    const maxPrice = Math.max(...prices) * 1.002;

    // Entry price line (if in position)
    const entryPrice = position?.entryPrice;

    return (
        <Card className="h-full border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md flex flex-col overflow-hidden relative">
            {/* Price Display */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                <div className="text-xs text-zinc-500 uppercase mb-1">BTC/USDT</div>
                <div className="text-2xl font-mono font-bold text-white">
                    ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {position && (
                    <div className="text-xs text-zinc-400 mt-1">
                        Giriş: ${position.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                )}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visibleData} margin={{ top: 60, right: 60, left: 10, bottom: 20 }}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />

                    <XAxis
                        dataKey="displayTime"
                        tick={{ fill: '#52525b', fontSize: 10 }}
                        axisLine={{ stroke: '#27272a' }}
                        tickLine={{ stroke: '#27272a' }}
                        interval="preserveStartEnd"
                    />

                    <YAxis
                        orientation="right"
                        domain={[minPrice, maxPrice]}
                        tick={{ fill: '#52525b', fontSize: 11 }}
                        axisLine={{ stroke: '#27272a' }}
                        tickLine={{ stroke: '#27272a' }}
                        tickFormatter={(val: number) => `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                        width={80}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0A0A0A',
                            borderColor: '#27272a',
                            color: '#fff',
                            borderRadius: '8px',
                        }}
                        labelFormatter={(label) => label}
                        formatter={(value) => [
                            typeof value === 'number' ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-',
                            'Fiyat'
                        ]}
                    />

                    {/* Entry Price Line */}
                    {entryPrice && (
                        <ReferenceLine
                            y={entryPrice}
                            stroke={position?.side === 'LONG' ? '#22c55e' : '#ef4444'}
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{
                                value: `Giriş: $${entryPrice.toFixed(0)}`,
                                position: 'left',
                                fill: position?.side === 'LONG' ? '#22c55e' : '#ef4444',
                                fontSize: 10,
                            }}
                        />
                    )}

                    {/* Liquidation Price Line */}
                    {position && (
                        <ReferenceLine
                            y={position.liqPrice}
                            stroke="#f43f5e"
                            strokeDasharray="2 2"
                            strokeWidth={2}
                            label={{
                                value: `Liq: $${position.liqPrice.toFixed(0)}`,
                                position: 'right',
                                fill: '#f43f5e',
                                fontSize: 10,
                                fontWeight: 'bold'
                            }}
                        />
                    )}

                    {/* Current Price Line */}
                    <ReferenceLine
                        y={currentPrice}
                        stroke="#fbbf24"
                        strokeDasharray="3 3"
                        strokeWidth={1}
                    />

                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#3b82f6' }}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Current Candle Marker */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded border border-white/10">
                <span className="text-xs text-zinc-500">
                    {currentCandle && new Date(currentCandle.t).toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
            </div>
        </Card>
    );
}
