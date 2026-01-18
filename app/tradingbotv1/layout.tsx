
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/lib/api/runtime";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sidebar } from "@/components/tradingbotv1/layout/Sidebar";
import { Topbar } from "@/components/tradingbotv1/layout/Topbar";
import { useBotStore } from "@/lib/store";

export default function TradingBotLayout({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const [tokenInput, setTokenInput] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const { start, stop, accessDenied, accessDeniedReason } = useBotStore();

    useEffect(() => {
        // Check token on mount and path change
        const token = getToken();
        if (token) {
            setAuthorized(true);
            start();
        } else {
            setAuthorized(false);
            stop();
        }
    }, [pathname]);

    const handleSaveToken = () => {
        if (tokenInput.trim().length > 0) {
            localStorage.setItem('tbv1_token', tokenInput.trim());
            setAuthorized(true);
            start();
            router.refresh(); // Refund state
        }
    };

    if (!authorized) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-zinc-900 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Admin Access</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Input
                                type="password"
                                placeholder="Access Token"
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                className="bg-black/50 border-white/10 text-white"
                            />
                        </div>
                        <Button onClick={handleSaveToken} className="w-full bg-indigo-600 hover:bg-indigo-500">
                            Enter
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Access Denied / IP Blocked Screen
    if (accessDenied && accessDeniedReason === 'IP_NOT_ALLOWED') {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 text-center">
                <div className="max-w-md space-y-4">
                    <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
                    <p className="text-zinc-400">Your IP address is not allowed to access this resource. Please check your VPN or Allowlist settings.</p>
                    <Button variant="outline" onClick={() => window.location.reload()} className="bg-white/5 border-white/10 text-white">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }
    // If TOKEN_INVALID, loop above (authorized=false usually handles it if we clear token, but store state might persist)
    // Actually, if we clear token, useEffect will run and setAuthorized(false).

    return (
        <div className="flex h-screen w-full bg-[#020202] dark font-sans antialiased text-white selection:bg-indigo-500/30 overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col pl-64 h-full transition-all duration-300">
                <Topbar />
                <main className="flex-1 h-full overflow-y-auto p-6 md:p-8 relative scroll-smooth">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none z-0" />

                    <div className="relative z-10 pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
