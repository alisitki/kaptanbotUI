"use client";

import useSWR, { mutate } from "swr";
import { MetricCard } from "@/components/altuq/cards/MetricCard";
import { PriceChart } from "@/components/altuq/charts/PriceChart";
import { WatchTable } from "@/components/altuq/watch/WatchTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";
import { Play, TrendingUp } from "lucide-react";

// Fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AltuqOverviewPage() {
    // State Fetching
    const { data: state, isLoading: stateLoading } = useSWR('/api/altuq/state', fetcher, { refreshInterval: 5000 });
    const { data: watches, isLoading: watchesLoading } = useSWR('/api/altuq/watches', fetcher, { refreshInterval: 2000 });
    const { data: portfolio } = useSWR('/api/altuq/portfolio', fetcher, { refreshInterval: 10000 });

    // Order Form State
    const [orderAmount, setOrderAmount] = useState(100);
    const [tpPercent, setTpPercent] = useState(2.5);
    const [trailing, setTrailing] = useState(true);

    const handleManualBuy = async () => {
        try {
            const payload = {
                symbol: state?.active_symbol || "BTCUSDT",
                amount: orderAmount,
                tp_mode: trailing ? "TRAILING" : "FIXED",
                tp_percent: tpPercent,
                trailing_step: trailing ? 0.5 : 0
            };

            const res = await fetch('/api/altuq/watches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Alım başarısız");

            toast.success("Alım Yapıldı & Takip Başlatıldı", {
                description: `${payload.amount}$ değerinde ${payload.symbol} alındı. Hedef: %${payload.tp_percent}`,
            });

            mutate('/api/altuq/watches');
            mutate('/api/altuq/portfolio');
        } catch (e) {
            toast.error("İşlem Başarısız", { description: "Lütfen bakiyenizi kontrol edin." });
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* 1. Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Equity"
                    value={stateLoading ? "..." : `$${portfolio?.equity_usdt.toLocaleString()}`}
                    delta="+2.4%"
                    positive={true}
                    subtext="Toplam Varlık"
                    chartData={[{ value: 100 }, { value: 120 }, { value: 110 }, { value: 140 }, { value: 130 }, { value: 150 }]}
                    loading={stateLoading}
                />
                <MetricCard
                    title="Total PnL"
                    value={stateLoading ? "..." : `$${portfolio?.pnl_total_usdt.toLocaleString()}`}
                    delta="+12.5%"
                    positive={true}
                    subtext="Kümulatif Kâr/Zarar"
                    chartData={[{ value: 50 }, { value: 60 }, { value: 55 }, { value: 80 }, { value: 90 }, { value: 100 }]}
                    loading={stateLoading}
                />
                <MetricCard
                    title="Unrealized PnL"
                    value={stateLoading ? "..." : `$${portfolio?.pnl_unrealized_usdt.toLocaleString()}`}
                    delta="-1.2%"
                    positive={false}
                    subtext="Açık Pozisyonlar"
                    loading={stateLoading}
                />
                <MetricCard
                    title="Aktif Takipler"
                    value={watchesLoading ? "..." : watches?.filter((w: any) => w.status === 'WATCHING').length.toString()}
                    neutral
                    subtext="Sistemin izlediği coinler"
                    loading={watchesLoading}
                />
            </div>

            {/* 2. Main Grid: Chart & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">

                {/* Left: Price Chart (2/3 width) */}
                <div className="lg:col-span-2 h-full">
                    <PriceChart />
                </div>

                {/* Right: Quick Actions Panel (1/3 width) */}
                <div className="h-full">
                    <Card className="h-full border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md flex flex-col">
                        <CardHeader className="pb-4 border-b border-white/5 bg-white/2">
                            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                                <TrendingUp className="text-indigo-500 h-5 w-5" />
                                Hızlı İşlem
                            </CardTitle>
                            <CardDescription>Manuel alım yap ve sisteme devret</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-6 pt-6">

                            {/* Amount Input */}
                            <div className="space-y-3">
                                <Label className="text-zinc-400 text-xs uppercase">Alım Tutarı (USDT)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={orderAmount}
                                        onChange={(e) => setOrderAmount(Number(e.target.value))}
                                        className="h-12 bg-black/40 border-white/10 text-xl font-bold font-mono text-white pr-16 focus-visible:ring-indigo-500"
                                    />
                                    <div className="absolute right-3 top-3 text-sm font-medium text-zinc-500">USDT</div>
                                </div>
                                <div className="flex gap-2">
                                    {[100, 500, 1000].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setOrderAmount(amt)}
                                            className="flex-1 py-1 text-xs rounded bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                                        >
                                            ${amt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* TP Settings */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-zinc-400 text-xs uppercase">Hedef Kâr (TP)</Label>
                                    <span className="text-emerald-400 font-bold font-mono">%{tpPercent}</span>
                                </div>
                                <Slider
                                    value={[tpPercent]}
                                    min={0.5}
                                    max={20}
                                    step={0.1}
                                    onValueChange={([v]) => setTpPercent(v)}
                                    className="py-2"
                                />

                                <div className="bg-indigo-500/10 rounded-lg p-3 flex items-center justify-between border border-indigo-500/20">
                                    <Label className="text-indigo-300 text-sm font-medium cursor-pointer" htmlFor="trail-mode">Trailing (Sürülen İz) Modu</Label>
                                    <input
                                        type="checkbox"
                                        id="trail-mode"
                                        checked={trailing}
                                        onChange={(e) => setTrailing(e.target.checked)}
                                        className="accent-indigo-500 h-4 w-4"
                                    />
                                </div>
                            </div>

                            <div className="flex-1" />

                            {/* Submit Button */}
                            <Button
                                size="lg"
                                onClick={handleManualBuy}
                                className="w-full h-14 text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 border-0"
                            >
                                <Play className="mr-2 h-5 w-5 fill-white" />
                                HEMEN AL & TAKİBE BAŞLA
                            </Button>
                            <p className="text-[10px] text-center text-zinc-600 mt-2">
                                İşlem açıldıktan sonra otomatik satış için bot devreye girer.
                            </p>

                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 3. Active Watch List (Footer Widget) */}
            <div className="w-full">
                <WatchTable data={watches} isLoading={watchesLoading} />
            </div>
        </div>
    );
}
