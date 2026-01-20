
"use client";

import { useBuilderStore } from "@/lib/strategies/builder/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";

export function Inspector() {
    const { nodes, selectedNodeId, updateNodeData, removeNode } = useBuilderStore();

    // Memoize the selected node to avoid flickering? 
    // Zustand handles renders, but let's just find it cleanly.
    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    if (!selectedNode) {
        return (
            <div className="w-80 border-l border-white/5 bg-[#050505] p-6 flex items-center justify-center text-zinc-500 text-sm">
                Select a node to inspect
            </div>
        );
    }

    const { type, subType, params } = selectedNode.data;

    const handleParamChange = (key: string, value: any) => {
        updateNodeData(selectedNode.id, {
            params: { ...params, [key]: value }
        });
    };

    return (
        <div className="w-80 border-l border-white/5 bg-[#050505] flex flex-col h-full">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-white text-sm">{selectedNode.data.label}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">{selectedNode.id}</p>
                </div>
                <button
                    onClick={() => removeNode(selectedNode.id)}
                    className="p-2 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 rounded transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="p-4 space-y-6 flex-1 overflow-y-auto">

                {/* TRIGGER INFO */}
                {type === 'TRIGGER' && (
                    <div className="space-y-3">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                            <h4 className="text-emerald-400 font-semibold text-sm mb-2">🎯 Trigger Node</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Bu node stratejinin <strong className="text-emerald-300">başlangıç noktasıdır</strong>. Her mum kapanışında (bar close) otomatik olarak tetiklenir ve sinyal akışını başlatır.
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3 space-y-2">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Çıktı</div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">EVENT</span>
                                <span className="text-xs text-zinc-400">→ CandleSource'a bağlanır</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-zinc-600 italic">
                            💡 Trigger → CandleSource bağlantısı zorunludur.
                        </div>
                    </div>
                )}

                {/* CANDLE SOURCE INFO */}
                {type === 'CANDLE_SOURCE' && (
                    <div className="space-y-3">
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                            <h4 className="text-indigo-400 font-semibold text-sm mb-2">📊 Candle Source</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Bu node mum verilerini sağlar. <strong className="text-indigo-300">Close, High, Low, Open</strong> fiyat serilerini indikatörlere besler.
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3 space-y-2">
                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Girdi / Çıktı</div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">EVENT</span>
                                <span className="text-zinc-500">→</span>
                                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono">SERIES</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-zinc-600 italic">
                            💡 Çıktısını EMA, RSI gibi indikatörlere bağlayın.
                        </div>
                    </div>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {/* 🍳 RECIPE BUILDER PACKAGE NODE INSPECTORS */}
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

                {/* ENTRY ORDER CONFIG */}
                {type === 'ENTRY_ORDER' && (
                    <div className="space-y-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                            <h4 className="text-emerald-400 font-semibold text-sm mb-1">📥 Entry Order</h4>
                            <p className="text-[10px] text-zinc-500">Signal true olunca bu order tetiklenir.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Side</Label>
                            <Select value={params.side || 'LONG'} onValueChange={(v) => handleParamChange('side', v)}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LONG">🟢 LONG</SelectItem>
                                    <SelectItem value="SHORT">🔴 SHORT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Order Type</Label>
                            <Select value={params.orderType || 'MARKET'} onValueChange={(v) => handleParamChange('orderType', v)}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MARKET">Market</SelectItem>
                                    <SelectItem value="LIMIT">Limit</SelectItem>
                                    <SelectItem value="STOP">Stop</SelectItem>
                                    <SelectItem value="STOP_LIMIT">Stop-Limit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Quantity ({params.qty || 100}%)</Label>
                            <Slider
                                value={[params.qty || 100]}
                                min={1}
                                max={100}
                                step={1}
                                onValueChange={(val) => handleParamChange('qty', val[0])}
                            />
                        </div>

                        {(params.orderType === 'LIMIT' || params.orderType === 'STOP_LIMIT') && (
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Limit Price</Label>
                                <Input
                                    type="number"
                                    value={params.limitPrice || ''}
                                    onChange={(e) => handleParamChange('limitPrice', parseFloat(e.target.value) || null)}
                                    className="bg-zinc-900 border-zinc-800"
                                    placeholder="e.g. 95000"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* EXIT MANAGER CONFIG */}
                {type === 'EXIT_MANAGER' && (
                    <div className="space-y-4">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                            <h4 className="text-amber-400 font-semibold text-sm mb-1">🚪 Exit Manager</h4>
                            <p className="text-[10px] text-zinc-500">SL/TP/Trailing/Break-Even ayarları.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Stop Loss ({params.stopLossPct || 0}%)</Label>
                            <Slider
                                value={[params.stopLossPct || 2]}
                                min={0.5}
                                max={20}
                                step={0.5}
                                onValueChange={(val) => handleParamChange('stopLossPct', val[0])}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Take Profit ({params.takeProfitPct || 0}%)</Label>
                            <Slider
                                value={[params.takeProfitPct || 4]}
                                min={0.5}
                                max={50}
                                step={0.5}
                                onValueChange={(val) => handleParamChange('takeProfitPct', val[0])}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Trailing Stop ({params.trailingStopPct || 0}%)</Label>
                            <Slider
                                value={[params.trailingStopPct || 0]}
                                min={0}
                                max={10}
                                step={0.1}
                                onValueChange={(val) => handleParamChange('trailingStopPct', val[0] || null)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Break-Even @ Profit ({params.breakEvenAtProfitPct || 0}%)</Label>
                            <Slider
                                value={[params.breakEvenAtProfitPct || 0]}
                                min={0}
                                max={10}
                                step={0.1}
                                onValueChange={(val) => handleParamChange('breakEvenAtProfitPct', val[0] || null)}
                            />
                        </div>
                    </div>
                )}

                {/* POSITION POLICY CONFIG */}
                {type === 'POSITION_POLICY' && (
                    <div className="space-y-4">
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                            <h4 className="text-purple-400 font-semibold text-sm mb-1">📋 Position Policy</h4>
                            <p className="text-[10px] text-zinc-500">Mevcut pozisyon varsa ne yapılacak?</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">If Position Exists</Label>
                            <Select value={params.ifPositionExists || 'IGNORE'} onValueChange={(v) => handleParamChange('ifPositionExists', v)}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IGNORE">🚫 IGNORE - Sinyal atla</SelectItem>
                                    <SelectItem value="ADD">➕ ADD - Pozisyona ekle</SelectItem>
                                    <SelectItem value="FLIP">🔄 FLIP - Ters pozisyona geç</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                            <div>
                                <Label className="text-xs text-zinc-300">Cancel Open Orders</Label>
                                <p className="text-[9px] text-zinc-500">Yeni sinyalde açık emirleri iptal et</p>
                            </div>
                            <Switch
                                checked={params.cancelOpenOrders || false}
                                onCheckedChange={(v) => handleParamChange('cancelOpenOrders', v)}
                            />
                        </div>
                    </div>
                )}

                {/* DAILY GUARDS CONFIG */}
                {type === 'DAILY_GUARDS' && (
                    <div className="space-y-4">
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                            <h4 className="text-rose-400 font-semibold text-sm mb-1">🛡️ Daily Guards</h4>
                            <p className="text-[10px] text-zinc-500">Günlük risk limitleri ve korumalar.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Max Daily Loss ({params.maxDailyLossPct || 0}%)</Label>
                            <Slider
                                value={[params.maxDailyLossPct || 5]}
                                min={1}
                                max={25}
                                step={0.5}
                                onValueChange={(val) => handleParamChange('maxDailyLossPct', val[0])}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Max Trades Per Day</Label>
                            <Input
                                type="number"
                                value={params.maxTradesPerDay || 10}
                                onChange={(e) => handleParamChange('maxTradesPerDay', parseInt(e.target.value) || 10)}
                                className="bg-zinc-900 border-zinc-800"
                                min={1}
                                max={100}
                            />
                        </div>

                        <div className="flex items-center justify-between bg-rose-500/10 rounded-lg p-3">
                            <div>
                                <Label className="text-xs text-rose-300">Kill Switch</Label>
                                <p className="text-[9px] text-zinc-500">Aktifse tüm trading durur</p>
                            </div>
                            <Switch
                                checked={params.killSwitch || false}
                                onCheckedChange={(v) => handleParamChange('killSwitch', v)}
                            />
                        </div>
                    </div>
                )}

                {/* INDICATORS CONFIG */}
                {type === 'INDICATOR' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Period ({params.period})</Label>
                            <Slider
                                value={[params.period || 14]}
                                min={1}
                                max={200}
                                step={1}
                                onValueChange={(val) => handleParamChange('period', val[0])}
                            />
                        </div>
                    </div>
                )}

                {/* CONDITION COMPARE CONFIG */}
                {type === 'CONDITION' && subType === 'COMPARE' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Operator</Label>
                            <Select value={params.op} onValueChange={(v) => handleParamChange('op', v)}>
                                <SelectTrigger className=" bg-zinc-900 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=">">Greater Than (&gt;)</SelectItem>
                                    <SelectItem value="<">Less Than (&lt;)</SelectItem>
                                    <SelectItem value="==">Equals (==)</SelectItem>
                                    <SelectItem value="!=">Not Equals (!=)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* CONDITION CROSSOVER CONFIG */}
                {type === 'CONDITION' && subType === 'CROSSOVER' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Direction</Label>
                            <Select value={params.direction} onValueChange={(v) => handleParamChange('direction', v)}>
                                <SelectTrigger className=" bg-zinc-900 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UP">Crosses Up</SelectItem>
                                    <SelectItem value="DOWN">Crosses Down</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* PRICE_CROSS_LEVEL CONFIG */}
                {type === 'CONDITION' && subType === 'PRICE_CROSS_LEVEL' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Direction</Label>
                            <Select value={params.direction || 'DOWN'} onValueChange={(v) => handleParamChange('direction', v)}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UP">Crosses Up</SelectItem>
                                    <SelectItem value="DOWN">Crosses Down</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Price Level</Label>
                            <Input
                                type="number"
                                step="any"
                                value={params.level ?? 0}
                                onChange={e => handleParamChange('level', parseFloat(e.target.value) || 0)}
                                className="bg-zinc-900 border-zinc-800 font-mono text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* PRICE_IN_RANGE CONFIG */}
                {type === 'CONDITION' && subType === 'PRICE_IN_RANGE' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Low Price</Label>
                            <Input
                                type="number"
                                step="any"
                                value={params.low ?? 0}
                                onChange={e => handleParamChange('low', parseFloat(e.target.value) || 0)}
                                className="bg-zinc-900 border-zinc-800 font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">High Price</Label>
                            <Input
                                type="number"
                                step="any"
                                value={params.high ?? 0}
                                onChange={e => handleParamChange('high', parseFloat(e.target.value) || 0)}
                                className="bg-zinc-900 border-zinc-800 font-mono text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* ACTION CONFIG */}
                {type === 'ACTION' && (subType === 'OPEN_LONG' || subType === 'OPEN_SHORT') && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Position Size %</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={params.qtyPct}
                                    onChange={e => handleParamChange('qtyPct', parseFloat(e.target.value))}
                                    className="bg-zinc-900 border-zinc-800 font-mono text-xs"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* SET_LONG_UNITS / SET_SHORT_UNITS CONFIG */}
                {type === 'ACTION' && (subType === 'SET_LONG_UNITS' || subType === 'SET_SHORT_UNITS') && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Units</Label>
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                value={params.units ?? 1}
                                onChange={e => handleParamChange('units', parseInt(e.target.value) || 0)}
                                className="bg-zinc-900 border-zinc-800 font-mono text-sm"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-600">
                            {subType === 'SET_LONG_UNITS' ? 'Set number of long hedge units' : 'Set number of short hedge units'}
                        </p>
                    </div>
                )}

                {/* RISK CONFIG */}
                {type === 'RISK' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Max Leverage (x)</Label>
                            <Input
                                type="number"
                                value={params.maxLeverage || 1}
                                onChange={e => handleParamChange('maxLeverage', parseFloat(e.target.value))}
                                className="bg-zinc-900 border-zinc-800 font-mono text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Take Profit %</Label>
                            <Input
                                type="number"
                                value={params.tpPct || ''}
                                onChange={e => handleParamChange('tpPct', parseFloat(e.target.value))}
                                className="bg-zinc-900 border-zinc-800 font-mono text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Stop Loss %</Label>
                            <Input
                                type="number"
                                value={params.slPct || ''}
                                onChange={e => handleParamChange('slPct', parseFloat(e.target.value))}
                                className="bg-zinc-900 border-zinc-800 font-mono text-xs"
                            />
                        </div>
                    </div>
                )}

                {/* CANDLE_SOURCE CONFIG */}
                {type === 'CANDLE_SOURCE' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Price Field</Label>
                            <Select value={params.field || 'close'} onValueChange={(v) => handleParamChange('field', v)}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="close">Close</SelectItem>
                                    <SelectItem value="volume">Volume</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                                Symbol & Timeframe are inherited from strategy meta settings in the toolbar.
                            </p>
                        </div>
                    </div>
                )}

                {/* VALUE (CONSTANT) CONFIG */}
                {type === 'VALUE' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Constant Value</Label>
                            <Input
                                type="number"
                                step="any"
                                value={params.value ?? 0}
                                onChange={e => handleParamChange('value', parseFloat(e.target.value) || 0)}
                                className="bg-zinc-900 border-zinc-800 font-mono text-sm"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-600">
                            Use for thresholds like RSI levels (30, 70) or fixed values.
                        </p>
                    </div>
                )}

                {/* LOGIC (AND/OR) CONFIG */}
                {type === 'LOGIC' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Logic Gate Type</Label>
                            <Select value={subType || 'AND'} onValueChange={(v) => updateNodeData(selectedNode.id, { subType: v, label: `${v} Gate` })}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AND">AND (Both true)</SelectItem>
                                    <SelectItem value="OR">OR (Either true)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 text-[10px] text-zinc-500">
                            <p><strong className="text-white">AND:</strong> Both inputs must be true</p>
                            <p className="mt-1"><strong className="text-white">OR:</strong> At least one input must be true</p>
                        </div>
                    </div>
                )}

                {/* HEDGE (MIN_HEDGE) CONFIG */}
                {type === 'HEDGE' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Min Long Units</Label>
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                value={params.minLongUnits ?? 0}
                                onChange={e => handleParamChange('minLongUnits', parseInt(e.target.value) || 0)}
                                className="bg-zinc-900 border-zinc-800 font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Min Short Units</Label>
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                value={params.minShortUnits ?? 0}
                                onChange={e => handleParamChange('minShortUnits', parseInt(e.target.value) || 0)}
                                className="bg-zinc-900 border-zinc-800 font-mono text-sm"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-600">
                            Minimum hedge guard configuration. Validation ensures values are set.
                        </p>
                    </div>
                )}

                {/* GUARD: COOLDOWN_BARS CONFIG */}
                {type === 'GUARD' && subType === 'COOLDOWN_BARS' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Cooldown Bars</Label>
                            <Input
                                type="number"
                                min={1}
                                step={1}
                                value={params.bars ?? 5}
                                onChange={e => handleParamChange('bars', parseInt(e.target.value) || 1)}
                                className="bg-zinc-900 border-zinc-800 font-mono text-sm"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-600">
                            Action tetiklendikten sonra N bar boyunca tekrar tetiklenmez. Spam önler.
                        </p>
                    </div>
                )}

                {/* GUARD: ONCE_PER_CROSS CONFIG */}
                {type === 'GUARD' && subType === 'ONCE_PER_CROSS' && (
                    <div className="space-y-4">
                        <p className="text-[10px] text-zinc-600">
                            Bu guard aktif olduğunda, PRICE_CROSS_LEVEL veya CROSSOVER koşulları yalnızca kesişim anında bir kez tetiklenir. Tekrar spam önler.
                        </p>
                    </div>
                )}

                {/* EXPR (Custom Expression) CONFIG */}
                {type === 'EXPR' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Boolean Expression</Label>
                            <textarea
                                value={params.expression ?? ''}
                                onChange={e => handleParamChange('expression', e.target.value)}
                                placeholder="rsi(close,14) < 30 && ema(close,20) > ema(close,50)"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-xs p-2 h-24 resize-none text-white"
                            />
                        </div>
                        <div className="p-2 bg-black/30 rounded text-[10px] text-zinc-500">
                            <strong className="text-zinc-400">Whitelist:</strong> ema, sma, rsi, highest, lowest, abs, min, max
                        </div>
                        <div className="p-2 bg-fuchsia-500/10 rounded text-[10px] text-fuchsia-300">
                            <strong>Örnek:</strong> rsi(close,14) {'<'} 30 && ema(close,20) {'>'} ema(close,50)
                        </div>
                    </div>
                )}

                {/* CLOSE_PARTIAL_PCT CONFIG */}
                {type === 'ACTION' && subType === 'CLOSE_PARTIAL_PCT' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Close Percentage</Label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                step={1}
                                value={params.pct ?? 50}
                                onChange={e => handleParamChange('pct', parseInt(e.target.value) || 50)}
                                className="bg-zinc-900 border-zinc-800 font-mono text-sm"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-600">
                            Açık pozisyonun yüzde kaçını kapatacağını belirler.
                        </p>
                    </div>
                )}

                {/* Generic JSON view for debug */}
                <div className="pt-4 border-t border-white/5">
                    <Label className="text-[10px] text-zinc-600 mb-2 block">Raw Params</Label>
                    <pre className="text-[10px] text-zinc-500 font-mono bg-black/20 p-2 rounded overflow-x-auto">
                        {JSON.stringify(params, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
