
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api/api";
import { useBotStore } from "@/lib/store";
import { toast } from "sonner";
import {
    LayoutDashboard,
    Radio,
    ScanEye,
    PieChart,
    History,
    Settings,
    LogOut,
    LogIn,
    Shield,
    GitBranch,
    Gamepad2,
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useBotStore();

    const handleLogout = async () => {
        await logout();
        router.replace('/tradingbotv1/login');
    };

    const navItems = [
        { name: "Overview", href: "/tradingbotv1/overview", icon: LayoutDashboard },
        { name: "Strategy Builder", href: "/tradingbotv1/strategies/builder", icon: GitBranch },
        { name: "Signals", href: "/tradingbotv1/signals", icon: Radio },
        { name: "Watch", href: "/tradingbotv1/watch", icon: ScanEye },
        { name: "Portfolio", href: "/tradingbotv1/portfolio", icon: PieChart },
        { name: "Trades", href: "/tradingbotv1/trades", icon: History },
        { name: "Settings", href: "/tradingbotv1/settings", icon: Settings },
        { name: "Admin", href: "/tradingbotv1/admin", icon: Shield },
        { name: "Trading Dojo", href: "/games", icon: Gamepad2, guest: true },
    ];

    return (
        <div className="flex h-screen w-64 flex-col items-center justify-between border-r border-white/5 bg-[#050505] py-4 z-50 fixed left-0 top-0">
            {/* Brand */}
            <div className="flex w-full items-center px-6 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-purple-500/20">
                    Bot
                </div>
                <span className="text-lg font-bold tracking-tight text-white ml-3">
                    TradingBotV1
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex w-full flex-col gap-2 px-4 flex-1">
                {navItems.map((item) => {
                    const isProtected = !item.guest && !user;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                    return (
                        <Link
                            key={item.href}
                            href={isProtected ? '#' : item.href}
                            onClick={(e) => {
                                if (isProtected) {
                                    e.preventDefault();
                                    toast.error("Giriş Gerekli", {
                                        description: "Bu özelliği kullanmak için giriş yapmalısınız."
                                    });
                                }
                            }}
                            className={cn(
                                "flex h-10 w-full items-center rounded-lg px-3 transition-colors duration-200",
                                isActive
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                                isProtected && "opacity-50 cursor-not-allowed grayscale"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-indigo-400")} />
                            <span className={cn(
                                "ml-3 text-sm font-medium",
                                isActive ? "text-white" : "text-zinc-400"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="flex w-full flex-col gap-2 px-4">
                <div className="h-px w-full bg-white/5 mx-auto" />
                {user ? (
                    <button
                        onClick={handleLogout}
                        className="flex h-10 w-full items-center rounded-lg px-3 text-red-500/70 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-500"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="ml-3 text-sm font-medium">
                            Logout
                        </span>
                    </button>
                ) : (
                    <Link
                        href="/tradingbotv1/login"
                        className="flex h-10 w-full items-center rounded-lg px-3 text-emerald-500/70 transition-colors duration-200 hover:bg-emerald-500/10 hover:text-emerald-500"
                    >
                        <LogIn className="h-5 w-5 shrink-0" />
                        <span className="ml-3 text-sm font-medium">
                            Login
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );
}
