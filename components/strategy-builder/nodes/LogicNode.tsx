
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { GitMerge } from "lucide-react";

export const LogicNode = memo(({ id, selected, data }: NodeProps) => {
    const isAnd = data.subType === 'AND';

    return (
        <BaseNode
            id={id}
            label={data.label || "Logic"}
            selected={selected}
            headerColorClass="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            icon={<GitMerge className="h-3 w-3 text-cyan-400" />}
            inputs={[{ id: "a", label: "A" }, { id: "b", label: "B" }]}
            outputs={[{ id: "out", label: "Result" }]}
        >
            <div className="flex flex-col gap-2 text-center">
                <span className="text-[10px] text-cyan-400/80 uppercase font-bold tracking-wider">
                    LOGIC GATE
                </span>
                <div className={`font-mono text-lg font-bold py-1 rounded ${isAnd
                        ? 'text-cyan-400 bg-cyan-500/10'
                        : 'text-orange-400 bg-orange-500/10'
                    }`}>
                    {data.subType || "AND"}
                </div>
                <span className="text-[9px] opacity-50">A {data.subType || "AND"} B</span>
            </div>
        </BaseNode>
    );
});

LogicNode.displayName = "LogicNode";
