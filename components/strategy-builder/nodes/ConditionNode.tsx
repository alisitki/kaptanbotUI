
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { GitCompare, Target } from "lucide-react";

export const ConditionNode = memo(({ id, selected, data }: NodeProps) => {
    const subType = data.subType || 'COMPARE';
    const isPriceCondition = subType === 'PRICE_CROSS_LEVEL' || subType === 'PRICE_IN_RANGE';

    // Determine inputs based on subType
    const inputs = isPriceCondition
        ? [{ id: "price", label: "Price" }]
        : [{ id: "a", label: "A" }, { id: "b", label: "B" }];

    return (
        <BaseNode
            id={id}
            label={data.label || "Condition"}
            selected={selected}
            headerColorClass={isPriceCondition
                ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"}
            icon={isPriceCondition
                ? <Target className="h-3 w-3 text-purple-400" />
                : <GitCompare className="h-3 w-3 text-amber-400" />}
            inputs={inputs}
            outputs={[{ id: "out", label: "Result" }]}
        >
            <div className="flex flex-col gap-2 text-center">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isPriceCondition ? "text-purple-400/80" : "text-amber-400/80"}`}>
                    {subType}
                </span>

                {/* COMPARE */}
                {subType === 'COMPARE' && (
                    <div className="font-mono text-lg font-bold text-white bg-white/5 py-1 rounded">
                        {data.params?.op || ">"}
                    </div>
                )}

                {/* CROSSOVER */}
                {subType === 'CROSSOVER' && (
                    <div className="font-mono text-sm font-bold text-white bg-white/5 py-1 rounded">
                        {data.params?.direction === 'UP' ? '↗ UP' : '↘ DOWN'}
                    </div>
                )}

                {/* PRICE_CROSS_LEVEL */}
                {subType === 'PRICE_CROSS_LEVEL' && (
                    <div className="space-y-1">
                        <div className="font-mono text-sm font-bold text-white bg-white/5 py-1 rounded">
                            {data.params?.direction === 'UP' ? '↗' : '↘'} {data.params?.level || 0}
                        </div>
                    </div>
                )}

                {/* PRICE_IN_RANGE */}
                {subType === 'PRICE_IN_RANGE' && (
                    <div className="font-mono text-xs text-white bg-white/5 py-1 rounded">
                        {data.params?.low || 0} - {data.params?.high || 0}
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

ConditionNode.displayName = "ConditionNode";

