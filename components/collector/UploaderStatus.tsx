'use client';

import { CollectorUploaderNow } from '@/lib/api/quantlab';
import { CloudUpload, AlertCircle, CheckCircle2, Server, Clock } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export function UploaderStatus({ data }: { data: CollectorUploaderNow | null }) {
    if (!data) {
        return (
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm flex items-center justify-center h-48">
                <div className="flex flex-col items-center gap-2 opacity-40">
                    <CloudUpload className="w-8 h-8" />
                    <span className="font-mono text-sm uppercase">No Uploader Data</span>
                </div>
            </div>
        );
    }

    const stateColors = {
        READY: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
        DEGRADED: "text-amber-400 border-amber-500/20 bg-amber-500/10",
        BAD: "text-red-400 border-red-500/20 bg-red-500/10",
        ERROR: "text-red-400 border-red-500/20 bg-red-500/10",
    };

    const isHealthy = data.state === 'READY';

    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-medium flex items-center gap-2">
                        <CloudUpload className="w-5 h-5 text-sky-400" />
                        S3 Uploader Status
                    </h2>
                    <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">
                        Pipeline Storage
                    </div>
                </div>

                <div className={clsx("px-3 py-1.5 rounded-lg border flex items-center gap-2 font-mono font-bold text-sm", stateColors[data.state])}>
                    <div className={clsx("w-2 h-2 rounded-full animate-pulse",
                        data.state === 'READY' ? 'bg-emerald-400' :
                            data.state === 'DEGRADED' ? 'bg-amber-400' : 'bg-red-400')}
                    />
                    {data.state}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                    <div className="flex items-center gap-2 text-xs uppercase opacity-50 font-bold mb-1">
                        <Server className="w-3 h-3" />
                        Pending Files
                    </div>
                    <div className={clsx("text-2xl font-mono font-bold", data.pending_files > 1000 ? "text-amber-400" : "text-white")}>
                        {data.pending_files.toLocaleString()}
                    </div>
                    <div className="text-[10px] opacity-40 mt-1 font-mono">
                        {data.spool_size_gb.toFixed(3)} GB Spooled
                    </div>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                    <div className="flex items-center gap-2 text-xs uppercase opacity-50 font-bold mb-1">
                        <Clock className="w-3 h-3" />
                        Last Upload
                    </div>
                    <div className={clsx("text-xl font-mono font-bold", data.seconds_since_last_success > 60 ? "text-amber-400" : "text-emerald-400")}>
                        {data.seconds_since_last_success}s <span className="text-sm opacity-50 font-normal">ago</span>
                    </div>
                    <div className="text-[10px] opacity-40 mt-1 font-mono truncate">
                        {data.last_success_upload_utc.split('T')[1].replace('Z', '')} UTC
                    </div>
                </div>
            </div>

            {/* Alert Status if BAD */}
            {(data.state === 'BAD' || data.alert_sent_24h) && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-red-400 font-mono">
                    <AlertCircle className="w-4 h-4" />
                    <span>ALERT SENT TO OPS</span>
                </div>
            )}
        </div>
    );
}
