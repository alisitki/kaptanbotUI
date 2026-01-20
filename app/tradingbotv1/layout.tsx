
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/tradingbotv1/layout/Sidebar";
import { Topbar } from "@/components/tradingbotv1/layout/Topbar";
import { useBotStore } from "@/lib/store";

export default function TradingBotLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const { start, stop, checkAuth, user, hasBinanceKeys, initialized } = useBotStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const initAuth = async () => {
            const auth = await checkAuth();
            const isLoginPage = pathname.includes('/login');
            const isOnboardingPage = pathname.includes('/onboarding');

            if (!auth) {
                // Not logged in
                if (!isLoginPage) {
                    router.replace('/tradingbotv1/login');
                }
                stop();
            } else {
                // Logged in
                if (!auth.has_binance_keys && !isOnboardingPage && !isLoginPage) {
                    router.replace('/tradingbotv1/onboarding');
                } else if (auth.has_binance_keys && (isLoginPage || isOnboardingPage)) {
                    router.replace('/tradingbotv1/overview');
                }
                start();
            }
        };

        initAuth();
    }, [mounted, pathname, checkAuth, start, stop, router]);

    if (!mounted || !initialized) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-zinc-500 text-sm font-medium">Verifying session...</span>
                </div>
            </div>
        );
    }

    const isAuthPage = pathname.includes('/login') || pathname.includes('/onboarding');

    if (isAuthPage) {
        return <>{children}</>;
    }

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
