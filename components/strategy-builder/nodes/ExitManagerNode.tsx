
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { DoorOpen, Target, TrendingDown, Zap, Shield } from "lucide-react";

export const ExitManagerNode = memo(({ id, selected, data }: NodeProps) => {
    const { stopLossPct, takeProfitPct, trailingStopPct, breakEvenAtProfitPct, partialTPs } = data.params || {};

    return (
        <BaseNode
            id={id}
            label={data.label || "Exit Manager"}
            selected={selected}
            headerColorClass="bg-amber-500/10 border-amber-500/20 text-amber-400"
            glowClass="shadow-amber-500/40"
            icon={<DoorOpen className="h-3 w-3 text-amber-400" />}
            inputs={[{ id: "intent", label: "OrderIntent" }]}
            outputs={[{ id: "policy", label: "ExitPolicy" }]}
        >
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-amber-400/80 uppercase font-bold tracking-wider">
                    🚪 EXIT MANAGER
                </span>

                <div className="space-y-1.5">
                    {/* Stop Loss */}
                    <div className="bg-rose-500/10 rounded px-2 py-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <TrendingDown className="h-3 w-3 text-rose-400" />
                            <span className="text-[10px] text-rose-400">Stop Loss</span>
                        </div>
                        <span className="font-mono text-rose-400 font-bold">
                            {stopLossPct ? `-${stopLossPct}%` : '---'}
                        </span>
                    </div>

                    {/* Take Profit */}
                    <div className="bg-emerald-500/10 rounded px-2 py-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Target className="h-3 w-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">Take Profit</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">
                            {takeProfitPct ? `+${takeProfitPct}%` : '---'}
                        </span>
                    </div>

                    {/* Trailing Stop */}
                    {trailingStopPct && (
                        <div className="bg-indigo-500/10 rounded px-2 py-1 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Zap className="h-3 w-3 text-indigo-400" />
                                <span className="text-[10px] text-indigo-400">Trailing</span>
                            </div>
                            <span className="font-mono text-indigo-400">{trailingStopPct}%</span>
                        </div>
                    )}

                    {/* Break-Even */}
                    {breakEvenAtProfitPct && (
                        <div className="bg-cyan-500/10 rounded px-2 py-1 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3 w-3 text-cyan-400" />
                                <span className="text-[10px] text-cyan-400">Break-Even @</span>
                            </div>
                            <span className="font-mono text-cyan-400">+{breakEvenAtProfitPct}%</span>
                        </div>
                    )}

                    {/* Partial TPs */}
                    {partialTPs && partialTPs.length > 0 && (
                        <div className="text-[9px] text-zinc-500 mt-1">
                            +{partialTPs.length} partial TP levels
                        </div>
                    )}
                </div>
            </div>
        </BaseNode>
    );
});

ExitManagerNode.displayName = "ExitManagerNode";
