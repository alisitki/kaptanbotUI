"use client";

import useSWR from "swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trade } from "@/lib/altuq/types";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AltuqTradesPage() {
    const { data: trades, isLoading } = useSWR<Trade[]>('/api/altuq/trades', fetcher, { refreshInterval: 5000 });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">İşlem Geçmişi</h1>
                <p className="text-zinc-400">Gerçekleşen alım/satım işlemleri ve detayları.</p>
            </div>

            <Separator className="bg-white/10" />

            <Card className="border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-zinc-500">Zaman</TableHead>
                            <TableHead className="text-zinc-500">Parite</TableHead>
                            <TableHead className="text-zinc-500">Yön</TableHead>
                            <TableHead className="text-right text-zinc-500">Fiyat</TableHead>
                            <TableHead className="text-right text-zinc-500">Miktar (Adet)</TableHead>
                            <TableHead className="text-right text-zinc-500">Hacim (USDT)</TableHead>
                            <TableHead className="text-right text-zinc-500">Komisyon</TableHead>
                            <TableHead className="text-right text-zinc-500">PnL</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-zinc-500 py-8">Yükleniyor...</TableCell>
                            </TableRow>
                        ) : trades?.map((trade) => (
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
