
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export const EntryOrderNode = memo(({ id, selected, data }: NodeProps) => {
    const side = data.params?.side || 'LONG';
    const orderType = data.params?.orderType || 'MARKET';
    const qty = data.params?.qty || 100;
    const isLong = side === 'LONG';

    return (
        <BaseNode
            id={id}
            label={data.label || "Entry Order"}
            selected={selected}
            headerColorClass={isLong
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"}
            glowClass={isLong ? "shadow-emerald-500/40" : "shadow-rose-500/40"}
            icon={isLong
                ? <ArrowUpCircle className="h-3 w-3 text-emerald-400" />
                : <ArrowDownCircle className="h-3 w-3 text-rose-400" />}
            inputs={[{ id: "gate", label: "Signal (Bool)" }]}
            outputs={[{ id: "intent", label: "OrderIntent" }]}
        >
            <div className="flex flex-col gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isLong ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                    📥 ENTRY ORDER
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`rounded px-2 py-1 text-center ${isLong ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        <div className="text-[9px] opacity-60">Side</div>
                        <div className={`font-bold ${isLong ? 'text-emerald-400' : 'text-rose-400'}`}>{side}</div>
                    </div>
                    <div className="bg-white/5 rounded px-2 py-1 text-center">
                        <div className="text-[9px] text-zinc-500">Type</div>
                        <div className="font-mono text-white">{orderType}</div>
                    </div>
                </div>

                <div className="bg-white/5 rounded px-2 py-1 flex items-center justify-between">
                    <span className="text-zinc-500 text-[10px]">Quantity</span>
                    <span className="text-white font-mono font-bold">{qty}%</span>
                </div>

                {orderType !== 'MARKET' && (
                    <div className="bg-white/5 rounded px-2 py-1 flex items-center justify-between">
                        <span className="text-zinc-500 text-[10px]">
                            {orderType === 'LIMIT' ? 'Limit' : 'Stop'} Price
                        </span>
                        <span className="text-white font-mono">
                            {data.params?.limitPrice || data.params?.stopPrice || '---'}
                        </span>
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

EntryOrderNode.displayName = "EntryOrderNode";
