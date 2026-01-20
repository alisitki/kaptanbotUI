
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { GitCompare } from "lucide-react";

export const ConditionNode = memo(({ id, selected, data }: NodeProps) => {
    return (
        <BaseNode
            id={id}
            label={data.label || "Condition"}
            selected={selected}
            headerColorClass="bg-amber-500/10 border-amber-500/20 text-amber-400"
            icon={<GitCompare className="h-3 w-3 text-amber-400" />}
            inputs={[{ id: "a", label: "A" }, { id: "b", label: "B" }]}
            outputs={[{ id: "out", label: "Result" }]}
        >
            <div className="flex flex-col gap-2 text-center">
                <span className="text-[10px] text-amber-400/80 uppercase font-bold tracking-wider">
                    {data.subType || "COMPARE"}
                </span>
                <div className="font-mono text-lg font-bold text-white bg-white/5 py-1 rounded">
                    {data.params?.op || ">"}
                </div>
                <span className="text-[9px] opacity-50">Compare A vs B</span>
            </div>
        </BaseNode>
    );
});

ConditionNode.displayName = "ConditionNode";
