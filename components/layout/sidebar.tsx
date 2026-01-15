"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    LineChart,
    Target,
    ShieldCheck,
    FileClock,
    Settings,
    Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
    const pathname = usePathname();

    const routes = [
        { href: "/", label: "Overview", icon: LayoutDashboard },
        { href: "/strategy", label: "Strategy", icon: Target },
        { href: "/positions", label: "Positions", icon: LineChart },
        { href: "/risk", label: "Risk", icon: ShieldCheck },
        { href: "/logs", label: "Logs", icon: FileClock },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="flex w-64 flex-col border-r bg-[#09090b] h-screen sticky top-0">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">HedgeBot</h1>
                </div>

                <nav className="flex flex-col gap-1">
                    {routes.map((route) => {
                        const isActive = pathname === route.href;
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:text-white",
                                    isActive
                                        ? "bg-white/5 text-white shadow-sm"
                                        : "text-zinc-400 hover:bg-white/5"
                                )}
                            >
                                <route.icon className="h-4 w-4" />
                                {route.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-white/5 bg-black/20">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-mono">LIVE CONNECTION</span>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="mt-2 flex justify-between items-center">
                    <Badge variant="outline" className="border-emerald-900/50 text-emerald-500 bg-emerald-950/30 text-[10px] h-5">
                        VPS-EAST-1
                    </Badge>
                    <span className="text-xs text-zinc-600 font-mono">41ms</span>
                </div>
            </div>
        </div>
    );
}
