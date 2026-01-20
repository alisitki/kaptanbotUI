
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { ShieldAlert } from "lucide-react"; // Changed icon to ShieldAlert as Shield might be ambiguous

export const RiskNode = memo(({ id, selected, data }: NodeProps) => {
    return (
        <BaseNode
            id={id}
            label="Risk Management"
            selected={selected}
            headerColorClass="bg-rose-500/10 border-rose-500/20 text-rose-400"
            icon={<ShieldAlert className="h-3 w-3 text-rose-400" />}
            inputs={[{ id: "config", label: "Global Config" }]}
            outputs={[]}
        >
            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] text-zinc-400">
                    <span>Size</span>
                    <span className="text-white font-mono">{data.params?.positionSizePct || 10}%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400">
                    <span>Lev</span>
                    <span className="text-white font-mono">{data.params?.maxLeverage || 1}x</span>
                </div>
                {(data.params?.slPct || data.params?.tpPct) && (
                    <div className="mt-1 pt-1 border-t border-white/5 flex gap-2 text-[9px] font-mono justify-end">
                        {data.params?.tpPct && <span className="text-emerald-400">TP:{data.params.tpPct}%</span>}
                        {data.params?.slPct && <span className="text-rose-400">SL:{data.params.slPct}%</span>}
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

RiskNode.displayName = "RiskNode";
