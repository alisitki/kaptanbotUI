
"use client";

import { useBuilderStore } from "@/lib/strategies/builder/store";
import { StrategyNode, BuilderNodeType } from "@/lib/strategies/builder/types";
import {
    Play,
    Activity,
    GitCompare,
    Rocket,
    ShieldAlert,
    Database,
    Search,
    Hash,
    GitMerge
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

const BLOCKS: Array<{
    type: BuilderNodeType;
    label: string;
    subType?: string;
    icon: any;
    defaultParams?: any;
    description: string;
}> = [
        // Trigger
        { type: 'TRIGGER', label: 'On Bar Close', subType: 'ON_BAR_CLOSE', icon: Play, description: 'Triggers logic on every candle close' },

        // Logic (Gates)
        { type: 'LOGIC', label: 'AND Gate', subType: 'AND', icon: GitMerge, description: 'Both conditions must be true' },
        { type: 'LOGIC', label: 'OR Gate', subType: 'OR', icon: GitMerge, description: 'Either condition must be true' },

        // Conditions
        { type: 'CONDITION', label: 'Compare', subType: 'COMPARE', icon: GitCompare, defaultParams: { op: '>' }, description: 'Compare two values' },
        { type: 'CONDITION', label: 'Cross Over', subType: 'CROSSOVER', icon: GitCompare, defaultParams: { direction: 'UP' }, description: 'Detects line cross' },

        // Indicators
        { type: 'INDICATOR', label: 'EMA', subType: 'EMA', icon: Activity, defaultParams: { period: 14 }, description: 'Exponential Moving Average' },
        { type: 'INDICATOR', label: 'SMA', subType: 'SMA', icon: Activity, defaultParams: { period: 20 }, description: 'Simple Moving Average' },
        { type: 'INDICATOR', label: 'RSI', subType: 'RSI', icon: Activity, defaultParams: { period: 14 }, description: 'Relative Strength Index' },
        { type: 'INDICATOR', label: 'Highest', subType: 'HIGHEST', icon: Activity, defaultParams: { period: 20 }, description: 'Highest High of Period' },
        { type: 'INDICATOR', label: 'Lowest', subType: 'LOWEST', icon: Activity, defaultParams: { period: 20 }, description: 'Lowest Low of Period' },

        // Data Sources
        { type: 'CANDLE_SOURCE', label: 'Candle Source', icon: Database, defaultParams: { field: 'close' }, description: 'OHLCV data source' },
        { type: 'VALUE', label: 'Constant', subType: 'NUMBER', icon: Hash, defaultParams: { value: 0 }, description: 'Static number value' },

        // Actions
        { type: 'ACTION', label: 'Open Long', subType: 'OPEN_LONG', icon: Rocket, defaultParams: { qtyPct: 100 }, description: 'Enters a LONG position' },
        { type: 'ACTION', label: 'Open Short', subType: 'OPEN_SHORT', icon: Rocket, defaultParams: { qtyPct: 100 }, description: 'Enters a SHORT position' },
        { type: 'ACTION', label: 'Close Position', subType: 'CLOSE_POSITION', icon: Rocket, description: 'Closes any open position' },

        // Risk
        { type: 'RISK', label: 'Risk Profile', icon: ShieldAlert, defaultParams: { maxLeverage: 1, positionSizePct: 10 }, description: 'Global risk limits' },
    ];

export function BlockLibrary() {
    const addNode = useBuilderStore(s => s.addNode);
    const [search, setSearch] = useState("");

    const handleAdd = (block: typeof BLOCKS[0]) => {
        // Random position near center for now, or could use viewport center
        const newNode: StrategyNode = {
            id: `${block.type.toLowerCase()}-${Date.now()}`,
            type: block.type === 'TRIGGER' ? 'triggerNode' :
                block.type === 'ACTION' ? 'actionNode' :
                    block.type === 'CONDITION' ? 'conditionNode' :
                        block.type === 'INDICATOR' ? 'indicatorNode' :
                            block.type === 'RISK' ? 'riskNode' :
                                block.type === 'VALUE' ? 'valueNode' :
                                    block.type === 'LOGIC' ? 'logicNode' :
                                        block.type === 'CANDLE_SOURCE' ? 'candleSourceNode' : 'default',
            position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 },
            data: {
                label: block.label,
                type: block.type,
                subType: block.subType,
                params: block.defaultParams || {}
            }
        };
        addNode(newNode);
    };

    const filtered = BLOCKS.filter(b =>
        b.type !== 'TRIGGER' &&
        b.type !== 'CANDLE_SOURCE' &&
        (b.label.toLowerCase().includes(search.toLowerCase()) ||
            b.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full bg-[#050505] border-r border-white/5 w-64">
            <div className="p-4 border-b border-white/5">
                <h3 className="font-semibold text-white mb-2">Block Library</h3>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3 w-3 text-zinc-500" />
                    <Input
                        placeholder="Search blocks..."
                        className="h-8 pl-8 bg-zinc-900 border-zinc-800 text-xs"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                    <div className="p-3 grid gap-2">
                        {filtered.map((block, i) => (
                            <button
                                key={i}
                                onClick={() => handleAdd(block)}
                                className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-indigo-500/10 hover:border-indigo-500/20 text-left group transition-all"
                            >
                                <block.icon className="h-5 w-5 text-zinc-500 group-hover:text-indigo-400 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-zinc-300 group-hover:text-white">
                                        {block.label}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 leading-tight mt-1">
                                        {block.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
