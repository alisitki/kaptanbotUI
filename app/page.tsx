
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4">
            <div className="grid grid-cols-1 gap-6 max-w-md w-full">
                <Link href="/tradingbotv1" className="block group">
                    <Card className="bg-zinc-900/50 border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                Trading Bot V1
                                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 group-hover:translate-x-1 duration-300" />
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Advanced crypto trading bot dashboard. <br />
                                Real-time signals • Portfolio Management • Risk Control
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500">Open Dashboard</Button>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
