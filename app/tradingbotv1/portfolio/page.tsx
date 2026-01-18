
"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/api";
import { PortfolioState } from "@/lib/api/client/types";
import { MetricCard } from "@/components/tradingbotv1/cards/MetricCard";
import { EquityCurve } from "@/components/tradingbotv1/portfolio/EquityCurve"; // Mock chart for now as no data endpoint specified
import { Separator } from "@/components/ui/separator";

export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);

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
        const interval = setInterval(fetchPortfolio, 10000); // 10s refresh as per requirements
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Portfolio Analysis</h1>
                <p className="text-zinc-400">Performance Metrics & Asset Distribution</p>
            </div>

            <Separator className="bg-white/10" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Realized PnL"
                    value={portfolio ? `$${portfolio.pnl_realized_usdt.toLocaleString()}` : "..."}
                    loading={!portfolio}
                    positive={portfolio ? portfolio.pnl_realized_usdt >= 0 : undefined}
                />
                <MetricCard
                    title="Win Rate"
                    value={portfolio ? `%${portfolio.win_rate}` : "..."}
                    loading={!portfolio}
                    neutral
                />
                <MetricCard
                    title="Profit Factor"
                    value={portfolio ? `${portfolio.profit_factor}` : "..."}
                    loading={!portfolio}
                    positive
                />
                <MetricCard
                    title="Max Drawdown"
                    value={portfolio ? `%${portfolio.max_drawdown}` : "..."}
                    loading={!portfolio}
                    positive={false}
                />
            </div>

            <EquityCurve />
        </div>
    );
}
