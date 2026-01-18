
"use client";

import { useBotStore } from "@/lib/store";
import { WatchTable } from "@/components/tradingbotv1/watch/WatchTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { apiPost } from "@/lib/api/api";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function WatchPage() {
    const { watches } = useBotStore();
    const [symbol, setSymbol] = useState("BTCUSDT");
    const [amount, setAmount] = useState(100);
    const [tpPercent, setTpPercent] = useState(2.0);
    const [tpMode, setTpMode] = useState("TRAILING");

    const handleCreate = async () => {
        try {
            const payload = {
                client_order_id: crypto.randomUUID(),
                symbol: symbol.toUpperCase(),
                amount: Number(amount),
                tp_mode: tpMode,
                tp_percent: Number(tpPercent),
                trailing_step_percent: tpMode === 'TRAILING' ? 0.5 : 0
            };

            await apiPost('/v1/watches', payload);
            toast.success("Watch created successfully");
        } catch (e: any) {
            toast.error("Failed to create watch", { description: e.message });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Watch Management</h1>
                    <p className="text-zinc-400">Manage active trading positions and strategies.</p>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                {/* Create Form */}
                <Card className="w-full xl:w-[350px] bg-[#0A0A0A]/50 border-white/5 h-fit shrink-0">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2 text-base">
                            <Plus className="h-4 w-4 text-indigo-500" />
                            Create New Strategy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase">Symbol</Label>
                            <Input value={symbol} onChange={e => setSymbol(e.target.value)} className="bg-black/20 border-white/10 text-white font-mono" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase">Amount (USDT)</Label>
                            <div className="relative">
                                <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="bg-black/20 border-white/10 text-white font-mono" />
                                <span className="absolute right-3 top-2.5 text-xs text-zinc-500">USDT</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase">TP Mode</Label>
                            <Select value={tpMode} onValueChange={setTpMode}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="FIXED">Fixed Target</SelectItem>
                                    <SelectItem value="TRAILING">Trailing Stop</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase">Target Profit %</Label>
                            <div className="relative">
                                <Input type="number" step="0.1" value={tpPercent} onChange={e => setTpPercent(Number(e.target.value))} className="bg-black/20 border-white/10 text-white font-mono" />
                                <span className="absolute right-3 top-2.5 text-xs text-zinc-500">%</span>
                            </div>
                        </div>
                        <Button onClick={handleCreate} className="w-full bg-indigo-600 hover:bg-indigo-500 mt-2">
                            Start Watching
                        </Button>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="flex-1 min-w-0">
                    <WatchTable data={watches} />
                </div>
            </div>
        </div>
    );
}
