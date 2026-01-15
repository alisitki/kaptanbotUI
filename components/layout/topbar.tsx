"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Bell, PauseCircle, TriangleAlert, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// ... imports
// ... imports
import { useState, useEffect } from "react";
import { DialogTitle } from "@/components/ui/dialog";

export function Topbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showLasers, setShowLasers] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOpen) {
            timer = setTimeout(() => {
                setShowLasers(true);
            }, 1000);
        } else {
            setShowLasers(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    return (
        <div className="flex h-16 items-center justify-between border-b bg-[#09090b]/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-[#09090b]/60 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <Select defaultValue="BTCUSDT">
                    <SelectTrigger className="w-[240px] h-9 border-white/10 bg-white/5 text-white font-medium focus:ring-primary/50">
                        <SelectValue placeholder="Select symbol" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BTCUSDT">BTCUSDT Perpetual</SelectItem>
                        <SelectItem value="ETHUSDT">ETHUSDT Perpetual</SelectItem>
                        <SelectItem value="SOLUSDT">SOLUSDT Perpetual</SelectItem>
                    </SelectContent>
                </Select>

                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-0">
                    MARKET OPEN
                </Badge>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="h-9 gap-2 border-amber-500/20 text-amber-500 hover:text-amber-400 hover:bg-amber-950/30">
                    <PauseCircle className="h-4 w-4" />
                    Pause Strategy
                </Button>

                <Button variant="destructive" size="sm" className="h-9 gap-2 bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 shadow-none">
                    <TriangleAlert className="h-4 w-4" />
                    PANIC CLOSE
                </Button>

                <div className="h-6 w-px bg-white/10 mx-2" />

                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Bell className="h-4 w-4 text-zinc-400" />
                </Button>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Avatar className="h-8 w-8 border border-white/10 cursor-pointer hover:scale-110 transition-transform">
                            <AvatarImage src="/avatar.png" />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md border-none bg-transparent shadow-none p-0 flex flex-col items-center justify-center overflow-hidden min-h-[500px]">
                        <DialogTitle className="sr-only">Avatar Laser Mode</DialogTitle>

                        <div className="relative group">
                            {/* Avatar Image */}
                            <img
                                src="/avatar.png"
                                alt="Avatar"
                                className="w-96 h-96 rounded-full border-4 border-red-500/50 shadow-[0_0_100px_rgba(220,38,38,0.5)] animate-in zoom-in-50 duration-500 object-cover"
                            />

                            {/* LASER EYES EFFECT */}
                            {showLasers && (
                                <>
                                    {/* Left Eye Laser (Fixed: 35% 43%) */}
                                    <div
                                        className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_10px_rgba(255,0,0,0.8)] z-20 animate-in fade-in duration-300"
                                        style={{ top: '43%', left: '35%' }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[50px] bg-red-500/80 -translate-y-1/2 -translate-x-0 blur-md origin-left animate-laser-scan" />
                                        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[20px] bg-white -translate-y-1/2 -translate-x-0 blur-sm origin-left animate-laser-scan" />
                                    </div>

                                    {/* Right Eye Laser (Fixed: 55% 43%) */}
                                    <div
                                        className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_10px_rgba(255,0,0,0.8)] z-20 animate-in fade-in duration-300"
                                        style={{ top: '43%', left: '55%' }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[50px] bg-red-500/80 -translate-y-1/2 -translate-x-0 blur-md origin-left animate-laser-scan" />
                                        <div className="absolute top-1/2 left-1/2 w-[1000px] h-[20px] bg-white -translate-y-1/2 -translate-x-0 blur-sm origin-left animate-laser-scan" />
                                    </div>
                                </>
                            )}

                            {/* Intense Shake Effect Overlay - Also delayed to match lasers */}
                            {showLasers && (
                                <div className="absolute inset-0 rounded-full ring-4 ring-offset-4 ring-offset-black ring-red-600 animate-in fade-in duration-300" />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
