"use client";

import useSWR from "swr";
import { EquityCurve } from "@/components/altuq/portfolio/EquityCurve";
import { MetricCard } from "@/components/altuq/cards/MetricCard";
import { Separator } from "@/components/ui/separator";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AltuqPortfolioPage() {
    const { data: portfolio, isLoading } = useSWR('/api/altuq/portfolio', fetcher, { refreshInterval: 5000 });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Portföy Analizi</h1>
                <p className="text-zinc-400">Genel performans, kârlılık oranları ve varlık dağılımı.</p>
            </div>

            <Separator className="bg-white/10" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Toplam Kâr"
                    value={isLoading ? "..." : `$${portfolio?.pnl_total_usdt.toLocaleString()}`}
                    delta="+22.4%"
                    positive
                    loading={isLoading}
                />
                <MetricCard
                    title="Kazanma Oranı (Win Rate)"
                    value={isLoading ? "..." : `%${portfolio?.win_rate}`}
                    neutral
                    subtext="Son 30 gün"
                    loading={isLoading}
                />
                <MetricCard
                    title="Profit Factor"
                    value={isLoading ? "..." : `${portfolio?.profit_factor}`}
                    positive
                    subtext="Risk/Ödül Dengesi"
                    loading={isLoading}
                />
                <MetricCard
                    title="Max Drawdown"
                    value={isLoading ? "..." : `%${portfolio?.max_drawdown}`}
                    positive={false}
                    subtext="Tepe noktadan düşüş"
                    loading={isLoading}
                />
            </div>

            <EquityCurve />
        </div>
    );
}
