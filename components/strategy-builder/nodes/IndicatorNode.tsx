
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { Activity } from "lucide-react";

export const IndicatorNode = memo(({ id, selected, data }: NodeProps) => {
    return (
        <BaseNode
            id={id}
            label={data.label || "Indicator"}
            selected={selected}
            headerColorClass="bg-blue-500/10 border-blue-500/20 text-blue-400"
            glowClass="shadow-blue-500/40"
            icon={<Activity className="h-3 w-3 text-blue-400" />}
            inputs={[{ id: "in", label: "Source" }]}
            outputs={[{ id: "out", label: "Value" }]}
        >
            <div className="flex flex-col gap-1">
                <span className="text-[10px] text-blue-400/80 uppercase font-bold tracking-wider">
                    {data.subType || "EMA"}
                </span>
                <div className="flex items-center justify-between mt-1 bg-white/5 rounded px-2 py-1">
                    <span>Period</span>
                    <span className="text-white font-mono">{data.params?.period || 14}</span>
                </div>
            </div>
        </BaseNode>
    );
});

IndicatorNode.displayName = "IndicatorNode";
