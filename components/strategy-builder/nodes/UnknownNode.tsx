
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { AlertTriangle } from "lucide-react";

export const UnknownNode = memo(({ id, selected, data }: NodeProps) => {
    return (
        <BaseNode
            id={id}
            label={data.label || "Unknown"}
            selected={selected}
            headerColorClass="bg-red-500/10 border-red-500/20 text-red-400"
            icon={<AlertTriangle className="h-3 w-3 text-red-400" />}
            inputs={[{ id: "in", label: "?" }]}
            outputs={[{ id: "out", label: "?" }]}
        >
            <div className="flex flex-col gap-2 text-center">
                <span className="text-[10px] text-red-400/80 uppercase font-bold tracking-wider">
                    UNKNOWN TYPE
                </span>
                <div className="bg-red-500/10 rounded px-2 py-1 text-[10px] text-red-400">
                    Original: {data.originalType || 'unknown'}
                </div>
                <p className="text-[9px] text-red-400/60">
                    This node type is not recognized. Remove or update this node.
                </p>
            </div>
        </BaseNode>
    );
});

UnknownNode.displayName = "UnknownNode";
