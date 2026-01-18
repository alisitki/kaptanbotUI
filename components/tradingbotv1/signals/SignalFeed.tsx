
"use client";

import { Signal } from "@/lib/api/client/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Zap } from "lucide-react";

interface SignalFeedProps {
    signals: Signal[] | undefined;
}

export function SignalFeed({ signals }: SignalFeedProps) {
    if (!signals?.length) return <div className="text-zinc-500">No active signals.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signals.map((signal) => (
                <Card key={signal.id} className="group relative overflow-hidden bg-[#0A0A0A]/60 border-white/5 hover:border-indigo-500/30 transition-all duration-300 backdrop-blur-sm">
                    {/* Glow Effect */}
                    <div className="absolute -right-20 -top-20 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />

                    <div className="p-6 space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    {signal.symbol}
                                    <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-0">
                                        {signal.type}
                                    </Badge>
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {new Date(signal.timestamp).toLocaleTimeString()} • ${signal.price.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-emerald-400 font-bold text-lg">
                                    <Zap className="h-4 w-4 fill-emerald-400" />
                                    {signal.strength}
                                </div>
                                <div className="text-[10px] text-zinc-500 uppercase font-medium">Score</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-zinc-500 uppercase">
                                <span>Signal Quality</span>
                                <span>%{signal.strength}</span>
                            </div>
                            <Progress value={signal.strength} className="h-1 bg-white/5" indicatorClassName="bg-gradient-to-r from-emerald-500 to-emerald-300" />
                        </div>

                        {/* Strategy Reasons */}
                        <div className="space-y-2 pt-2">
                            <div className="flex flex-wrap gap-2">
                                {signal.reasons.map((r, i) => (
                                    <div key={i} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-zinc-300">
                                        {r}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="pt-4 flex items-center justify-between gap-4 border-t border-white/5 mt-4">
                            <div className="space-y-0.5">
                                <div className="text-[10px] text-zinc-500 uppercase">Suggested Entry</div>
                                <div className="text-sm font-mono text-white">
                                    {signal.suggested_entry[0].toLocaleString()} - {signal.suggested_entry[1].toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
