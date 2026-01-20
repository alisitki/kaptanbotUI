"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import {
    createChart,
    ColorType,
    CrosshairMode,
    IChartApi,
    ISeriesApi,
    CandlestickData,
    Time,
    CandlestickSeries,
} from "lightweight-charts";
import { Candle, Position } from "@/lib/game/types";

interface LightweightChartProps {
    candles: Candle[];
    currentIndex: number;
    position: Position | null;
}

export default function LightweightChart({ candles, currentIndex, position }: LightweightChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);
    const seriesApiRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    // Position lines refs
    const entryLineRef = useRef<any>(null);
    const liqLineRef = useRef<any>(null);

    // Laser effect state
    const [showLasers, setShowLasers] = useState(false);

    // Current candle data
    const currentCandle = candles[currentIndex];
    const currentPrice = currentCandle?.c ?? 0;

    // Prepare Data
    const chartData = useMemo(() => {
        const relevantCandles = candles.slice(0, currentIndex + 1);

        // Deduplicate by time
        const uniqueCandles = new Map();
        relevantCandles.forEach(c => {
            uniqueCandles.set(c.t, c);
        });

        const sortedCandles = Array.from(uniqueCandles.values()).sort((a, b) => a.t - b.t);

        return sortedCandles.map(c => ({
            time: (c.t / 1000) as Time,
            open: c.o,
            high: c.h,
            low: c.l,
            close: c.c,
        })) as CandlestickData[];
    }, [candles, currentIndex]);

    // Handle avatar click for laser effect
    const handleAvatarClick = () => {
        setShowLasers(true);
        setTimeout(() => setShowLasers(false), 3000);
    };

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;
        if (chartApiRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#71717a',
                fontFamily: "'Inter', sans-serif",
            },
            grid: {
                vertLines: { color: '#ffffff08' },
                horzLines: { color: '#ffffff08' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 1,
                    color: '#ffffff20',
                    labelBackgroundColor: '#27272a',
                },
                horzLine: {
                    width: 1,
                    color: '#ffffff20',
                    labelBackgroundColor: '#27272a',
                },
            },
            rightPriceScale: {
                borderColor: '#ffffff10',
                scaleMargins: {
                    top: 0.2,
                    bottom: 0.1,
                },
            },
            timeScale: {
                borderColor: '#ffffff10',
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 5,
                barSpacing: 10,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        chartApiRef.current = chart;

        const series = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        seriesApiRef.current = series;
        series.setData(chartData);

        const resizeHandler = () => {
            if (chartContainerRef.current && chartApiRef.current) {
                chartApiRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', resizeHandler);

        return () => {
            window.removeEventListener('resize', resizeHandler);
            if (chartApiRef.current) {
                chartApiRef.current.remove();
                chartApiRef.current = null;
                seriesApiRef.current = null;
            }
        };
    }, []);

    // Update Data
    useEffect(() => {
        if (!seriesApiRef.current || !chartData.length) return;
        seriesApiRef.current.setData(chartData);
    }, [chartData]);

    // Update Markers & Lines
    useEffect(() => {
        if (!seriesApiRef.current || !chartApiRef.current) return;

        const series = seriesApiRef.current;

        // 1. Entry Price Line
        if (entryLineRef.current) {
            series.removePriceLine(entryLineRef.current);
            entryLineRef.current = null;
        }

        if (position) {
            entryLineRef.current = series.createPriceLine({
                price: position.entryPrice,
                color: position.side === 'LONG' ? '#22c55e' : '#ef4444',
                lineWidth: 2,
                lineStyle: 1,
                axisLabelVisible: true,
                title: 'GİRİŞ',
            });
        }

        // 2. Liquidation Price Line
        if (liqLineRef.current) {
            series.removePriceLine(liqLineRef.current);
            liqLineRef.current = null;
        }

        if (position) {
            liqLineRef.current = series.createPriceLine({
                price: position.liqPrice,
                color: '#f43f5e',
                lineWidth: 2,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'LİK',
            });
        }

    }, [position]);

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Floating Info Header */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none select-none">
                <div className="flex flex-col">
                    <div className="text-xs text-zinc-500 font-medium tracking-wider mb-0.5">BTC/USDT</div>
                    <div className={`text-2xl font-mono font-bold tracking-tight ${(chartData[chartData.length - 1]?.close || 0) >= (chartData[chartData.length - 1]?.open || 0)
                        ? 'text-[#22c55e]'
                        : 'text-[#ef4444]'
                        }`}>
                        ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            <div ref={chartContainerRef} className="w-full h-full" />

            {/* Avatar Watermark with Laser Effect */}
            <div
                className="absolute bottom-4 left-20 z-10 cursor-pointer group"
                onClick={handleAvatarClick}
            >
                <div className="relative">
                    <img
                        src="/avatar.png"
                        alt="Avatar"
                        className={`w-16 h-16 rounded-full border-2 transition-all duration-300 object-cover opacity-30 group-hover:opacity-80 group-hover:scale-110 ${showLasers
                            ? 'border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.8)] opacity-100 scale-110'
                            : 'border-white/10'
                            }`}
                    />

                    {/* Laser Eyes Effect */}
                    {showLasers && (
                        <>
                            {/* Left Eye */}
                            <div
                                className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_5px_rgba(255,0,0,0.8)] z-20 animate-pulse"
                                style={{ top: '43%', left: '35%' }}
                            >
                                <div className="absolute top-1/2 left-1/2 w-[2000px] h-[20px] bg-red-500/60 -translate-y-1/2 blur-md origin-left animate-laser-scan" />
                                <div className="absolute top-1/2 left-1/2 w-[2000px] h-[8px] bg-white/80 -translate-y-1/2 blur-sm origin-left animate-laser-scan" />
                            </div>

                            {/* Right Eye */}
                            <div
                                className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_5px_rgba(255,0,0,0.8)] z-20 animate-pulse"
                                style={{ top: '43%', left: '55%' }}
                            >
                                <div className="absolute top-1/2 left-1/2 w-[2000px] h-[20px] bg-red-500/60 -translate-y-1/2 blur-md origin-left animate-laser-scan" />
                                <div className="absolute top-1/2 left-1/2 w-[2000px] h-[8px] bg-white/80 -translate-y-1/2 blur-sm origin-left animate-laser-scan" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
