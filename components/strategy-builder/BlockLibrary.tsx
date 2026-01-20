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
    GitMerge,
    Target,
    TrendingUp,
    TrendingDown,
    Shield,
    Timer,
    Zap,
    Code,
    Scissors,
    Ban
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { NodeInfoModal, isNodeInfoDismissed } from "./NodeInfoModal";

interface BlockDef {
    type: BuilderNodeType;
    label: string;
    subType?: string;
    icon: any;
    defaultParams?: any;
    description: string;
    inputs: string[];
    outputs: string[];
    example?: string;
}

const BLOCKS: BlockDef[] = [
    // Logic (Gates)
    { type: 'LOGIC', label: 'AND Gate', subType: 'AND', icon: GitMerge, description: 'Her iki koşul da true olmalı. İki boolean girişi birleştirir.', inputs: ['Boolean', 'Boolean'], outputs: ['Boolean'], example: 'RSI < 30 AND EMA Cross Up' },
    { type: 'LOGIC', label: 'OR Gate', subType: 'OR', icon: GitMerge, description: 'Koşullardan biri true olmalı. İki boolean girişi birleştirir.', inputs: ['Boolean', 'Boolean'], outputs: ['Boolean'], example: 'RSI < 30 OR Price < Level' },

    // Conditions
    { type: 'CONDITION', label: 'Compare', subType: 'COMPARE', icon: GitCompare, defaultParams: { op: '>' }, description: 'İki değeri karşılaştırır. Indicator veya sabit değer alır.', inputs: ['Series/Scalar', 'Series/Scalar'], outputs: ['Boolean'], example: 'RSI(14) < 30' },
    { type: 'CONDITION', label: 'Cross Over', subType: 'CROSSOVER', icon: GitCompare, defaultParams: { direction: 'UP' }, description: 'İki serinin kesişimini algılar. EMA gibi göstergeler için idealdir.', inputs: ['Series', 'Series'], outputs: ['Boolean'], example: 'EMA(20) crosses above EMA(50)' },
    { type: 'CONDITION', label: 'Price Cross Level', subType: 'PRICE_CROSS_LEVEL', icon: Target, defaultParams: { direction: 'DOWN', level: 0 }, description: 'Fiyatın belirli bir seviyeyi geçmesini algılar.', inputs: ['Series'], outputs: ['Boolean'], example: 'Price crosses 91400 down' },
    { type: 'CONDITION', label: 'Price In Range', subType: 'PRICE_IN_RANGE', icon: Target, defaultParams: { low: 0, high: 0 }, description: 'Fiyatın bir aralıkta olup olmadığını kontrol eder.', inputs: ['Series'], outputs: ['Boolean'], example: 'Price between 90000-92000' },

    // Indicators
    { type: 'INDICATOR', label: 'EMA', subType: 'EMA', icon: Activity, defaultParams: { period: 14 }, description: 'Eksponensiyal Hareketli Ortalama. Trend takibi için kullanılır.', inputs: ['Series'], outputs: ['Series'], example: 'EMA(close, 20)' },
    { type: 'INDICATOR', label: 'SMA', subType: 'SMA', icon: Activity, defaultParams: { period: 20 }, description: 'Basit Hareketli Ortalama. Trend takibi için kullanılır.', inputs: ['Series'], outputs: ['Series'], example: 'SMA(close, 50)' },
    { type: 'INDICATOR', label: 'RSI', subType: 'RSI', icon: Activity, defaultParams: { period: 14 }, description: 'Göreceli Güç Endeksi. Aşırı alım/satım tespiti için kullanılır.', inputs: ['Series'], outputs: ['Series'], example: 'RSI(14) < 30 = Oversold' },
    { type: 'INDICATOR', label: 'Highest', subType: 'HIGHEST', icon: Activity, defaultParams: { period: 20 }, description: 'Belirlenen periyottaki en yüksek değer.', inputs: ['Series'], outputs: ['Series'], example: 'Highest(high, 20)' },
    { type: 'INDICATOR', label: 'Lowest', subType: 'LOWEST', icon: Activity, defaultParams: { period: 20 }, description: 'Belirlenen periyottaki en düşük değer.', inputs: ['Series'], outputs: ['Series'], example: 'Lowest(low, 20)' },

    // Data Sources
    { type: 'VALUE', label: 'Constant', subType: 'NUMBER', icon: Hash, defaultParams: { value: 0 }, description: 'Sabit bir sayı değeri. RSI seviyesi veya fiyat eşiği için kullanılır.', inputs: [], outputs: ['Scalar'], example: '30 (RSI threshold)' },

    // Expression
    { type: 'EXPR', label: 'Expression', subType: 'CUSTOM', icon: Code, defaultParams: { expression: '' }, description: 'Özel boolean ifadesi yaz. Birden fazla koşulu tek node\'da birleştir.', inputs: ['Series'], outputs: ['Boolean'], example: 'rsi(close,14) < 30 && ema(close,20) > ema(close,50)' },

    // Actions - Standard
    { type: 'ACTION', label: 'Open Long', subType: 'OPEN_LONG', icon: Rocket, defaultParams: { qtyPct: 100 }, description: 'Long pozisyon açar. Boolean tetikleyici gerektirir.', inputs: ['Boolean'], outputs: [], example: 'If RSI < 30 → Open Long' },
    { type: 'ACTION', label: 'Open Short', subType: 'OPEN_SHORT', icon: Rocket, defaultParams: { qtyPct: 100 }, description: 'Short pozisyon açar. Boolean tetikleyici gerektirir.', inputs: ['Boolean'], outputs: [], example: 'If RSI > 70 → Open Short' },
    { type: 'ACTION', label: 'Close Position', subType: 'CLOSE_POSITION', icon: Ban, description: 'Açık pozisyonu kapatır.', inputs: ['Boolean'], outputs: [], example: 'If EMA Cross Down → Close' },
    { type: 'ACTION', label: 'Close Partial', subType: 'CLOSE_PARTIAL_PCT', icon: Scissors, defaultParams: { pct: 50 }, description: 'Pozisyonun bir kısmını kapatır.', inputs: ['Boolean'], outputs: [], example: 'If TP hit → Close 50%' },

    // Actions - Hedge
    { type: 'ACTION', label: 'Set Long Units', subType: 'SET_LONG_UNITS', icon: TrendingUp, defaultParams: { units: 1 }, description: 'Hedge long birim sayısını ayarlar.', inputs: ['Boolean'], outputs: [], example: 'Set Long = 3 units' },
    { type: 'ACTION', label: 'Set Short Units', subType: 'SET_SHORT_UNITS', icon: TrendingDown, defaultParams: { units: 1 }, description: 'Hedge short birim sayısını ayarlar.', inputs: ['Boolean'], outputs: [], example: 'Set Short = 15 units' },

    // Risk
    { type: 'RISK', label: 'Risk Profile', icon: ShieldAlert, defaultParams: { maxLeverage: 1, positionSizePct: 10 }, description: 'Global risk limitleri. Kaldıraç ve pozisyon boyutu.', inputs: [], outputs: [], example: 'Max 3x leverage, 10% size' },

    // Guards
    { type: 'HEDGE', label: 'Min Hedge', subType: 'MIN_HEDGE', icon: Shield, defaultParams: { minLongUnits: 0, minShortUnits: 0 }, description: 'Minimum hedge limitleri. Her zaman tutulacak minimum birimler.', inputs: [], outputs: [], example: 'Min 3 Long, 2 Short' },
    { type: 'GUARD', label: 'Cooldown Bars', subType: 'COOLDOWN_BARS', icon: Timer, defaultParams: { bars: 5 }, description: 'Action tetiklendikten sonra N bar bekleme süresi. Spam önler.', inputs: [], outputs: [], example: 'Wait 5 bars after trigger' },
    { type: 'GUARD', label: 'Once Per Cross', subType: 'ONCE_PER_CROSS', icon: Zap, defaultParams: {}, description: 'Her cross anında sadece bir kez tetikle. Tekrar önler.', inputs: [], outputs: [], example: 'Fire only on cross moment' },
];

