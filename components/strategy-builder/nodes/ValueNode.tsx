
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { Hash } from "lucide-react";

export const ValueNode = memo(({ id, selected, data }: NodeProps) => {
    return (
        <BaseNode
            id={id}
            label={data.label || "Value"}
            selected={selected}
            headerColorClass="bg-purple-500/10 border-purple-500/20 text-purple-400"
            icon={<Hash className="h-3 w-3 text-purple-400" />}
            inputs={[]}
            outputs={[{ id: "out", label: "Value" }]}
        >
            <div className="flex flex-col gap-1 text-center">
                <span className="text-[10px] text-purple-400/80 uppercase font-bold tracking-wider">
                    CONSTANT
                </span>
                <div className="font-mono text-xl font-bold text-white bg-white/5 py-2 rounded">
                    {data.params?.value ?? 0}
                </div>
            </div>
        </BaseNode>
    );
});

ValueNode.displayName = "ValueNode";
