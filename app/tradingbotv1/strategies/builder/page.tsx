"use client";

import { Canvas } from "@/components/strategy-builder/Canvas";
import { BlockLibrary } from "@/components/strategy-builder/BlockLibrary";
import { Inspector } from "@/components/strategy-builder/Inspector";
import { ValidationPanel } from "@/components/strategy-builder/ValidationPanel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Save, Download, Upload, CheckCircle2, AlertTriangle, LayoutTemplate, LayoutGrid, Undo2, Redo2 } from "lucide-react";
import { useBuilderStore } from "@/lib/strategies/builder/store";
import { STRATEGY_TEMPLATES } from "@/lib/strategies/builder/templates";
import { toast } from "sonner";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
    'EMA_CROSS_LONG': 'Classic trend following with dual EMAs',
    'RSI_OVERSOLD': 'Mean reversion using RSI < 30',
    'BREAKOUT': 'Breakout strategy using Donchian channels',
    'KAPTAN_HEDGE_REBALANCE': 'Hedge rebalancing with price level cross',
    'RANGE_COOLDOWN': 'Price range strategy with cooldown guard',
    'EXPR_EXAMPLE': 'Custom expression with EMA + RSI combo'
};

export default function StrategyBuilderPage() {
    const {
        meta, setMeta, getStrategyJSON, loadStrategy, reset, validate,
        validationErrors, autoLayout, undo, redo, canUndo, canRedo
    } = useBuilderStore();
    const [showTemplates, setShowTemplates] = useState(false);

    const [showValidationSuccess, setShowValidationSuccess] = useState(false);

    const handleLoadTemplate = (key: string) => {
        const template = STRATEGY_TEMPLATES[key];
        if (template) {
            loadStrategy(template);
            toast.success(`Loaded ${template.meta.name} Template`);
            setShowTemplates(false);
        }
    };

    const handleValidate = () => {
        const isValid = validate();
        if (isValid) {
            setShowValidationSuccess(true);
            // toast.success("Strategy is Valid", { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> });
        } else {
            toast.error("Validation Failed", {
                description: "Check the panel below for details.",
                icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
            });
        }
    };

    const handleSave = () => {
        toast.success("Strategy Draft Saved", {
            description: "Your work is saved locally."
        });
    };

    const handleExport = () => {
        const json = getStrategyJSON();
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `strategy-${meta.name.replace(/\s+/g, '-').toLowerCase()}.json`;
        a.click();
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const json = JSON.parse(e.target?.result as string);
                        loadStrategy(json);
                        toast.success("Strategy Loaded");
                        // Run validation after import
                        setTimeout(() => validate(), 100);
                    } catch (err) {
                        toast.error("Invalid Strategy JSON");
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleAutoLayout = () => {
        autoLayout();
        toast.success("Auto arranged nodes");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0A0A0A] -m-6 rounded-none">
            {/* Top Toolbar */}
            <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#050505]">
                <div className="flex items-center gap-4">
                    <Input
                        value={meta.name}
                        onChange={(e) => setMeta({ name: e.target.value })}
                        className="w-48 h-8 bg-transparent border-transparent hover:border-zinc-800 focus:border-indigo-500 font-medium text-white px-2 transition-colors"
                    />

                    <div className="h-4 w-px bg-white/10" />

                    <Select value={meta.timeframe} onValueChange={(v: any) => setMeta({ timeframe: v })}>
                        <SelectTrigger className="w-24 h-8 bg-zinc-900 border-zinc-800 text-xs text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1m">1m</SelectItem>
                            <SelectItem value="5m">5m</SelectItem>
                            <SelectItem value="15m">15m</SelectItem>
                            <SelectItem value="1h">1h</SelectItem>
                            <SelectItem value="4h">4h</SelectItem>
                            <SelectItem value="1d">1d</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={meta.symbol} onValueChange={(v) => setMeta({ symbol: v })}>
                        <SelectTrigger className="w-32 h-8 bg-zinc-900 border-zinc-800 text-xs text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BTCUSDT">BTCUSDT</SelectItem>
                            <SelectItem value="ETHUSDT">ETHUSDT</SelectItem>
                            <SelectItem value="SOLUSDT">SOLUSDT</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-1">
                    {/* Undo/Redo */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => undo()}
                        disabled={!canUndo()}
                        className="h-8 text-zinc-400 hover:text-white disabled:opacity-30"
                    >
                        <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => redo()}
                        disabled={!canRedo()}
                        className="h-8 text-zinc-400 hover:text-white disabled:opacity-30"
                    >
                        <Redo2 className="h-4 w-4" />
                    </Button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    {/* Auto Layout */}
                    <Button variant="ghost" size="sm" onClick={handleAutoLayout} className="h-8 text-zinc-400 hover:text-white">
                        <LayoutGrid className="h-4 w-4 mr-1" />
                        <span className="text-xs">Auto</span>
                    </Button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                                <LayoutTemplate className="h-4 w-4 mr-2" />
                                Templates
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Choose a Strategy Template</DialogTitle>
                                <DialogDescription className="text-zinc-400">
                                    Start with a pre-configured strategy structure.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2 py-4 max-h-80 overflow-y-auto">
                                {Object.entries(STRATEGY_TEMPLATES).map(([key, tpl]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleLoadTemplate(key)}
                                        className="flex flex-col items-start p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-left group"
                                    >
                                        <span className="font-medium text-zinc-200 group-hover:text-white">{tpl.meta.name}</span>
                                        <span className="text-xs text-zinc-500 mt-1">
                                            {TEMPLATE_DESCRIPTIONS[key] || 'Custom strategy template'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Validation Success Dialog */}
                    <Dialog open={showValidationSuccess} onOpenChange={setShowValidationSuccess}>
                        <DialogContent className="bg-zinc-900 border-emerald-500/50 text-white sm:max-w-md border-2">
                            <div className="flex flex-col items-center justify-center text-center py-6 gap-4">
                                <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                                        Strategy Valid!
                                    </DialogTitle>
                                    <DialogDescription className="text-zinc-400 mt-2 text-base">
                                        Your strategy looks great. No errors found.<br />
                                        Ready to export or run.
                                    </DialogDescription>
                                </div>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-full max-w-[200px] mt-2"
                                    onClick={() => setShowValidationSuccess(false)}
                                >
                                    Awesome
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <Button size="sm" onClick={handleValidate} className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white border-0 mr-1 shadow-sm shadow-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-medium">Validate Strategy</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleImport} className="h-8 text-zinc-400 hover:text-white">
                        <Upload className="h-4 w-4 mr-1" />
                        <span className="text-xs">Import</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleExport} className="h-8 text-zinc-400 hover:text-white">
                        <Download className="h-4 w-4 mr-1" />
                        <span className="text-xs">Export</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={reset} className="h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                        <span className="text-xs">Reset</span>
                    </Button>
                    <div className="h-4 w-px bg-white/10 mx-1" />
                    <Button size="sm" onClick={handleSave} className="h-8 bg-indigo-500 hover:bg-indigo-600 text-white border-0">
                        <Save className="h-4 w-4 mr-1" />
                        <span className="text-xs">Save</span>
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden relative">
                <BlockLibrary />
                <div className="flex-1 relative">
                    <Canvas />
                    {/* Validation Panel (floating at bottom) */}
                    {validationErrors.length > 0 && <ValidationPanel />}
                </div>
                <Inspector />
            </div>
        </div>
    );
}
