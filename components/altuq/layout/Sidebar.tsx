"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Radio,
    ScanEye,
    PieChart,
    History,
    Settings,
    LogOut
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Genel Bakış", href: "/altuq", icon: LayoutDashboard },
        { name: "Sinyaller", href: "/altuq/signals", icon: Radio },
        { name: "Takip & Hedef", href: "/altuq/watch", icon: ScanEye },
        { name: "Portföy", href: "/altuq/portfolio", icon: PieChart },
        { name: "İşlemler", href: "/altuq/trades", icon: History },
    ];

    return (
        <div className="flex h-screen w-64 flex-col items-center justify-between border-r border-white/5 bg-[#050505] py-4 z-50 fixed left-0 top-0">
            {/* Brand */}
            <div className="flex w-full items-center px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xl shadow-lg shadow-purple-500/20">
                    a
                </div>
                <span className="text-xl font-bold tracking-tight text-white ml-3">
                    altuq
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex w-full flex-col gap-2 px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex h-10 w-full items-center rounded-lg px-3 transition-colors duration-200",
                                isActive
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
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
                <Link
                    href="/altuq/settings"
                    className={cn(
                        "flex h-10 w-full items-center rounded-lg px-3 text-zinc-500 transition-colors duration-200 hover:bg-white/5 hover:text-zinc-300",
                        pathname === "/altuq/settings" && "bg-white/10 text-white"
                    )}
                >
                    <Settings className="h-5 w-5 shrink-0" />
                    <span className="ml-3 text-sm font-medium">
                        Ayarlar
                    </span>
                </Link>
                <div className="h-px w-full bg-white/5 mx-auto" />
                <button className="flex h-10 w-full items-center rounded-lg px-3 text-red-500/70 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-500">
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="ml-3 text-sm font-medium">
                        Çıkış Yap
                    </span>
                </button>
            </div>
        </div>
    );
}
