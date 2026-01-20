
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { Database } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
    open: 'Open',
    high: 'High',
    low: 'Low',
    close: 'Close',
    volume: 'Volume'
};

export const CandleSourceNode = memo(({ id, selected, data }: NodeProps) => {
    const field = data.params?.field || 'close';

    return (
        <BaseNode
            id={id}
            label={`OHLCV: ${FIELD_LABELS[field] || field}`}
            selected={selected}
            headerColorClass="bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            icon={<Database className="h-3 w-3 text-indigo-400" />}
            inputs={[{ id: "event", label: "Event" }]}
            outputs={[{ id: "series", label: "Series" }]}
        >
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">Field</span>
                    <span className="text-indigo-400 font-mono font-medium">{FIELD_LABELS[field] || field}</span>
                </div>
                <div className="text-[9px] text-zinc-600 bg-white/5 rounded px-2 py-1 text-center">
                    Uses strategy meta
                </div>
            </div>
        </BaseNode>
    );
});

CandleSourceNode.displayName = "CandleSourceNode";

