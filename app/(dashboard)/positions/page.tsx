"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function PositionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Positions & Orders</h2>
                <p className="text-zinc-400">Real-time position monitoring and open order management.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Long Position */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-500 flex items-center gap-2">
                            <ArrowUp className="h-4 w-4" /> LONG EXPOSURE
                        </CardTitle>
                        <Badge variant="outline" className="border-emerald-900/50 text-emerald-500 bg-emerald-950/20">3.0 UNITS</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-4">$3,240.50</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-zinc-500">Entry</p>
                                <p className="font-mono text-zinc-300">92,450.0</p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500">PnL</p>
                                <p className="font-mono text-emerald-500">+$124.50</p>
                            </div>
                            <div>
                                <p className="text-zinc-500">Liq. Price</p>
                                <p className="font-mono text-amber-500">88,200.0</p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500">Margin</p>
                                <p className="font-mono text-zinc-300">Cross</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Short Position */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
                            <ArrowDown className="h-4 w-4" /> SHORT EXPOSURE
                        </CardTitle>
                        <Badge variant="outline" className="border-red-900/50 text-red-500 bg-red-950/20">15.0 UNITS</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-4">$18,420.20</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-zinc-500">Entry</p>
                                <p className="font-mono text-zinc-300">93,100.0</p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500">PnL</p>
                                <p className="font-mono text-red-500">-$456.64</p>
                            </div>
                            <div>
                                <p className="text-zinc-500">Liq. Price</p>
                                <p className="font-mono text-amber-500">98,500.0</p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500">Margin</p>
                                <p className="font-mono text-zinc-300">Cross</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="open" className="w-full">
                <TabsList className="bg-black/40 border border-zinc-800">
                    <TabsTrigger value="open">Open Orders</TabsTrigger>
                    <TabsTrigger value="history">Order History</TabsTrigger>
                </TabsList>
                <TabsContent value="open" className="mt-4">
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-800 hover:bg-transparent">
                                        <TableHead>Symbol</TableHead>
                                        <TableHead>Side</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="text-right">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="border-zinc-800 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">BTCUSDT</TableCell>
                                        <TableCell><span className="text-emerald-500">BUY</span></TableCell>
                                        <TableCell className="text-zinc-400">LIMIT</TableCell>
                                        <TableCell className="font-mono">90,500.0</TableCell>
                                        <TableCell>1.5 BTC</TableCell>
                                        <TableCell className="text-right text-zinc-500">12:44:02</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history">
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardContent className="p-6 text-center text-zinc-500">
                            No recent history.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
