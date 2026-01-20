"use client";

import { useBuilderStore } from "@/lib/strategies/builder/store";
import { AlertCircle, AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ValidationPanel() {
    const { validationErrors, zoomToNode, validate } = useBuilderStore();
    const [isExpanded, setIsExpanded] = useState(false);

    const errorCount = validationErrors.filter(e => e.message.startsWith('[ERROR]')).length;
    const warningCount = validationErrors.filter(e => e.message.startsWith('[WARNING]')).length;

    if (validationErrors.length === 0) return null;

    const handleItemClick = (nodeId?: string) => {
        if (nodeId) {
            zoomToNode(nodeId);
        }
    };

    return (
        <div className="absolute bottom-4 left-4 right-4 z-50">
            <div className="bg-zinc-900/95 backdrop-blur border border-zinc-800 rounded-lg shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-zinc-800/50">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity"
                    >
                        {errorCount > 0 && (
                            <div className="flex items-center gap-1.5 text-rose-400">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">{errorCount} Error{errorCount > 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {warningCount > 0 && (
                            <div className="flex items-center gap-1.5 text-amber-400">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">{warningCount} Warning{warningCount > 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {isExpanded ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronUp className="h-4 w-4 ml-auto" />}
                    </button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs ml-2"
                        onClick={() => validate()}
                    >
                        Revalidate
                    </Button>
                </div>

                {/* Expanded List */}
                {isExpanded && (
                    <ScrollArea className="max-h-48 border-t border-zinc-800">
                        <div className="p-2 space-y-1">
                            {validationErrors.map((err, i) => {
                                const isError = err.message.startsWith('[ERROR]');
                                const cleanMessage = err.message.replace(/^\[(ERROR|WARNING)\]\s*/, '');

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleItemClick(err.nodeId)}
                                        className={`w-full flex items-start gap-2 p-2 rounded text-left hover:bg-white/5 transition-colors ${err.nodeId ? 'cursor-pointer' : 'cursor-default'}`}
                                    >
                                        {isError ? (
                                            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs ${isError ? 'text-rose-300' : 'text-amber-300'}`}>
                                                {cleanMessage}
                                            </div>
                                            {err.hint && (
                                                <div className="text-[10px] text-zinc-500 mt-0.5">
                                                    💡 {err.hint}
                                                </div>
                                            )}
                                        </div>
                                        {err.nodeId && (
                                            <span className="text-[10px] text-zinc-600">Click to zoom</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}
