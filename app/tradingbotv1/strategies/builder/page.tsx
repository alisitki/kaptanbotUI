
"use client";

import { Canvas } from "@/components/strategy-builder/Canvas";
import { BlockLibrary } from "@/components/strategy-builder/BlockLibrary";
import { Inspector } from "@/components/strategy-builder/Inspector";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Save, Play, Download, Upload, CheckCircle2, AlertTriangle, LayoutTemplate } from "lucide-react";
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

export default function StrategyBuilderPage() {
    const { meta, setMeta, getStrategyJSON, loadStrategy, reset, validate, validationErrors } = useBuilderStore();
    const [showTemplates, setShowTemplates] = useState(false);

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
            toast.success("Strategy is Valid", { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> });
        } else {
            toast.error("Validation Failed", {
                description: "Check the status bar for details.",
                icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
            });
        }
    };

    const handleSave = () => {
        // Just trigger toast for local persistence (which happens auto via zustand persist)
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
                    } catch (err) {
                        toast.error("Invalid Strategy JSON");
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
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

                <div className="flex items-center gap-2">
                    <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                                <LayoutTemplate className="h-4 w-4 mr-2" />
                                Templates
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Choose a Strategy Template</DialogTitle>
                                <DialogDescription className="text-zinc-400">
                                    Start with a pre-configured strategy structure.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-3 py-4">
                                {Object.entries(STRATEGY_TEMPLATES).map(([key, tpl]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleLoadTemplate(key)}
                                        className="flex flex-col items-start p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-left group"
                                    >
                                        <span className="font-medium text-zinc-200 group-hover:text-white">{tpl.meta.name}</span>
                                        <span className="text-xs text-zinc-500 mt-1">
                                            {key === 'EMA_CROSS_LONG' ? 'Classic trend following with dual EMAs' :
                                                key === 'RSI_OVERSOLD' ? 'Mean reversion using RSI < 30' :
                                                    'Breakout strategy using Donchian channels'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <div className="h-4 w-px bg-white/10 mx-2" />

                    <Button variant="ghost" size="sm" onClick={handleValidate} className="h-8 text-zinc-400 hover:text-white">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Validate
                    </Button>
                    <div className="h-4 w-px bg-white/10 mx-2" />
                    <Button variant="ghost" size="sm" onClick={handleImport} className="h-8 text-zinc-400 hover:text-white">
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleExport} className="h-8 text-zinc-400 hover:text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="ghost" size="sm" onClick={reset} className="h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                        Reset
                    </Button>
                    <div className="h-4 w-px bg-white/10 mx-2" />
                    <Button size="sm" onClick={handleSave} className="h-8 bg-indigo-500 hover:bg-indigo-600 text-white border-0">
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </Button>
                </div>
            </header>

            {/* Validation Errors Bar */}
            {validationErrors.length > 0 && (() => {
                const errorCount = validationErrors.filter(e => e.startsWith('[ERROR]')).length;
                const warningCount = validationErrors.filter(e => e.startsWith('[WARNING]')).length;
                return (
                    <div className={`border-b px-4 py-2 flex items-start gap-3 ${errorCount > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'
                        }`}>
                        <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${errorCount > 0 ? 'text-rose-500' : 'text-amber-500'
                            }`} />
                        <div className="flex flex-col gap-1 flex-1">
                            <div className="flex items-center gap-3 text-xs font-medium">
                                {errorCount > 0 && <span className="text-rose-400">{errorCount} error{errorCount > 1 ? 's' : ''}</span>}
                                {warningCount > 0 && <span className="text-amber-400">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>}
                            </div>
                            {validationErrors.map((err, i) => (
                                <span key={i} className={`text-[11px] ${err.startsWith('[ERROR]') ? 'text-rose-300/80' : 'text-amber-200/70'
                                    }`}>
                                    {err.replace('[ERROR] ', '').replace('[WARNING] ', '')}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden">
                <BlockLibrary />
                <div className="flex-1 relative">
                    <Canvas />
                </div>
                <Inspector />
            </div>
        </div>
    );
}
