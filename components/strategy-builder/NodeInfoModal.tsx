"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface NodeInfoModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    nodeInfo: {
        type: string;
        label: string;
        description: string;
        inputs: string[];
        outputs: string[];
        example?: string;
    } | null;
}

const DISMISSED_KEY = 'kaptanbot-dismissed-node-info';

function getDismissedNodes(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
    } catch {
        return [];
    }
}

function setDismissedNode(type: string) {
    const dismissed = getDismissedNodes();
    if (!dismissed.includes(type)) {
        dismissed.push(type);
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    }
}

export function isNodeInfoDismissed(type: string): boolean {
    return getDismissedNodes().includes(type);
}

export function NodeInfoModal({ open, onClose, onConfirm, nodeInfo }: NodeInfoModalProps) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        setDontShowAgain(false);
    }, [nodeInfo?.type]);

    if (!nodeInfo) return null;

    const handleConfirm = () => {
        if (dontShowAgain && nodeInfo.type) {
            setDismissedNode(nodeInfo.type);
        }
        onConfirm();
    };

    const typeColorMap: Record<string, string> = {
        'Event': 'bg-emerald-500/20 text-emerald-400',
        'Series': 'bg-blue-500/20 text-blue-400',
        'Scalar': 'bg-yellow-500/20 text-yellow-400',
        'Boolean': 'bg-purple-500/20 text-purple-400',
        'Bool': 'bg-purple-500/20 text-purple-400',
        'Config': 'bg-zinc-500/20 text-zinc-400',
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {nodeInfo.label}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {nodeInfo.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Input/Output types */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] uppercase text-zinc-500 mb-1">Inputs</div>
                            <div className="flex flex-wrap gap-1">
                                {nodeInfo.inputs.length > 0 ? nodeInfo.inputs.map((inp, i) => (
                                    <Badge key={i} variant="outline" className={typeColorMap[inp] || 'bg-zinc-700 text-zinc-300'}>
                                        {inp}
                                    </Badge>
                                )) : (
                                    <span className="text-[10px] text-zinc-500">None</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-zinc-500 mb-1">Outputs</div>
                            <div className="flex flex-wrap gap-1">
                                {nodeInfo.outputs.length > 0 ? nodeInfo.outputs.map((out, i) => (
                                    <Badge key={i} variant="outline" className={typeColorMap[out] || 'bg-zinc-700 text-zinc-300'}>
                                        {out}
                                    </Badge>
                                )) : (
                                    <span className="text-[10px] text-zinc-500">None (Terminal)</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Example */}
                    {nodeInfo.example && (
                        <div className="bg-black/30 rounded-lg p-3">
                            <div className="text-[10px] uppercase text-zinc-500 mb-1">Example</div>
                            <code className="text-xs text-emerald-400">{nodeInfo.example}</code>
                        </div>
                    )}

                    {/* Don't show again */}
                    <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                            id="dontShowAgain"
                            checked={dontShowAgain}
                            onCheckedChange={(c) => setDontShowAgain(c === true)}
                        />
                        <Label htmlFor="dontShowAgain" className="text-xs text-zinc-400 cursor-pointer">
                            Bu node için tekrar gösterme
                        </Label>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={onClose}>İptal</Button>
                    <Button onClick={handleConfirm} className="bg-indigo-600 hover:bg-indigo-700">Ekle</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
