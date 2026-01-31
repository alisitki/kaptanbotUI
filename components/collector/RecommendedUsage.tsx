'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { CollectorDaySummary } from '@/lib/api/quantlab';

export function RecommendedUsage({ data }: { data: CollectorDaySummary | null }) {
    if (!data) {
        return (
            <div className="space-y-4 opacity-40">
                <h3 className="text-xs uppercase font-bold ml-1">Usage Recommendation</h3>
                <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center h-32">
                    <span className="text-xs uppercase font-mono">No Data</span>
                </div>
            </div>
        );
    }

    const Item = ({ label, allowed }: { label: string, allowed: boolean }) => (
        <div className={clsx("flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors",
            allowed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
        )}>
            {allowed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
            <div>
                <div className="text-xs uppercase opacity-50 font-bold">{label}</div>
                <div className={clsx("font-bold text-sm", allowed ? "text-emerald-100" : "text-red-100")}>
                    {allowed ? "RECOMMENDED" : "UNSAFE"}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold opacity-40 ml-1">Usage Recommendation</h3>
            <div className="grid grid-cols-2 gap-4">
                <Item label="ML Backtesting" allowed={data.recommended_usage.ml_backtest} />
                <Item label="Production Trading" allowed={data.recommended_usage.production_trading} />
            </div>
            {data.recommended_usage.notes && (
                <div className="text-xs text-slate-400 italic px-2">
                    Note: {data.recommended_usage.notes}
                </div>
            )}
        </div>
    );
}
