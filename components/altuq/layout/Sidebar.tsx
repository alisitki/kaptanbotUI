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
        <div className="flex h-screen w-20 flex-col items-center justify-between border-r border-white/5 bg-[#050505] py-4 transition-all duration-300 hover:w-64 group z-50 fixed left-0 top-0">
            {/* Brand */}
            <div className="flex w-full items-center justify-center group-hover:justify-start group-hover:px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xl shadow-lg shadow-purple-500/20">
                    a
                </div>
                <span className="hidden text-xl font-bold tracking-tight text-white ml-3 transition-opacity duration-300 group-hover:block whitespace-nowrap">
                    altuq
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex w-full flex-col gap-2 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex h-10 w-full items-center justify-center rounded-lg transition-all duration-200 group-hover:justify-start group-hover:px-3",
                                isActive
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "text-indigo-400")} />
                            <span className={cn(
                                "hidden ml-3 text-sm font-medium transition-opacity duration-300 group-hover:block whitespace-nowrap",
                                isActive ? "text-white" : "text-zinc-400"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="flex w-full flex-col gap-2 px-2">
                <Link
                    href="/altuq/settings"
                    className={cn(
                        "flex h-10 w-full items-center justify-center rounded-lg text-zinc-500 transition-all duration-200 hover:bg-white/5 hover:text-zinc-300 group-hover:justify-start group-hover:px-3",
                        pathname === "/altuq/settings" && "bg-white/10 text-white"
                    )}
                >
                    <Settings className="h-5 w-5" />
                    <span className="hidden ml-3 text-sm font-medium transition-opacity duration-300 group-hover:block">
                        Ayarlar
                    </span>
                </Link>
                <div className="h-px w-full bg-white/5 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                <button className="flex h-10 w-full items-center justify-center rounded-lg text-red-500/70 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 group-hover:justify-start group-hover:px-3">
                    <LogOut className="h-5 w-5" />
                    <span className="hidden ml-3 text-sm font-medium transition-opacity duration-300 group-hover:block">
                        Çıkış Yap
                    </span>
                </button>
            </div>
        </div>
    );
}
