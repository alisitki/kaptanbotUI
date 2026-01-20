
"use client";

import { useBotStore } from "@/lib/store";
import { MetricCard } from "@/components/tradingbotv1/cards/MetricCard";
import { PriceChart } from "@/components/tradingbotv1/charts/PriceChart";
import { WatchTable } from "@/components/tradingbotv1/watch/WatchTable";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/api";
import { PortfolioState, OhlcCandle } from "@/lib/api/client/types";

export default function OverviewPage() {
    const { state, watches, sseConnected } = useBotStore();
    const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);
    const [ohlc, setOhlc] = useState<OhlcCandle[]>([]);
    const [ohlcLoading, setOhlcLoading] = useState(true);

    // Initial Fetch for Portfolio (not in SSE main loop)
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const data = await apiGet<PortfolioState>('/v1/portfolio');
                setPortfolio(data);
            } catch (e) {
                console.error("Failed to fetch portfolio", e);
            }
        };
        fetchPortfolio();
        // Refresh every 10s as per requirement
        const interval = setInterval(fetchPortfolio, 10000);
        return () => clearInterval(interval);
    }, []);

    // OHLC Fetch
    useEffect(() => {
        const symbol = state?.active_symbol || "BTCUSDT";

        const fetchOHLC = async () => {
            try {
                // Fetch raw array
                const data = await apiGet<any[]>(`/v1/ohlc?symbol=${symbol}&timeframe=1m&limit=200`);

                // Map to ensure types
                const mappedPoints: OhlcCandle[] = data.map(d => ({
                    ts: d.ts || d.timestamp || 0,
                    open: Number(d.open),
                    high: Number(d.high),
                    low: Number(d.low),
                    close: Number(d.close),
                    volume: Number(d.volume)
                }));

                setOhlc(mappedPoints);
                setOhlcLoading(false);
            } catch (e) {
                console.error("Failed to fetch OHLC", e);
                setOhlcLoading(false);
            }
        };

        setOhlcLoading(true);
        fetchOHLC();
        const interval = setInterval(fetchOHLC, 10000);
        return () => clearInterval(interval);
    }, [state?.active_symbol]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-zinc-400">System Overview & Live Status</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Equity"
                    value={portfolio ? `$${portfolio.equity_usdt.toLocaleString()}` : "..."}
                    loading={!portfolio}
                    subtext="Total Assets (USDT)"
                    positive={true}
                />
                <MetricCard
                    title="Total PnL"
                    value={portfolio ? `$${(portfolio.pnl_total_usdt ?? 0).toLocaleString()}` : "..."}
                    loading={!portfolio}
                    subtext="Cumulative Profit"
                    positive={portfolio ? (portfolio.pnl_total_usdt ?? 0) >= 0 : undefined}
                />
                <MetricCard
                    title="Active Watches"
                    value={watches?.length?.toString() || "0"}
                    neutral
                    subtext="Running Strategies"
                />
                <MetricCard
                    title="Notifications"
                    value={state?.notifications?.toString() || "0"}
                    neutral
                    subtext="System Alerts"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PriceChart
                        data={ohlc}
                        symbol={state?.active_symbol || "BTCUSDT"}
                        loading={ohlcLoading}
                    />
                </div>
                <div className="lg:col-span-1">
                    <div className="h-full bg-[#0A0A0A]/20 rounded-lg p-4 border border-white/5">
                        <h3 className="text-white font-medium mb-4">Recent Activity</h3>
                        <div className="space-y-2 text-sm text-zinc-400">
                            {useBotStore.getState().events?.slice(0, 5).map(e => (
                                <div key={e.id} className="p-2 bg-white/5 rounded border border-white/5">
                                    <span className="text-xs text-zinc-500">{new Date(e.timestamp).toLocaleTimeString()}</span>
                                    <p className="text-zinc-300">{e.message}</p>
                                </div>
                            ))}
                            {(!useBotStore.getState().events || useBotStore.getState().events.length === 0) && (
                                <p>No recent events</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-white/10" />

            <div>
                <h2 className="text-lg font-medium text-white mb-4">Active Positions</h2>
                <WatchTable data={watches} isLoading={!sseConnected && watches.length === 0} compact />
            </div>
        </div>
    );
}
