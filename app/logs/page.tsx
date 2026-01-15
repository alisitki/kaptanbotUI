"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Bug, Info, TriangleAlert } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import useSWR from "swr";
import { DecisionLog } from "@/lib/types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LogsPage() {
    const { data: logs } = useSWR<DecisionLog[]>('/api/mock/decisions', fetcher);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">System Logs</h2>
                    <p className="text-zinc-400">Audit trail of all bot decisions and events.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input placeholder="Search logs..." className="pl-9 bg-zinc-900 border-zinc-800" />
                    </div>
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            <Card className="flex-1 bg-zinc-900/50 border-zinc-800 overflow-hidden flex flex-col">
                <CardHeader className="py-4 border-b border-zinc-800">
                    <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                        <span className="w-32">Timestamp</span>
                        <span className="w-24">Level</span>
                        <span className="w-32">Source</span>
                        <span className="flex-1">Message</span>
                        <span className="w-20">Action</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                    <ScrollArea className="h-[600px]">
                        <div className="flex flex-col">
                            {logs?.map((log) => (
                                <Sheet key={log.id}>
                                    <SheetTrigger asChild>
                                        <div className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer border-b border-zinc-800/50 transition-colors">
                                            <span className="w-32 text-xs font-mono text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <div className="w-24">
                                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">INFO</Badge>
                                            </div>
                                            <span className="w-32 text-sm text-emerald-500 font-mono">Strategy</span>
                                            <span className="flex-1 text-sm text-zinc-300">{log.reason} - {log.intent}</span>
                                            <Button variant="ghost" size="sm" className="h-6 text-xs text-zinc-500">Details</Button>
                                        </div>
                                    </SheetTrigger>
                                    <SheetContent className="border-l-zinc-800 bg-zinc-950">
                                        <SheetHeader>
                                            <SheetTitle>Log Details</SheetTitle>
                                            <SheetDescription>Event snapshot id: {log.id}</SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-6 space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-400">Full Message</label>
                                                <div className="p-3 rounded-md bg-zinc-900 text-sm text-zinc-200 border border-zinc-800">
                                                    {log.reason}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-zinc-400">State Snapshot</label>
                                                <pre className="p-3 rounded-md bg-zinc-900 text-xs text-green-400 border border-zinc-800 overflow-x-auto font-mono">
                                                    {JSON.stringify({
                                                        price: log.price_at_decision,
                                                        diff_long: log.diff_long,
                                                        diff_short: log.diff_short,
                                                        intent: log.intent
                                                    }, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            ))}

                            {/* More mock logs */}
                            <div className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer border-b border-zinc-800/50">
                                <span className="w-32 text-xs font-mono text-zinc-500">11:42:01</span>
                                <div className="w-24">
                                    <Badge variant="outline" className="border-amber-900/50 text-amber-500">WARN</Badge>
                                </div>
                                <span className="w-32 text-sm text-blue-500 font-mono">Connector</span>
                                <span className="flex-1 text-sm text-zinc-300">Websocket latency spike detected (142ms)</span>
                            </div>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
