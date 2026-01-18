
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Watch } from "@/lib/api/client/types";
import { cn } from "@/lib/utils";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api/api";
import { useBotStore } from "@/lib/store";

interface WatchTableProps {
    data: Watch[] | undefined;
    isLoading?: boolean;
    compact?: boolean;
}

export function WatchTable({ data, isLoading, compact }: WatchTableProps) {
    const handleSell = async (id: string, symbol: string) => {
        try {
            await apiPost(`/v1/watches/${id}/sell`, {});

            toast.success(`${symbol} için manuel satış tetiklendi.`, {
                description: "Satış emri iletildi."
            });

            // Trigger refresh
            useBotStore.getState().fetchWatches();
            useBotStore.getState().fetchState();

        } catch (error: any) {
            toast.error("İşlem satılamadı!", { description: error.message });
        }
    };

    if (isLoading) {
        return <div className="text-zinc-500 text-sm p-4">Yükleniyor...</div>;
    }

    if (!data || data.length === 0) {
        return (
            <Card className="border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center p-8 text-zinc-500">
                    <Ban className="h-8 w-8 mb-2 opacity-50" />
                    <p>Aktif takip bulunmuyor.</p>
                </CardContent>
            </Card>
        );
    }

    const Wrapper = compact ? "div" : Card;

    return (
        <Wrapper className={cn(!compact && "border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm")}>
            {!compact && (
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-white flex items-center justify-between">
                        Active Watches
                        <Badge variant="outline" className="text-zinc-400">{data.length} Running</Badge>
                    </CardTitle>
                </CardHeader>
            )}
            <div className={cn(!compact && "p-0")}>
                <Table>
                    <TableHeader className="hover:bg-transparent">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-zinc-500 text-xs uppercase w-[120px]">Symbol</TableHead>
                            <TableHead className="text-zinc-500 text-xs uppercase text-right">Entry</TableHead>
                            <TableHead className="text-zinc-500 text-xs uppercase text-right">Current</TableHead>
                            {!compact && <TableHead className="text-zinc-500 text-xs uppercase text-right">Target (TP)</TableHead>}
                            <TableHead className="text-zinc-500 text-xs uppercase text-center w-[100px]">Status</TableHead>
                            <TableHead className="text-zinc-500 text-xs uppercase text-right">PnL (u)</TableHead>
                            <TableHead className="text-zinc-500 text-xs uppercase text-right w-[100px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((watch) => {
                            const pnlIsPositive = watch.pnl_percent >= 0;
                            return (
                                <TableRow key={watch.id} className="border-white/5 hover:bg-white/5 data-[state=sold]:opacity-50 transition-colors">
                                    <TableCell className="font-medium text-white">
                                        <div className="flex flex-col">
                                            <span>{watch.symbol}</span>
                                            <span className="text-[10px] text-zinc-500">{watch.tp_mode === 'TRAILING' ? 'Trailing' : 'Fixed'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-400 font-mono text-sm">{watch.entry_price.toFixed(watch.entry_price < 1 ? 4 : 2)}</TableCell>
                                    <TableCell className="text-right text-white font-mono text-sm">{watch.current_price.toFixed(watch.entry_price < 1 ? 4 : 2)}</TableCell>
                                    {!compact && (
                                        <TableCell className="text-right text-indigo-400 font-mono text-sm">
                                            {watch.target_tp_price?.toFixed(watch.entry_price < 1 ? 4 : 2)}
                                        </TableCell>
                                    )}
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "border-0 bg-opacity-20 text-[10px] px-2 py-0.5",
                                                watch.status === 'WATCHING' && "bg-blue-500/10 text-blue-500",
                                                watch.status === 'READY_TO_SELL' && "bg-amber-500/10 text-amber-500 animate-pulse",
                                                watch.status === 'SOLD' && "bg-zinc-500/10 text-zinc-500",
                                            )}
                                        >
                                            {watch.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className={cn(
                                            "flex items-center justify-end gap-1 font-mono text-sm font-medium",
                                            pnlIsPositive ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            <span>{watch.pnl_unrealized.toFixed(2)}$</span>
                                            <span className="text-xs opacity-70">({watch.pnl_percent.toFixed(2)}%)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {watch.status !== 'SOLD' && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-6 text-[10px] bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50"
                                                onClick={() => handleSell(watch.id, watch.symbol)}
                                            >
                                                Sell
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </Wrapper>
    );
}
