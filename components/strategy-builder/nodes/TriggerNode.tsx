
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { Play } from "lucide-react";

export const TriggerNode = memo(({ id, selected, data }: NodeProps) => {
    return (
        <BaseNode
            id={id}
            label={data.label || "Trigger"}
            selected={selected}
            headerColorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            icon={<Play className="h-3 w-3 text-emerald-400" />}
            outputs={[{ id: "event", label: "Event" }]}
            glowClass="shadow-emerald-500/40"
        >
            <div className="flex flex-col gap-1">
                <span className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-wider">
                    {data.subType?.replace(/_/g, " ") || "EVENT"}
                </span>
                <p className="opacity-70 leading-tight">
                    Executes on every bar close
                </p>
            </div>
        </BaseNode>
    );
});

TriggerNode.displayName = "TriggerNode";
