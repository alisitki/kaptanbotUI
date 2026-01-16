"use client";

import { Bell, Wifi, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#050505]/80 px-6 backdrop-blur-md">
            {/* Left Area: Symbol & Status */}
            <div className="flex items-center gap-6">
                <Select defaultValue="BTCUSDT">
                    <SelectTrigger className="w-[180px] border-white/10 bg-white/5 text-white focus:ring-indigo-500/20 font-medium">
                        <SelectValue placeholder="Symbol Seç" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#121212] text-white">
                        <SelectItem value="BTCUSDT">BTCUSDT</SelectItem>
                        <SelectItem value="ETHUSDT">ETHUSDT</SelectItem>
                        <SelectItem value="SOLUSDT">SOLUSDT</SelectItem>
                        <SelectItem value="AVAXUSDT">AVAXUSDT</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1">
                    <Wifi className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs font-mono text-emerald-500 font-medium tracking-tight">34ms</span>
                </div>
            </div>

            {/* Right Area: Actions, Mode, Profile */}
            <div className="flex items-center gap-4">

                {/* Paper/Live Switch */}
                <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 mr-2">
                    <span className="text-xs font-medium text-zinc-400">PAPER</span>
                    <Switch className="data-[state=checked]:bg-indigo-500" />
                    <span className="text-xs font-medium text-white/50">LIVE</span>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white hover:bg-white/5">
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-[#050505]" />
                    <Bell className="h-5 w-5" />
                </Button>

                {/* Profile */}
                <div className="h-6 w-px bg-white/10" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">Kaptan</p>
                                <p className="text-xs text-zinc-500">Pro Plan</p>
                            </div>
                            <Avatar className="h-9 w-9 border border-white/10">
                                <AvatarImage src="/avatar.png" />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">KP</AvatarFallback>
                            </Avatar>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#121212] text-zinc-200">
                        <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">Profil</DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">Faturalandırma</DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">API Anahtarları</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer">
                            Çıkış Yap
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </header>
    );
}
