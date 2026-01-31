'use client';

import { StrategyDecision } from '@/lib/api/quantlab';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Fingerprint, Target, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface StrategyRunsTableProps {
    decisions: StrategyDecision[];
    onSelectDecision: (decision: StrategyDecision) => void;
    isLoading?: boolean;
}

export function StrategyRunsTable({ decisions, onSelectDecision, isLoading }: StrategyRunsTableProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500 animate-pulse">
                Loading strategy runs...
            </div>
        );
    }

    if (decisions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">No strategy runs yet</p>
                <p className="text-xs opacity-40">System is monitoring for new decisions...</p>
            </div>
        );
    }


    return (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5 bg-white/[0.03]">
                        <TableHead className="w-[180px] text-[10px] uppercase font-bold tracking-widest text-slate-500 h-10">
                            <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> Time (UTC)</span>
                        </TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-slate-500 h-10">
                            <span className="flex items-center gap-2"><Fingerprint className="w-3 h-3" /> Strategy ID</span>
                        </TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-slate-500 h-10">
                            <span className="flex items-center gap-2"><Target className="w-3 h-3" /> Seed</span>
                        </TableHead>
                        <TableHead className="text-[10px] uppercase font-bold tracking-widest text-slate-500 h-10 text-right">Decision</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {decisions.map((d) => (
                        <TableRow
                            key={d.id}
                            className="hover:bg-white/5 border-white/5 cursor-pointer transition-colors group"
                            onClick={() => onSelectDecision(d)}
                        >
                            <TableCell className="font-mono text-[11px] text-slate-400">
                                {d.created_at ? new Date(d.created_at).toISOString().replace('T', ' ').split('.')[0] : '—'}
                            </TableCell>
                            <TableCell className="font-mono text-[11px] text-slate-300">
                                {d.strategy_id}
                            </TableCell>
                            <TableCell className="font-mono text-[11px] text-slate-500">
                                {d.seed}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex flex-col items-end">
                                    {d.decision ? (
                                        <Badge className={clsx(
                                            "font-mono text-[9px] px-1.5 py-0 rounded-sm border-none",
                                            d.decision.includes('PROMOTE') && "bg-emerald-500/10 text-emerald-500",
                                            d.decision.includes('HOLD') && "bg-amber-500/10 text-amber-500",
                                            d.decision.includes('REJECT') && "bg-rose-500/10 text-rose-500",
                                            !['PROMOTE', 'HOLD', 'REJECT'].some(s => d.decision?.includes(s)) && "bg-slate-500/10 text-slate-500"
                                        )}>
                                            {d.decision}
                                        </Badge>
                                    ) : (
                                        <span className="text-slate-300 font-mono text-[11px]">—</span>
                                    )}
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity italic mt-0.5">view</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
