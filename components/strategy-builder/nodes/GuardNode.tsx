
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { Timer, Zap } from "lucide-react";

export const GuardNode = memo(({ id, selected, data }: NodeProps) => {
    const isCooldown = data.subType === 'COOLDOWN_BARS';
    const isOnce = data.subType === 'ONCE_PER_CROSS';

    return (
        <BaseNode
            id={id}
            label={data.label || "Guard"}
            selected={selected}
            headerColorClass="bg-orange-500/10 border-orange-500/20 text-orange-400"
            icon={isCooldown ? <Timer className="h-3 w-3 text-orange-400" /> : <Zap className="h-3 w-3 text-orange-400" />}
            inputs={[]}
            outputs={[]}
        >
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-orange-400/80 uppercase font-bold tracking-wider">
                    {data.subType?.replace(/_/g, ' ') || 'GUARD'}
                </span>

                {isCooldown && (
                    <div className="bg-orange-500/10 rounded px-2 py-1 text-center">
                        <div className="text-[9px] text-orange-400/60">Bars</div>
                        <div className="font-mono text-orange-400 font-bold text-lg">{data.params?.bars || 0}</div>
                    </div>
                )}

                {isOnce && (
                    <div className="text-[10px] text-orange-400/60 text-center">
                        Fire only once per cross event
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

GuardNode.displayName = "GuardNode";
