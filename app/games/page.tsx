"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Flame, Target } from "lucide-react";
import { Sidebar } from "@/components/altuq/layout/Sidebar";
import Link from "next/link";

export default function GamesPage() {
    return (
        <div className="flex h-screen w-full bg-[#020202] dark font-sans antialiased text-white selection:bg-indigo-500/30 overflow-hidden">
            {/* Reusing Altuq Sidebar for consistency */}
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

                        {/* Featured Game Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="col-span-1 md:col-span-2 border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md overflow-hidden relative group cursor-pointer hover:border-emerald-500/30 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col md:flex-row h-full">
                                    <div className="p-8 flex flex-col justify-center gap-4 flex-1">
                                        <Badge variant="outline" className="w-fit border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                                            <Flame className="w-3 h-3 mr-1" /> POPÜLER
                                        </Badge>
                                        <div>
                                            <CardTitle className="text-2xl mb-2 text-white">Price Action Master</CardTitle>
                                            <CardDescription className="text-zinc-400 text-base">
                                                Geçmiş grafik verileri üzerinde al/sat yaparak en yüksek PnL'e ulaşmaya çalış.
                                                Gerçek piyasa koşullarında risksiz antrenman.
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                                            <div className="flex items-center gap-1">
                                                <Trophy className="w-4 h-4 text-amber-500" />
                                                <span>Ödül Havuzu: 1000 USDT</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Target className="w-4 h-4 text-indigo-500" />
                                                <span>Zorluk: Orta</span>
                                            </div>
                                        </div>
                                        <div className="relative z-20">
                                            <Link href="/games/play">
                                                <Button className="w-fit mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                                                    <Gamepad2 className="w-4 h-4 mr-2" />
                                                    Oyna
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="relative w-full md:w-1/3 min-h-[200px] bg-gradient-to-br from-emerald-900/20 to-black/40 flex items-center justify-center border-l border-white/5">
                                        {/* Mock Game Visual */}
                                        <div className="text-9xl opacity-10 font-black tracking-tighter select-none">
                                            GAME
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Coming Soon Cards */}
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
