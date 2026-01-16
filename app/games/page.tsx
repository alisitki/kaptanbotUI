"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Gamepad2,
    Trophy,
    Flame,
    Target,
    Calendar,
    Shuffle,
    TrendingUp,
    TrendingDown,
    Clock
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/altuq/layout/Sidebar";
import Link from "next/link";
import { getSessions } from "@/lib/game/storage";
import { SessionSummary } from "@/lib/game/types";

export default function GamesPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    // Load sessions from localStorage
    useEffect(() => {
        setSessions(getSessions());
    }, []);

    const handleRandomStart = () => {
        router.push('/games/play');
    };

    const handleDateStart = () => {
        if (!selectedDate) return;
        const timestamp = new Date(selectedDate + 'T00:00:00.000Z').getTime();
        router.push(`/games/play?startTime=${timestamp}&mode=date`);
    };

    return (
        <div className="flex h-screen w-full bg-[#020202] dark font-sans antialiased text-white selection:bg-indigo-500/30 overflow-hidden">
            <Sidebar />

            <div className="flex flex-1 flex-col pl-64 h-full transition-all duration-300">
                <main className="flex-1 h-full overflow-y-auto p-6 md:p-8 relative scroll-smooth">
                    {/* Background Effects */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-emerald-900/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 max-w-5xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent w-fit">
                                Trading Dojo
                            </h1>
                            <p className="text-zinc-400">
                                Piyasa reflekslerini geliştir, sanal bakiyeyle yarış ve ödüller kazan.
                            </p>
                        </div>

                        {/* Main Game Card */}
                        <Card className="border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex flex-col md:flex-row">
                                <div className="p-8 flex flex-col justify-center gap-4 flex-1">
                                    <Badge variant="outline" className="w-fit border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                                        <Flame className="w-3 h-3 mr-1" /> POPÜLER
                                    </Badge>

                                    <div>
                                        <CardTitle className="text-2xl mb-2 text-white">Price Action Master</CardTitle>
                                        <CardDescription className="text-zinc-400 text-base">
                                            Geçmiş grafik verileri üzerinde al/sat yaparak en yüksek PnL'e ulaşmaya çalış.
                                            Gerçek piyasa koşullarında risksiz antrenman. Fees ve slippage simulasyonu dahil.
                                        </CardDescription>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-4 h-4 text-amber-500" />
                                            <span>Sanal bakiye: $10,000</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Target className="w-4 h-4 text-indigo-500" />
                                            <span>500 mum / ~21 gün</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 mt-2">
                                        <Link href="/games/play">
                                            <Button
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                            >
                                                <Shuffle className="w-4 h-4 mr-2" />
                                                Rastgele Başla
                                            </Button>
                                        </Link>

                                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Tarih Seç
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-[#0A0A0A] border-white/10 text-white sm:max-w-[400px]">
                                                <DialogHeader>
                                                    <DialogTitle>Başlangıç Tarihi Seç</DialogTitle>
                                                    <DialogDescription className="text-zinc-500">
                                                        Belirli bir tarihten itibaren oyuna başlayın. O günün gerçek BTC fiyat hareketleri yüklenecek.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-zinc-400">Tarih (YYYY-MM-DD)</Label>
                                                        <Input
                                                            type="date"
                                                            className="bg-zinc-900 border-white/10 text-white"
                                                            value={selectedDate}
                                                            onChange={(e) => setSelectedDate(e.target.value)}
                                                        />
                                                    </div>

                                                    <Button
                                                        onClick={handleDateStart}
                                                        disabled={!selectedDate}
                                                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                                                    >
                                                        <Gamepad2 className="w-4 h-4 mr-2" />
                                                        Bu Tarihle Başla
                                                    </Button>

                                                    <p className="text-[10px] text-zinc-600 text-center">
                                                        Seçilen tarihten itibaren 500 saatlik (~21 gün) veri yüklenecektir.
                                                    </p>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>

                                {/* Visual */}
                                <div className="relative w-full md:w-1/3 min-h-[200px] bg-gradient-to-br from-emerald-900/20 to-black/40 flex items-center justify-center border-l border-white/5">
                                    <div className="text-9xl opacity-10 font-black tracking-tighter select-none">
                                        PAM
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Recent Sessions */}
                        {sessions.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-zinc-500" />
                                    Son Oturumlar
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sessions.slice(0, 5).map((session) => (
                                        <Card
                                            key={session.id}
                                            className="border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md p-4"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] ${session.mode === 'random'
                                                        ? 'border-indigo-500/30 text-indigo-400'
                                                        : 'border-emerald-500/30 text-emerald-400'
                                                        }`}
                                                >
                                                    {session.mode === 'random' ? 'Rastgele' : 'Tarih'}
                                                </Badge>
                                                <span className="text-[10px] text-zinc-600">
                                                    {new Date(session.timestamp).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-zinc-500">PnL</span>
                                                    <span className={`text-sm font-mono font-bold ${session.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                                        }`}>
                                                        {session.pnl >= 0 ? '+' : ''}${session.pnl.toFixed(2)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-zinc-500">Getiri</span>
                                                    <span className={`text-xs font-mono ${session.returnPct >= 0 ? 'text-emerald-500' : 'text-rose-500'
                                                        }`}>
                                                        {session.returnPct >= 0 ? '+' : ''}{session.returnPct.toFixed(2)}%
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-zinc-500">İşlemler</span>
                                                    <span className="text-xs text-white">{session.totalTrades}</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-zinc-500">Kazanma</span>
                                                    <span className={`text-xs ${session.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                                                        }`}>
                                                        {session.winRate.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-zinc-600">
                                                {new Date(session.startDate).toLocaleDateString('tr-TR')} → {new Date(session.endDate).toLocaleDateString('tr-TR')}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Coming Soon Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-white/5 bg-[#0A0A0A]/30 backdrop-blur-md opacity-60 hover:opacity-100 transition-opacity">
                                <CardHeader>
                                    <CardTitle className="text-zinc-300">Prediction League</CardTitle>
                                    <CardDescription>Bir sonraki 4h mum kapanışını tahmin et.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="secondary" className="bg-white/5 text-zinc-500">ÇOK YAKINDA</Badge>
                                </CardContent>
                            </Card>

                            <Card className="border-white/5 bg-[#0A0A0A]/30 backdrop-blur-md opacity-60 hover:opacity-100 transition-opacity">
                                <CardHeader>
                                    <CardTitle className="text-zinc-300">Algo Arena</CardTitle>
                                    <CardDescription>Kendi botunu yaz ve diğer botlarla yarıştır.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="secondary" className="bg-white/5 text-zinc-500">ÇOK YAKINDA</Badge>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
