'use client';

import { useEffect, useState } from 'react';
import { StrategyDecision, getQuantLabDecision } from '@/lib/api/quantlab';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Fingerprint, Target, Activity, Code2 } from 'lucide-react';
import clsx from 'clsx';

interface DecisionDetailDrawerProps {
    decisionId: string | null;
    initialData?: StrategyDecision | null;
    onClose: () => void;
}

export function DecisionDetailDrawer({ decisionId, initialData, onClose }: DecisionDetailDrawerProps) {
    const [decision, setDecision] = useState<StrategyDecision | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Synchronize with initialData if available
    useEffect(() => {
        if (initialData) {
            setDecision(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        if (!decisionId) {
            setDecision(null);
            return;
        }

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getQuantLabDecision(decisionId);
                // Merge to keep metadata from list view (initialData)
                setDecision(prev => ({ ...prev, ...data } as StrategyDecision));
            } catch (err: any) {
                console.error('Failed to fetch decision detail:', err);
                setError(err.message || 'Failed to load details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [decisionId]);

    const isOpen = Boolean(decisionId);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[90vw] sm:max-w-xl bg-[#0A0A0A] border-white/5 text-slate-200">
                <SheetHeader className="border-b border-white/5 pb-4">
                    <div className="flex items-center justify-between pr-10">
                        <SheetTitle className="text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-400" />
                            Decision Details
                        </SheetTitle>
                        {decision && (
                            <Badge variant="outline" className={clsx(
                                "text-[10px] font-bold",
                                decision.decision?.includes('PROMOTE') ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                                    decision.decision?.includes('HOLD') ? "text-amber-400 border-amber-500/20 bg-amber-500/5" :
                                        decision.decision?.includes('REJECT') ? "text-red-400 border-red-500/20 bg-red-500/5" :
                                            "text-slate-400 border-white/10 bg-white/5"
                            )}>
                                {decision.decision}
                            </Badge>
                        )}
                    </div>
                    <SheetDescription className="text-slate-400 font-mono text-xs">
                        ID: {decisionId}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-mono">Fetching full decision payload...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    ) : decision ? (
                        <div className="space-y-8">
                            {/* Summary Section */}
                            <section className="space-y-4">
                                <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Summary
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/[0.03] p-3 rounded-lg border border-white/5">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Time (UTC)</p>
                                        <p className="font-mono text-sm">
                                            {decision.created_at ? new Date(decision.created_at).toISOString().replace('T', ' ').split('.')[0] : '—'}
                                        </p>
                                    </div>
                                    <div className="bg-white/[0.03] p-3 rounded-lg border border-white/5">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Strategy</p>
                                        <p className="font-mono text-sm">{decision.strategy_id}</p>
                                    </div>
                                    <div className="bg-white/[0.03] p-3 rounded-lg border border-white/5 col-span-2">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Reason</p>
                                        <p className="text-sm text-slate-300">
                                            {decision.reasons && decision.reasons.length > 0
                                                ? decision.reasons.join(', ')
                                                : decision.reason || '—'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Payload Section */}
                            <section className="space-y-4">
                                <h3 className="text-xs uppercase font-bold text-slate-500 tracking-widest flex items-center gap-2">
                                    <Code2 className="w-3 h-3" /> Raw Payload
                                </h3>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-colors" />
                                    <pre className="relative bg-[#050505] p-4 rounded-xl border border-white/10 font-mono text-[11px] overflow-x-auto text-indigo-300/80 custom-scrollbar">
                                        {JSON.stringify(decision.payload || decision, null, 2)}
                                    </pre>
                                </div>
                            </section>
                        </div>
                    ) : null}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