export function BlockLibrary() {
    const addNode = useBuilderStore(s => s.addNode);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBlock, setSelectedBlock] = useState<BlockDef | null>(null);

    const handleBlockClick = (block: BlockDef) => {
        const nodeTypeKey = `${block.type}-${block.subType || 'default'}`;
        if (isNodeInfoDismissed(nodeTypeKey)) {
            doAddNode(block);
        } else {
            setSelectedBlock(block);
            setModalOpen(true);
        }
    };

    const doAddNode = (block: BlockDef) => {
        const newNode: StrategyNode = {
            id: `${block.type.toLowerCase()}-${Date.now()}`,
            type: block.type === 'TRIGGER' ? 'triggerNode' :
                block.type === 'ACTION' ? 'actionNode' :
                    block.type === 'CONDITION' ? 'conditionNode' :
                        block.type === 'INDICATOR' ? 'indicatorNode' :
                            block.type === 'RISK' ? 'riskNode' :
                                block.type === 'VALUE' ? 'valueNode' :
                                    block.type === 'LOGIC' ? 'logicNode' :
                                        block.type === 'CANDLE_SOURCE' ? 'candleSourceNode' :
                                            block.type === 'HEDGE' ? 'hedgeNode' :
                                                block.type === 'GUARD' ? 'guardNode' :
                                                    block.type === 'EXPR' ? 'exprNode' : 'default',
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

    const handleModalConfirm = () => {
        if (selectedBlock) {
            doAddNode(selectedBlock);
        }
        setModalOpen(false);
        setSelectedBlock(null);
    };

    const filtered = BLOCKS.filter(b =>
        b.type !== 'TRIGGER' &&
        b.type !== 'CANDLE_SOURCE' &&
        (b.label.toLowerCase().includes(search.toLowerCase()) ||
            b.description.toLowerCase().includes(search.toLowerCase()))
    );

    // Group blocks by category
    const categories = [
        { name: 'Logic', items: filtered.filter(b => b.type === 'LOGIC') },
        { name: 'Conditions', items: filtered.filter(b => b.type === 'CONDITION') },
        { name: 'Indicators', items: filtered.filter(b => b.type === 'INDICATOR') },
        { name: 'Expression', items: filtered.filter(b => b.type === 'EXPR') },
        { name: 'Values', items: filtered.filter(b => b.type === 'VALUE') },
        { name: 'Actions', items: filtered.filter(b => b.type === 'ACTION') },
        { name: 'Guards', items: filtered.filter(b => b.type === 'GUARD' || b.type === 'HEDGE') },
        { name: 'Risk', items: filtered.filter(b => b.type === 'RISK') },
    ].filter(c => c.items.length > 0);

    return (
        <>
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
                        <div className="p-3 space-y-4">
                            {categories.map((cat) => (
                                <div key={cat.name}>
                                    <div className="text-[10px] uppercase text-zinc-500 font-bold mb-2 px-1">{cat.name}</div>
                                    <div className="grid gap-1">
                                        {cat.items.map((block, i) => {
                                            let glowHover = "hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)]"; // Default
                                            const t = block.type;
                                            const sub = block.subType;

                                            if (t === 'ACTION') glowHover = "hover:bg-rose-500/10 hover:border-rose-500/30 hover:shadow-[0_0_10px_rgba(244,63,94,0.2)] group-hover:text-rose-400";
                                            if (t === 'TRIGGER') glowHover = "hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]";
                                            if (t === 'CONDITION') {
                                                if (sub?.includes('PRICE')) glowHover = "hover:bg-purple-500/10 hover:border-purple-500/30 hover:shadow-[0_0_10px_rgba(168,85,247,0.2)]";
                                                else glowHover = "hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]";
                                            }
                                            if (t === 'INDICATOR') glowHover = "hover:bg-blue-500/10 hover:border-blue-500/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]";
                                            if (t === 'LOGIC') {
                                                if (sub === 'AND') glowHover = "hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]";
                                                else glowHover = "hover:bg-orange-500/10 hover:border-orange-500/30 hover:shadow-[0_0_10px_rgba(249,115,22,0.2)]";
                                            }
                                            if (t === 'GUARD') glowHover = "hover:bg-orange-500/10 hover:border-orange-500/30 hover:shadow-[0_0_10px_rgba(249,115,22,0.2)]";
                                            if (t === 'EXPR') glowHover = "hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 hover:shadow-[0_0_10px_rgba(217,70,239,0.2)]";

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleBlockClick(block)}
                                                    className={`flex items-center gap-2 p-2 rounded-lg border border-white/5 bg-white/[0.02] transition-all text-left group ${glowHover}`}
                                                >
                                                    <block.icon className={`h-4 w-4 text-zinc-500 flex-shrink-0 transition-colors ${t === 'ACTION' ? 'group-hover:text-rose-400' : 'group-hover:text-white'}`} />
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium text-zinc-300 group-hover:text-white truncate">
                                                            {block.label}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <NodeInfoModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setSelectedBlock(null); }}
                onConfirm={handleModalConfirm}
                nodeInfo={selectedBlock ? {
                    type: `${selectedBlock.type}-${selectedBlock.subType || 'default'}`,
                    label: selectedBlock.label,
                    description: selectedBlock.description,
                    inputs: selectedBlock.inputs,
                    outputs: selectedBlock.outputs,
                    example: selectedBlock.example
                } : null}
            />
        </>
    );
}
