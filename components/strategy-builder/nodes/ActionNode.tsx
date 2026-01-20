
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { Rocket, TrendingUp, TrendingDown } from "lucide-react";

export const ActionNode = memo(({ id, selected, data }: NodeProps) => {
    const isLong = data.subType === 'OPEN_LONG';
    const isShort = data.subType === 'OPEN_SHORT';
    const isSetLong = data.subType === 'SET_LONG_UNITS';
    const isSetShort = data.subType === 'SET_SHORT_UNITS';
    const isHedgeAction = isSetLong || isSetShort;

    const colorClass = isLong || isSetLong
        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        : isShort || isSetShort
            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
            : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400";

    const glowClass = isLong || isSetLong ? "shadow-emerald-500/40"
        : isShort || isSetShort ? "shadow-rose-500/40"
            : "shadow-zinc-500/40";

    const Icon = isSetLong ? TrendingUp : isSetShort ? TrendingDown : Rocket;

    return (
        <BaseNode
            id={id}
            label={data.label || "Action"}
            selected={selected}
            headerColorClass={colorClass}
            glowClass={glowClass}
            icon={<Icon className="h-3 w-3" />}
            inputs={[{ id: "trigger", label: "Execute" }]}
            outputs={[]} // Actions are terminal
        >
            <div className="flex flex-col gap-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${(isLong || isSetLong) ? "text-emerald-400" : (isShort || isSetShort) ? "text-rose-400" : "text-zinc-400"
                    }`}>
                    {data.subType?.replace(/_/g, " ") || "ACTION"}
                </span>

                {/* Standard position actions */}
                {data.params?.qtyPct && !isHedgeAction && (
                    <div className="flex items-center justify-between mt-1 bg-white/5 rounded px-2 py-1">
                        <span>Size</span>
                        <span className="text-white font-mono">{data.params.qtyPct}%</span>
                    </div>
                )}

                {/* Hedge unit actions */}
                {isHedgeAction && (
                    <div className="flex items-center justify-between mt-1 bg-white/5 rounded px-2 py-1">
                        <span>Units</span>
                        <span className="text-white font-mono font-bold">{data.params?.units ?? 1}</span>
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

ActionNode.displayName = "ActionNode";

