
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { Shield } from "lucide-react";

export const HedgeNode = memo(({ id, selected, data }: NodeProps) => {
    const { minLongUnits = 0, minShortUnits = 0 } = data.params || {};

    return (
        <BaseNode
            id={id}
            label={data.label || "Min Hedge"}
            selected={selected}
            headerColorClass="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            icon={<Shield className="h-3 w-3 text-cyan-400" />}
            inputs={[]}
            outputs={[]}
        >
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-cyan-400/80 uppercase font-bold tracking-wider">
                    MIN HEDGE GUARD
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-500/10 rounded px-2 py-1 text-center">
                        <div className="text-[9px] text-emerald-400/60">Long</div>
                        <div className="font-mono text-emerald-400 font-bold">{minLongUnits}</div>
                    </div>
                    <div className="bg-rose-500/10 rounded px-2 py-1 text-center">
                        <div className="text-[9px] text-rose-400/60">Short</div>
                        <div className="font-mono text-rose-400 font-bold">{minShortUnits}</div>
                    </div>
                </div>
            </div>
        </BaseNode>
    );
});

HedgeNode.displayName = "HedgeNode";
