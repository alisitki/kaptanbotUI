
"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/api";
import { Trade } from "@/lib/api/client/types";
import { useBotStore } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function TradesPage() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const { events } = useBotStore();

    const fetchTrades = async () => {
        try {
            const data = await apiGet<Trade[]>('/v1/trades');
            setTrades(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and Refetch on new SSE events
    useEffect(() => {
        fetchTrades();
    }, [events]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Trade History</h1>
                <p className="text-zinc-400">Execution Log</p>
            </div>

            <Card className="border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-zinc-500">Date</TableHead>
                            <TableHead className="text-zinc-500">Symbol</TableHead>
                            <TableHead className="text-zinc-500">Side</TableHead>
                            <TableHead className="text-right text-zinc-500">Price</TableHead>
                            <TableHead className="text-right text-zinc-500">Qty</TableHead>
                            <TableHead className="text-right text-zinc-500">Notional</TableHead>
                            <TableHead className="text-right text-zinc-500">Fee</TableHead>
                            <TableHead className="text-right text-zinc-500">PnL</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-zinc-500 py-8">Loading...</TableCell>
                            </TableRow>
                        ) : trades.map((trade) => (
                            <TableRow key={trade.id} className="border-white/5 hover:bg-white/5">
                                <TableCell className="text-zinc-400 font-mono text-xs">
                                    {new Date(trade.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell className="font-medium text-white">{trade.symbol}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "border-0 px-2 py-0.5 font-bold",
                                        trade.side === 'BUY' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                    )}>
                                        {trade.side}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono text-zinc-300">{trade.price.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono text-zinc-400">{trade.qty}</TableCell>
                                <TableCell className="text-right font-mono text-zinc-300">${trade.notional.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono text-zinc-500 text-xs">${trade.fee}</TableCell>
                                <TableCell className={cn(
                                    "text-right font-mono font-medium",
                                    !trade.pnl ? "text-zinc-500" : trade.pnl > 0 ? "text-emerald-500" : "text-rose-500"
                                )}>
                                    {trade.pnl !== undefined ? `$${trade.pnl}` : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
