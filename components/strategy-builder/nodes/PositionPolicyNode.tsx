
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { ClipboardList, Plus, RefreshCw, Ban } from "lucide-react";

export const PositionPolicyNode = memo(({ id, selected, data }: NodeProps) => {
    const ifPositionExists = data.params?.ifPositionExists || 'IGNORE';
    const cancelOpenOrders = data.params?.cancelOpenOrders ?? false;

    const policyIcons: Record<string, any> = {
        'IGNORE': Ban,
        'ADD': Plus,
        'FLIP': RefreshCw
    };
    const PolicyIcon = policyIcons[ifPositionExists] || Ban;

    const policyColors: Record<string, string> = {
        'IGNORE': 'text-zinc-400 bg-zinc-500/10',
        'ADD': 'text-emerald-400 bg-emerald-500/10',
        'FLIP': 'text-amber-400 bg-amber-500/10'
    };

    return (
        <BaseNode
            id={id}
            label={data.label || "Position Policy"}
            selected={selected}
            headerColorClass="bg-purple-500/10 border-purple-500/20 text-purple-400"
            glowClass="shadow-purple-500/40"
            icon={<ClipboardList className="h-3 w-3 text-purple-400" />}
            inputs={[{ id: "intent", label: "OrderIntent" }]}
            outputs={[{ id: "out", label: "OrderIntent" }]}
        >
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-purple-400/80 uppercase font-bold tracking-wider">
                    📋 POSITION POLICY
                </span>

                <div className="bg-white/5 rounded p-2">
                    <div className="text-[9px] text-zinc-500 mb-1">If Position Exists:</div>
                    <div className={`flex items-center gap-2 rounded px-2 py-1.5 ${policyColors[ifPositionExists]}`}>
                        <PolicyIcon className="h-3.5 w-3.5" />
                        <span className="font-bold text-sm">{ifPositionExists}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-white/5 rounded px-2 py-1.5">
                    <span className="text-[10px] text-zinc-500">Cancel Open Orders</span>
                    <span className={`text-xs font-bold ${cancelOpenOrders ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {cancelOpenOrders ? 'YES' : 'NO'}
                    </span>
                </div>
            </div>
        </BaseNode>
    );
});

PositionPolicyNode.displayName = "PositionPolicyNode";
