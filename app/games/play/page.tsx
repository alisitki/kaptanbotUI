"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/altuq/layout/Sidebar";
import { ArrowLeft, Play, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import Link from "next/link";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";
import { toast } from "sonner";

// Mock Data Generator for Game
const generateGameData = (count: number) => {
    const data = [];
    let price = 50000;
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.5) * 500;
        price += change;
        data.push({
            time: i,
            price: price,
            // Simulated simplified indicators
            ma20: price + (Math.random() - 0.5) * 100,
        });
    }
    return data;
};

export default function PlayGamePage() {
    // Game State
    const fullData = useMemo(() => generateGameData(200), []);
    const [currentIndex, setCurrentIndex] = useState(50); // Start with 50 candles
    const [balance, setBalance] = useState(10000); // Virtual 10k USDT
    const [position, setPosition] = useState<{ type: 'LONG' | 'SHORT', entry: number, size: number } | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    const currentData = fullData.slice(0, currentIndex);
    const currentPrice = currentData[currentData.length - 1].price;

    // Actions
    const handleNextCandle = () => {
        if (currentIndex < fullData.length) {
            setCurrentIndex(prev => prev + 1);
        } else {
            toast.info("Oyun Bitti!", { description: `Toplam PnL: $${(balance - 10000).toFixed(2)}` });
        }
    };

    const handleBuy = () => {
        if (position) return toast.error("Zaten açık bir işlem var!");
        setPosition({ type: 'LONG', entry: currentPrice, size: 1 }); // Fixed 1 BTC size for simplicity
        toast.success("LONG İşlem Açıldı", { description: `@ $${currentPrice.toFixed(2)}` });
        handleNextCandle();
    };

    const handleSell = () => {
        if (position) return toast.error("Zaten açık bir işlem var!");
        setPosition({ type: 'SHORT', entry: currentPrice, size: 1 });
        toast.success("SHORT İşlem Açıldı", { description: `@ $${currentPrice.toFixed(2)}` });
        handleNextCandle();
    };

    const handleClose = () => {
        if (!position) return;

        let pnl = 0;
        if (position.type === 'LONG') {
            pnl = (currentPrice - position.entry) * position.size;
        } else {
            pnl = (position.entry - currentPrice) * position.size;
        }

        setBalance(prev => prev + pnl);
        setHistory(prev => [...prev, { ...position, exit: currentPrice, pnl }]);
        setPosition(null);
        toast.success("İşlem Kapatıldı", {
            description: `PnL: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`
        });
        handleNextCandle();
    };

    // Auto-progress if position is open (optional, simpler to manual step for now)

    return (
        <div className="flex h-screen w-full bg-[#020202] dark font-sans antialiased text-white selection:bg-indigo-500/30 overflow-hidden">
            <Sidebar />

            <div className="flex flex-1 flex-col pl-64 h-full transition-all duration-300">
                <main className="flex-1 h-full flex flex-col p-6 relative">

                    {/* Header Bar */}
                    <div className="flex items-center justify-between mb-6 z-10">
                        <div className="flex items-center gap-4">
                            <Link href="/games">
                                <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                    <ArrowLeft className="w-5 h-5 text-zinc-400" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">Price Action Master</h1>
                                <p className="text-sm text-zinc-500">Mevcut mum: {currentIndex} / {fullData.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-xs text-zinc-500 uppercase font-bold">Bakiye</div>
                                <div className="text-2xl font-mono font-bold text-emerald-400">${balance.toFixed(2)}</div>
                            </div>
                            {position && (
                                <div className="text-right px-4 py-1 rounded bg-white/5 border border-white/10">
                                    <div className="text-xs text-zinc-500 uppercase font-bold">Açık PnL</div>
                                    <div className={`text-xl font-mono font-bold ${(position.type === 'LONG' ? (currentPrice - position.entry) : (position.entry - currentPrice)) >= 0
                                            ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                        {((position.type === 'LONG' ? (currentPrice - position.entry) : (position.entry - currentPrice))).toFixed(2)}$
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Game Area */}
                    <div className="flex-1 grid grid-cols-4 gap-6 min-h-0 z-10">

                        {/* Left: Chart */}
                        <Card className="col-span-3 border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md flex flex-col overflow-hidden relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={currentData} margin={{ top: 20, right: 60, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorGame" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                    <YAxis
                                        orientation="right"
                                        domain={['auto', 'auto']}
                                        tick={{ fill: '#52525b', fontSize: 11 }}
                                        tickFormatter={(val) => val.toFixed(0)}
                                    />
                                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }} />
                                    <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGame)" strokeWidth={2} />
                                    <ReferenceLine y={currentPrice} stroke="#fbbf24" strokeDasharray="3 3" />
                                </AreaChart>
                            </ResponsiveContainer>
                            <div className="absolute top-4 left-4 bg-black/40 px-3 py-1 rounded border border-white/5 text-white font-mono">
                                ${currentPrice.toFixed(2)}
                            </div>
                        </Card>

                        {/* Right: Controls */}
                        <div className="col-span-1 flex flex-col gap-4">

                            {/* Actions */}
                            <Card className="p-4 border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md space-y-4">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase mb-2">Aksiyonlar</h3>

                                {!position ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button onClick={handleBuy} className="bg-emerald-600 hover:bg-emerald-500 h-12 text-lg font-bold">
                                            <TrendingUp className="mr-2 h-5 w-5" /> LONG
                                        </Button>
                                        <Button onClick={handleSell} className="bg-rose-600 hover:bg-rose-500 h-12 text-lg font-bold">
                                            <TrendingDown className="mr-2 h-5 w-5" /> SHORT
                                        </Button>
                                    </div>
                                ) : (
                                    <Button onClick={handleClose} variant="secondary" className="w-full h-12 text-lg font-bold bg-zinc-700 hover:bg-zinc-600 text-white">
                                        POZİSYONU KAPAT
                                    </Button>
                                )}

                                <Button onClick={handleNextCandle} variant="outline" className="w-full border-white/10 hover:bg-white/5 text-zinc-300">
                                    <Play className="mr-2 h-4 w-4" /> Sonraki Mum
                                </Button>

                                <div className="text-xs text-center text-zinc-600 mt-2">
                                    Her işlem 1 BTC büyüklüğündedir.
                                </div>
                            </Card>

                            {/* History */}
                            <Card className="flex-1 border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md flex flex-col overflow-hidden">
                                <div className="p-3 border-b border-white/5 text-xs font-bold text-zinc-500 uppercase">
                                    İşlem Geçmişi
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                    {history.slice().reverse().map((trade, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 text-sm">
                                            <Badge variant={trade.type === 'LONG' ? 'default' : 'destructive'} className="text-[10px] h-5">
                                                {trade.type}
                                            </Badge>
                                            <span className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    {history.length === 0 && (
                                        <div className="text-center text-zinc-600 py-8 text-sm">Henüz işlem yok</div>
                                    )}
                                </div>
                            </Card>

                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
