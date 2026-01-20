
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { Code } from "lucide-react";

export const ExprNode = memo(({ id, selected, data }: NodeProps) => {
    const expr = data.params?.expression || '';
    const truncatedExpr = expr.length > 30 ? expr.slice(0, 30) + '...' : expr;

    return (
        <BaseNode
            id={id}
            label={data.label || "Expression"}
            selected={selected}
            headerColorClass="bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400"
            glowClass="shadow-fuchsia-500/40"
            icon={<Code className="h-3 w-3 text-fuchsia-400" />}
            inputs={[{ id: "series", label: "Price" }]}
            outputs={[{ id: "out", label: "Bool" }]}
        >
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-fuchsia-400/80 uppercase font-bold tracking-wider">
                    CUSTOM EXPR
                </span>
                <div className="bg-black/30 rounded px-2 py-1 font-mono text-[10px] text-fuchsia-300 break-all">
                    {truncatedExpr || <span className="opacity-50">No expression</span>}
                </div>
                <div className="text-[9px] text-zinc-500">
                    Output: Boolean
                </div>
            </div>
        </BaseNode>
    );
});

ExprNode.displayName = "ExprNode";
