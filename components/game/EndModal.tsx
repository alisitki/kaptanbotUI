"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
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
    Calendar
} from "lucide-react";
import { SessionStats } from "@/lib/game/types";

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
    const isProfit = stats.totalPnl >= 0;
    const isMarginCall = endReason === 'margin_call';
    const isLiquidated = endReason === 'liquidated';

    return (
        <Dialog open={isOpen}>
            <DialogContent className="bg-[#0A0A0A] border-white/10 text-white sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {isMarginCall || isLiquidated ? (
                            <>
                                <AlertTriangle className="w-6 h-6 text-rose-500" />
                                <span className="text-rose-400">
                                    {isLiquidated ? 'Likitasyon!' : 'Margin Call!'}
                                </span>
                            </>
                        ) : (
                            <>
                                <Trophy className="w-6 h-6 text-amber-500" />
                                <span>Oyun Tamamlandı!</span>
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {isLiquidated
                            ? "Teminatınız yetersiz kaldı ve pozisyonunuz likite edildi."
                            : isMarginCall
                                ? "Bakiyeniz sıfırın altına düştü. Oyun sonlandırıldı."
                                : "500 mum tamamlandı. İşte performansınız:"}
                    </DialogDescription>
                </DialogHeader>

                {/* Main PnL Display */}
                <div className="text-center py-6 border-y border-white/5">
                    <div className="text-sm text-zinc-500 uppercase mb-2">Toplam PnL</div>
                    <div className={`text-4xl font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}${stats.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-lg font-mono ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                        ({isProfit ? '+' : ''}{stats.returnPct.toFixed(2)}%)
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 py-4">
                    <StatItem
                        icon={<BarChart3 className="w-4 h-4 text-zinc-500" />}
                        label="İşlem Sayısı"
                        value={stats.totalTrades.toString()}
                    />
                    <StatItem
                        icon={<Percent className="w-4 h-4 text-zinc-500" />}
                        label="Kazanma Oranı"
                        value={`${stats.winRate.toFixed(1)}%`}
                        valueColor={stats.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}
                    />
                    <StatItem
                        icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                        label="En İyi ROE"
                        value={`${stats.maxRoe.toFixed(1)}%`}
                        valueColor="text-emerald-400"
                    />
                    <StatItem
                        icon={<TrendingDown className="w-4 h-4 text-rose-500" />}
                        label="Likitasyon"
                        value={stats.liquidations.toString()}
                        valueColor={stats.liquidations > 0 ? 'text-rose-500 font-bold' : 'text-zinc-500'}
                    />
                    <StatItem
                        icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                        label="En Büyük Kazanç"
                        value={`$${stats.largestWin.toFixed(2)}`}
                        valueColor="text-emerald-400"
                    />
                    <StatItem
                        icon={<TrendingDown className="w-4 h-4 text-rose-500" />}
                        label="En Büyük Kayıp"
                        value={`$${Math.abs(stats.largestLoss).toFixed(2)}`}
                        valueColor="text-rose-400"
                    />
                    <StatItem
                        icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                        label="Maks Drawdown"
                        value={`$${stats.maxDrawdown.toFixed(2)}`}
                        subValue={`(${stats.maxDrawdownPct.toFixed(1)}%)`}
                        valueColor="text-amber-400"
                    />
                    <StatItem
                        icon={<Badge variant="outline" className="text-[10px] px-1">FEE</Badge>}
                        label="Toplam Ücretler"
                        value={`$${stats.totalFees.toFixed(2)}`}
                        valueColor="text-zinc-400"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        onClick={onPlayAgain}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 h-12"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Rastgele Oyna
                    </Button>
                    <Button
                        onClick={onChooseDate}
                        variant="outline"
                        className="flex-1 border-white/10 hover:bg-white/5 h-12"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Tarih Seç
                    </Button>
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
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            {icon}
            <div className="flex-1">
                <div className="text-[10px] text-zinc-500 uppercase">{label}</div>
                <div className={`text-sm font-mono font-bold ${valueColor}`}>
                    {value} {subValue && <span className="text-[10px] text-zinc-500">{subValue}</span>}
                </div>
            </div>
        </div>
    );
}
