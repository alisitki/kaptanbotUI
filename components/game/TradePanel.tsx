"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    TrendingUp,
    TrendingDown,
    X,
    Play,
    Settings2,
    Keyboard
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Position, GameConfig, Trade, INITIAL_EQUITY } from "@/lib/game/types";

interface TradePanelProps {
    equity: number;
    cash: number;
    position: Position | null;
    unrealizedPnl: number;
    trades: Trade[];
    totalFeesPaid: number;
    config: GameConfig;
    isProcessing: boolean;
    isEnded: boolean;
    onLong: () => void;
    onShort: () => void;
    onClose: () => void;
    onNext: () => void;
    onConfigChange: (config: Partial<GameConfig>) => void;
}

export function TradePanel({
    equity,
    cash,
    position,
    unrealizedPnl,
    trades,
    totalFeesPaid,
    config,
    isProcessing,
    isEnded,
    onLong,
    onShort,
    onClose,
    onNext,
    onConfigChange,
}: TradePanelProps) {
    const realizedPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalPnl = realizedPnl + unrealizedPnl;
    const returnPct = ((equity - INITIAL_EQUITY) / INITIAL_EQUITY) * 100;

    const hasPosition = position !== null;
    const isFlat = !hasPosition;

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Equity Card */}
            <Card className="p-4 border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
                <div className="space-y-4">
                    {/* Main Equity */}
                    <div>
                        <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Toplam Varlık</div>
                        <div className={`text-3xl font-mono font-bold ${equity >= INITIAL_EQUITY ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-sm font-mono ${returnPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
                        </div>
                    </div>

                    {/* Position Info */}
                    {hasPosition && (
                        <div className="pt-3 border-t border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-zinc-500">Pozisyon</span>
                                <Badge
                                    variant={position.side === 'LONG' ? 'default' : 'destructive'}
                                    className="text-xs"
                                >
                                    {position.side}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-zinc-500">Giriş Fiyatı</span>
                                <span className="text-sm font-mono text-white">
                                    ${position.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-zinc-500">Açık PnL</span>
                                <span className={`text-sm font-mono font-bold ${unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                        <div>
                            <div className="text-[10px] text-zinc-600 uppercase">Gerç. PnL</div>
                            <div className={`text-sm font-mono ${realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-zinc-600 uppercase">Ödenen Fees</div>
                            <div className="text-sm font-mono text-amber-400">
                                -${totalFeesPaid.toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-zinc-600 uppercase">İşlem Sayısı</div>
                            <div className="text-sm font-mono text-white">{trades.length}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-zinc-600 uppercase">Nakit</div>
                            <div className="text-sm font-mono text-zinc-300">${cash.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <Card className="p-4 border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase">Aksiyonlar</h3>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                        <Keyboard className="w-3 h-3" />
                        <span>L / S / C / N</span>
                    </div>
                </div>

                <TooltipProvider>
                    {isFlat ? (
                        <div className="grid grid-cols-2 gap-3">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onLong}
                                        disabled={isProcessing || isEnded}
                                        className="bg-emerald-600 hover:bg-emerald-500 h-12 text-lg font-bold disabled:opacity-50"
                                    >
                                        <TrendingUp className="mr-2 h-5 w-5" /> LONG
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Mevcut fiyattan 1 BTC al (L tuşu)</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onShort}
                                        disabled={isProcessing || isEnded}
                                        className="bg-rose-600 hover:bg-rose-500 h-12 text-lg font-bold disabled:opacity-50"
                                    >
                                        <TrendingDown className="mr-2 h-5 w-5" /> SHORT
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Mevcut fiyattan 1 BTC sat (S tuşu)</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onClose}
                                    disabled={isProcessing || isEnded}
                                    variant="secondary"
                                    className="w-full h-12 text-lg font-bold bg-zinc-700 hover:bg-zinc-600 text-white disabled:opacity-50"
                                >
                                    <X className="mr-2 h-5 w-5" /> POZİSYONU KAPAT
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Pozisyonu kapat ve PnL'i realize et (C tuşu)</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={onNext}
                                disabled={isProcessing || isEnded}
                                variant="outline"
                                className="w-full border-white/10 hover:bg-white/5 text-zinc-300 disabled:opacity-50"
                            >
                                <Play className="mr-2 h-4 w-4" /> Sonraki Mum
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Zamanı 1 saat ilerlet (N tuşu)</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="text-xs text-center text-zinc-600">
                    Her işlem 1 BTC büyüklüğündedir
                </div>
            </Card>

            {/* Settings */}
            <Card className="p-4 border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                    <Settings2 className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-400 uppercase">Ayarlar</h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="fees" className="text-sm text-zinc-400">
                            İşlem Ücreti ({config.takerFeeBps / 100}%)
                        </Label>
                        <Switch
                            id="fees"
                            checked={config.feesEnabled}
                            onCheckedChange={(checked) => onConfigChange({ feesEnabled: checked })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="slippage" className="text-sm text-zinc-400">
                            Kayma ({config.slippageBps / 100}%)
                        </Label>
                        <Switch
                            id="slippage"
                            checked={config.slippageEnabled}
                            onCheckedChange={(checked) => onConfigChange({ slippageEnabled: checked })}
                        />
                    </div>
                </div>
            </Card>

            {/* Trade History */}
            <Card className="flex-1 border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md flex flex-col overflow-hidden">
                <div className="p-3 border-b border-white/5 text-xs font-bold text-zinc-500 uppercase">
                    İşlem Geçmişi ({trades.length})
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {trades.slice().reverse().map((trade, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 text-sm">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={trade.side === 'LONG' ? 'default' : 'destructive'}
                                    className="text-[10px] h-5"
                                >
                                    {trade.side}
                                </Badge>
                                <span className="text-[10px] text-zinc-600">
                                    ${trade.entryPrice.toFixed(0)} → ${trade.exitPrice.toFixed(0)}
                                </span>
                            </div>
                            <span className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                            </span>
                        </div>
                    ))}
                    {trades.length === 0 && (
                        <div className="text-center text-zinc-600 py-8 text-sm">Henüz işlem yok</div>
                    )}
                </div>
            </Card>
        </div>
    );
}
