"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function RiskPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Risk Management</h2>
                    <p className="text-zinc-400">Global safety limits and circuit breakers.</p>
                </div>

                <Select defaultValue="balanced">
                    <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="financial">Conservative</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-amber-500" />
                            Hard Limits
                        </CardTitle>
                        <CardDescription>If breached, the bot will enter PANIC (Close Only) mode.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>Max Leverage</Label>
                                <div className="flex items-center gap-4">
                                    <Slider defaultValue={[10]} max={50} step={1} className="flex-1" />
                                    <span className="font-mono text-white w-12 text-right">10x</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label>Max Notional Exposure</Label>
                                <Input defaultValue={25000} type="number" className="bg-black/20 border-zinc-800" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Max Daily Loss</Label>
                                    <p className="text-xs text-zinc-500">Stop trading if loss exceeds threshold</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-zinc-400">-$500</span>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            Execution Guards
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Slippage Tolerance</Label>
                                <p className="text-xs text-zinc-500">Reject orders with high slippage</p>
                            </div>
                            <Select defaultValue="0.5">
                                <SelectTrigger className="w-[100px] bg-black/20 border-zinc-800"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.1">0.1%</SelectItem>
                                    <SelectItem value="0.5">0.5%</SelectItem>
                                    <SelectItem value="1.0">1.0%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Spread Filter</Label>
                                <p className="text-xs text-zinc-500">Pause if bid-ask spread is too wide</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Funding Rate Guard</Label>
                                <p className="text-xs text-zinc-500">Avoid positions against high funding</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
