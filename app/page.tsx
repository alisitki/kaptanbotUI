
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2 } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                {/* Trading Bot Card */}
                <Link href="/tradingbotv1" className="block group">
                    <Card className="bg-zinc-900/50 border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100" />
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    Bot V1
                                </span>
                                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all text-indigo-400 group-hover:translate-x-1 duration-300" />
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Advanced crypto trading bot dashboard. <br />
                                Real-time signals • Portfolio Management
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500">Open Dashboard</Button>
                        </CardContent>
                    </Card>
                </Link>

                {/* Game Card */}
                <Link href="/games" className="block group">
                    <Card className="bg-zinc-900/50 border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-50 group-hover:opacity-100" />
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    Price Action Master
                                </span>
                                <Gamepad2 className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all text-emerald-400 group-hover:translate-x-1 duration-300" />
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Professional trading simulator game. <br />
                                Practice execution • Master psychology
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-500">Play Now</Button>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
