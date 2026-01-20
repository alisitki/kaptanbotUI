"use client";

import { useEffect, useRef, useMemo } from "react";
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

    // Current candle data
    const currentCandle = candles[currentIndex];
    const currentPrice = currentCandle?.c ?? 0;

    // Prepare Data
    const chartData = useMemo(() => {
        const relevantCandles = candles.slice(0, currentIndex + 1);

        // Deduplicate by time
        const uniqueCandles = new Map();
        relevantCandles.forEach(c => {
            // Ensure unique by time. If duplicate, last one wins (or first? usually overwrite)
            // casting to Time is important
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

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Clean up previous chart if any
        if (chartApiRef.current) {
            chartApiRef.current.remove();
        }

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

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartApiRef.current) {
                chartApiRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartApiRef.current) {
                chartApiRef.current.remove();
                chartApiRef.current = null;
                seriesApiRef.current = null;
            }
        };
    }, []); // Run once on mount

    // Update Data
    useEffect(() => {
        if (!seriesApiRef.current || !chartData.length) return;
        seriesApiRef.current.setData(chartData);
    }, [chartData]); // Update when data (currentIndex) changes

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
                lineStyle: 1, // Dotted
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
                color: '#f43f5e', // rose-500
                lineWidth: 2,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: 'LİK',
            });
        }

    }, [position]);

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Floating Info Header within the chart area */}
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

            {/* Watermark in Chart */}
            <div className="absolute bottom-4 left-4 pointer-events-none opacity-20 text-[100px] font-black tracking-tighter text-white leading-none hidden md:block">
                KAPTAN
            </div>
        </div>
    );
}
