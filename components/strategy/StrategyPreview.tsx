"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, RefreshCcw } from "lucide-react";

export function StrategyPreview() {
    return (
        <div className="space-y-6 sticky top-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle>Live Logic Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative h-[400px] border-l border-zinc-800 ml-4 pl-8 py-8 space-y-12">
                        {/* Resistance Zone */}
                        <div className="relative">
                            <div className="absolute -left-[41px] top-3 h-3 w-3 rounded-full bg-red-500 ring-4 ring-black" />
                            <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-red-400 font-medium">Resistance (93,500)</span>
                                    <Badge variant="outline" className="border-red-900/40 text-red-500 text-[10px]">HIT ZONE</Badge>
                                </div>
                                <div className="text-sm text-zinc-400 flex items-center gap-2">
                                    <ArrowDown className="h-3 w-3 text-red-500" />
                                    <span>Action: Close Long (-1) / Open Short (+1)</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Price */}
                        <div className="relative">
                            <div className="absolute -left-[41px] top-3 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-black animate-pulse" />
                            <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-lg backdrop-blur-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-mono text-lg">92,844.20</span>
                                    <span className="text-xs text-zinc-500">CURRENT</span>
                                </div>
                            </div>
                        </div>

                        {/* Support Zone */}
                        <div className="relative">
                            <div className="absolute -left-[41px] top-3 h-3 w-3 rounded-full bg-emerald-700 ring-4 ring-black" />
                            <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-lg opacity-50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-emerald-400 font-medium">Support (90,500)</span>
                                    <span className="text-xs text-zinc-600">2.5% away</span>
                                </div>
                                <div className="text-sm text-zinc-500 flex items-center gap-2">
                                    <ArrowUp className="h-3 w-3 text-emerald-500" />
                                    <span>Action: Open Long (+1) / Close Short (-1)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <h4 className="text-sm font-medium text-zinc-400 mb-4">State Machine</h4>
                        <div className="flex items-center justify-between text-xs px-2">
                            <div className="text-center">
                                <div className="h-8 w-16 mx-auto rounded bg-emerald-900/30 border border-emerald-900/50 flex items-center justify-center text-emerald-500 mb-2">LONG</div>
                                <span className="text-zinc-600">Bias</span>
                            </div>
                            <div className="flex-1 h-px bg-zinc-800 mx-2 relative">
                                <span className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-[10px] text-zinc-600">Flip &lt; 91400</span>
                                <RefreshCcw className="h-3 w-3 absolute top-[-6px] left-1/2 -translate-x-1/2 text-zinc-700" />
                            </div>
                            <div className="text-center">
                                <div className="h-8 w-16 mx-auto rounded bg-red-900/30 border border-red-900/50 flex items-center justify-center text-red-500 mb-2">SHORT</div>
                                <span className="text-zinc-600">Bias</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
