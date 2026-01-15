"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function StrategyForm() {
    const [supports, setSupports] = useState<number[]>([90500, 89500, 87500]);
    const [resistances, setResistances] = useState<number[]>([93500, 95500, 99000]);

    const removeSupport = (idx: number) => setSupports(supports.filter((_, i) => i !== idx));
    const removeResistance = (idx: number) => setResistances(resistances.filter((_, i) => i !== idx));

    const handleSave = () => {
        toast.success("Strategy configuration saved", {
            description: "New rules applied to bot instance."
        });
    };

    return (
        <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle>Core Units</CardTitle>
                    <CardDescription>Base position sizing and sizing increments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>Unit Notional (USDT)</Label>
                            <span className="text-sm font-mono text-emerald-500">$1,000</span>
                        </div>
                        <Slider defaultValue={[1000]} max={5000} step={100} className="w-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Min Step Units</Label>
                            <Input type="number" defaultValue={1} className="bg-black/20 border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Units</Label>
                            <Input type="number" defaultValue={20} className="bg-black/20 border-zinc-800" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle>Levels & Zones</CardTitle>
                    <CardDescription>Key price levels for rebalancing events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Flip Level (Bias Switch)</Label>
                        <div className="relative">
                            <Input defaultValue={91400} className="pl-9 bg-black/20 border-zinc-800 font-mono text-amber-500" />
                            <div className="absolute left-3 top-2.5 text-zinc-500 text-xs">PX</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-zinc-400 uppercase tracking-wider">Supports (Buy Zone)</Label>
                        <div className="flex flex-wrap gap-2 p-3 bg-black/20 rounded-lg border border-zinc-800 min-h-[50px]">
                            {supports.map((lvl, i) => (
                                <Badge key={i} variant="secondary" className="bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 cursor-default pr-1.5">
                                    {lvl}
                                    <button onClick={() => removeSupport(i)} className="ml-1 hover:text-white"><X className="h-3 w-3" /></button>
                                </Badge>
                            ))}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full border border-dashed border-zinc-700 hover:border-zinc-500">
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs text-zinc-400 uppercase tracking-wider">Resistances (Sell Zone)</Label>
                        <div className="flex flex-wrap gap-2 p-3 bg-black/20 rounded-lg border border-zinc-800 min-h-[50px]">
                            {resistances.map((lvl, i) => (
                                <Badge key={i} variant="secondary" className="bg-red-950/30 text-red-400 hover:bg-red-900/40 cursor-default pr-1.5">
                                    {lvl}
                                    <button onClick={() => removeResistance(i)} className="ml-1 hover:text-white"><X className="h-3 w-3" /></button>
                                </Badge>
                            ))}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full border border-dashed border-zinc-700 hover:border-zinc-500">
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Logic & Bias</CardTitle>
                        <Badge variant="outline" className="text-xs border-zinc-700">HEDGE MODE</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto Bias Switch</Label>
                            <p className="text-xs text-zinc-500">Switch bias when flip level breached</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Rebalance Long</Label>
                            <Select defaultValue="-1">
                                <SelectTrigger className="bg-black/20 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-1">Sell 1 Unit</SelectItem>
                                    <SelectItem value="-2">Sell 2 Units</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Rebalance Short</Label>
                            <Select defaultValue="+1">
                                <SelectTrigger className="bg-black/20 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="+1">Buy 1 Unit</SelectItem>
                                    <SelectItem value="+2">Buy 2 Units</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="sticky bottom-6 z-10">
                <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                </Button>
                <div className="text-center mt-2">
                    <Badge variant="outline" className="text-[10px] text-zinc-500 border-none bg-black/40">Autosaved 12s ago</Badge>
                </div>
            </div>
        </div>
    );
}
