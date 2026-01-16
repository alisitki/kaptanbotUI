"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Trophy,
    TrendingUp,
    TrendingDown,
    Percent,
    BarChart3,
    AlertTriangle,
    RefreshCcw,
    Calendar,
    Share2,
    Copy,
    Check
} from "lucide-react";
import { SessionStats } from "@/lib/game/types";
import { RankBadge, getRank } from "./RankBadge";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface EndModalProps {
    isOpen: boolean;
    stats: SessionStats;
    endReason: 'completed' | 'margin_call' | 'liquidated' | null;
    onPlayAgain: () => void;
    onChooseDate: () => void;
}

export function EndModal({
    isOpen,
    stats,
    endReason,
    onPlayAgain,
    onChooseDate,
}: EndModalProps) {
    const [copied, setCopied] = useState(false);

    const isProfit = stats.totalPnl >= 0;
    const isMarginCall = endReason === 'margin_call';
    const isLiquidated = endReason === 'liquidated';

    const handleShare = async () => {
        const rank = getRank(stats.maxStreak);
        const text = `Price Action Master 🥋\n\n` +
            `PNL: ${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toFixed(2)} (${stats.returnPct.toFixed(2)}%)\n` +
            `Rank: ${rank} (${stats.maxStreak} Win Streak)\n` +
            `Win Rate: ${stats.winRate.toFixed(1)}% (${stats.totalTrades} Trades)\n` +
            `Max ROE: ${stats.maxRoe.toFixed(2)}%\n\nRastgele mumlarla trade et!`;

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Sonuç kopyalandı!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Kopyalama başarısız");
        }
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-white sm:max-w-[500px] overflow-hidden p-0 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                {/* Glowing Border specific to outcome */}
                <div className={`absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b ${isLiquidated ? 'from-red-600 via-transparent to-transparent' : isProfit ? 'from-emerald-600 via-transparent to-transparent' : 'from-zinc-600 via-transparent to-transparent'}`} />

                <div className="p-6 relative z-10">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="flex flex-col items-center gap-2 text-center">
                            {isMarginCall || isLiquidated ? (
                                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-2 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <Trophy className="w-8 h-8 text-emerald-500" />
                                </div>
                            )}

                            <span className={`text-2xl font-black uppercase tracking-wider ${isLiquidated ? 'text-rose-500' : isProfit ? 'text-emerald-400' : 'text-zinc-200'}`}>
                                {isLiquidated ? 'LİKİT OLDUN!' : isMarginCall ? 'MARGIN CALL!' : 'OYUN BİTTİ'}
                            </span>

                            <div className="flex items-center gap-2 mt-1">
                                <RankBadge streak={stats.maxStreak} className="text-sm py-1 px-3" />
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {/* Main PnL Card */}
                    <div className="bg-white/5 rounded-xl p-6 text-center border border-white/5 mb-6 shadow-inner relative overflow-hidden group">
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r ${isProfit ? 'from-emerald-500/0 via-emerald-500 to-emerald-500/0' : 'from-rose-500/0 via-rose-500 to-rose-500/0'} -skew-x-12`} />

                        <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Toplam PnL</div>
                        <div className={`text-5xl font-mono font-black tracking-tight mb-1 ${isProfit ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`}>
                            {isProfit ? '+' : ''}${stats.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-lg font-mono font-medium ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ({isProfit ? '+' : ''}{stats.returnPct.toFixed(2)}%)
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <StatItem
                            icon={<BarChart3 className="w-4 h-4 text-zinc-400" />}
                            label="İşlem Sayısı"
                            value={stats.totalTrades.toString()}
                        />
                        <StatItem
                            icon={<Percent className="w-4 h-4 text-zinc-400" />}
                            label="Kazanma Oranı"
                            value={`${stats.winRate.toFixed(1)}%`}
                            valueColor={stats.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}
                        />
                        <StatItem
                            icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                            label="En İyi Run"
                            value={`${stats.maxStreak} trade`}
                            valueColor="text-emerald-400"
                        />
                        <StatItem
                            icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                            label="En İyi ROE"
                            value={`${stats.maxRoe.toFixed(1)}%`}
                            valueColor="text-emerald-400"
                        />
                        <StatItem
                            icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
                            label="Likitasyon"
                            value={stats.liquidations.toString()}
                            valueColor={stats.liquidations > 0 ? 'text-rose-500 font-bold' : 'text-zinc-500'}
                        />
                        <StatItem
                            icon={<TrendingDown className="w-4 h-4 text-amber-500" />}
                            label="Max Drawdown"
                            value={`$${stats.maxDrawdown.toFixed(0)}`}
                            subValue={`(${stats.maxDrawdownPct.toFixed(1)}%)`}
                            valueColor="text-amber-400"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <Button
                                onClick={onPlayAgain}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 h-12 text-base font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Tekrar Oyna
                            </Button>
                            <Button
                                onClick={onChooseDate}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5 h-12 text-base font-medium"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Tarih Seç
                            </Button>
                        </div>

                        <Button
                            onClick={handleShare}
                            variant="secondary"
                            className="w-full bg-zinc-800 hover:bg-zinc-700 h-10 text-sm border border-white/5"
                        >
                            {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Share2 className="w-4 h-4 mr-2" />}
                            {copied ? "Kopyalandı!" : "Sonucu Paylaş"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
    valueColor?: string;
}

function StatItem({ icon, label, value, subValue, valueColor = 'text-white' }: StatItemProps) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="p-2 rounded-md bg-white/5">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] text-zinc-500 uppercase truncate font-bold">{label}</div>
                <div className={`text-sm font-mono font-bold truncate ${valueColor}`}>
                    {value} {subValue && <span className="text-[10px] text-zinc-500 ml-1">{subValue}</span>}
                </div>
            </div>
        </div>
    );
}
