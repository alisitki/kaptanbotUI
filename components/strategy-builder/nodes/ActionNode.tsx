
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { Rocket } from "lucide-react";

export const ActionNode = memo(({ id, selected, data }: NodeProps) => {
    const isLong = data.subType === 'OPEN_LONG';
    const colorClass = isLong
        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        : data.subType === 'OPEN_SHORT'
            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
            : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400";

    return (
        <BaseNode
            id={id}
            label={data.label || "Action"}
            selected={selected}
            headerColorClass={colorClass}
            icon={<Rocket className="h-3 w-3" />}
            inputs={[{ id: "trigger", label: "Execute" }]}
            outputs={[]} // Actions are terminal
        >
            <div className="flex flex-col gap-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isLong ? "text-emerald-400" : "text-rose-400"
                    }`}>
                    {data.subType?.replace(/_/g, " ") || "ACTION"}
                </span>
                {data.params?.qtyPct && (
                    <div className="flex items-center justify-between mt-1 bg-white/5 rounded px-2 py-1">
                        <span>Size</span>
                        <span className="text-white font-mono">{data.params.qtyPct}%</span>
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

ActionNode.displayName = "ActionNode";
