
import { memo } from "react";
import { NodeProps } from "reactflow";
import { BaseNode } from "./BaseNode";
import { ShieldAlert, Skull, Hash, Ban } from "lucide-react";

export const DailyGuardsNode = memo(({ id, selected, data }: NodeProps) => {
    const { maxDailyLossPct, maxTradesPerDay, killSwitch } = data.params || {};

    return (
        <BaseNode
            id={id}
            label={data.label || "Daily Guards"}
            selected={selected}
            headerColorClass="bg-rose-500/10 border-rose-500/20 text-rose-400"
            glowClass="shadow-rose-500/40"
            icon={<ShieldAlert className="h-3 w-3 text-rose-400" />}
            inputs={[{ id: "intent", label: "OrderIntent" }]}
            outputs={[{ id: "out", label: "OrderIntent" }]}
        >
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-rose-400/80 uppercase font-bold tracking-wider">
                    🛡️ DAILY GUARDS
                </span>

                <div className="space-y-1.5">
                    {/* Max Daily Loss */}
                    <div className="bg-rose-500/10 rounded px-2 py-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Skull className="h-3 w-3 text-rose-400" />
                            <span className="text-[10px] text-rose-400">Max Daily Loss</span>
                        </div>
                        <span className="font-mono text-rose-400 font-bold">
                            {maxDailyLossPct ? `-${maxDailyLossPct}%` : '---'}
                        </span>
                    </div>

                    {/* Max Trades */}
                    <div className="bg-amber-500/10 rounded px-2 py-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Hash className="h-3 w-3 text-amber-400" />
                            <span className="text-[10px] text-amber-400">Max Trades/Day</span>
                        </div>
                        <span className="font-mono text-amber-400 font-bold">
                            {maxTradesPerDay || '∞'}
                        </span>
                    </div>

                    {/* Kill Switch */}
                    <div className={`rounded px-2 py-1.5 flex items-center justify-between ${killSwitch ? 'bg-rose-500/20' : 'bg-white/5'}`}>
                        <div className="flex items-center gap-1.5">
                            <Ban className={`h-3 w-3 ${killSwitch ? 'text-rose-500' : 'text-zinc-500'}`} />
                            <span className={`text-[10px] ${killSwitch ? 'text-rose-500' : 'text-zinc-500'}`}>Kill Switch</span>
                        </div>
                        <span className={`font-bold text-xs ${killSwitch ? 'text-rose-500' : 'text-zinc-500'}`}>
                            {killSwitch ? 'ACTIVE' : 'OFF'}
                        </span>
                    </div>
                </div>

                {killSwitch && (
                    <div className="text-[9px] text-rose-400/70 text-center bg-rose-500/10 rounded py-1">
                        ⚠️ Trading paused
                    </div>
                )}
            </div>
        </BaseNode>
    );
});

DailyGuardsNode.displayName = "DailyGuardsNode";
