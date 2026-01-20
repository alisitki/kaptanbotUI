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
    Keyboard,
    Zap,
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import {
    Position,
    GameConfig,
    Trade,
    INITIAL_EQUITY,
    GameState,
} from "@/lib/game/types";
import { calculateRoe } from "@/lib/game/engine";
import { motion } from "framer-motion";

interface TradePanelProps {
    gameState: GameState;
    equity: number;
    cash: number;
    position: Position | null;
    unrealizedPnl: number;
    trades: Trade[];
    config: GameConfig;
    isProcessing: boolean;
    isEnded: boolean;
    onLong: () => void;
    onShort: () => void;
    onClose: () => void;
    onNext: () => void;
    onConfigChange: (config: Partial<GameConfig>) => void;
    onFuturesChange: (settings: Partial<Pick<GameState, 'leverage' | 'marginMode' | 'marginUsedUSDT'>>) => void;
    onSettingsOpen?: () => void;
}

export function TradePanel({
    gameState,
    equity,
    cash,
    position,
    unrealizedPnl,
    trades,
    config,
    isProcessing,
    isEnded,
    onLong,
    onShort,
    onClose,
    onNext,
    onConfigChange,
    onFuturesChange,
    onSettingsOpen,
}: TradePanelProps) {
    // Calculate stats from trades
    const liquidations = trades.filter(t => t.isLiquidated).length;
    const returnPct = ((equity - INITIAL_EQUITY) / INITIAL_EQUITY) * 100;

    const hasPosition = position !== null;
    const isFlat = !hasPosition;

    const currentCandle = gameState.candles[gameState.currentIndex];
    const currentPrice = currentCandle?.c ?? 0;
    const roe = position ? calculateRoe(position, currentPrice) : 0;

    const leverages = [1, 2, 5, 10, 25, 50, 100];

    const getRiskLevel = (lev: number) => {
        if (lev <= 5) return { label: 'DÜŞÜK', color: 'text-emerald-400' };
        if (lev <= 20) return { label: 'ORTA', color: 'text-amber-400' };
        if (lev <= 50) return { label: 'YÜKSEK', color: 'text-orange-400' };
        return { label: 'EKSTREM', color: 'text-rose-500 font-black animate-pulse' };
    };

    const risk = getRiskLevel(gameState.leverage);

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Equity Card */}
            <Card className="p-4 border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
                <div className="space-y-4">
                    {/* Main Equity */}
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Cüzdan Bakiyesi</div>
                            <div className={`text-3xl font-mono font-bold ${equity >= INITIAL_EQUITY ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-sm font-mono ${returnPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-zinc-600 uppercase">Kullanılabilir</div>
                            <div className="text-sm font-mono text-zinc-300">${cash.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                        </div>
                    </div>

                    {/* Position Info */}
                    {hasPosition && (
                        <div className="pt-3 border-t border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={position.side === 'LONG' ? 'default' : 'destructive'}
                                        className="text-[10px] px-1.5 py-0"
                                    >
                                        {position.side} {position.leverage}x
                                    </Badge>
                                    <span className="text-[10px] text-zinc-500">{position.mode}</span>
                                </div>
                                <span className={`text-lg font-mono font-bold ${roe >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {roe >= 0 ? '+' : ''}{roe.toFixed(2)}% ROE
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                                <div className="text-zinc-500">Büyüklük (Notional)</div>
                                <div className="text-right text-zinc-300">${position.notional.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>

                                <div className="text-zinc-500">Kullanılan Teminat</div>
                                <div className="text-right text-zinc-300 font-mono">${position.marginUsed.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>

                                <div className="text-zinc-500">Giriş Fiyatı</div>
                                <div className="text-right text-zinc-300 font-mono">${position.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>

                                <div className="text-rose-500 font-bold">Likitasyon Fiyatı</div>
                                <div className="text-right text-rose-500 font-bold font-mono">${position.liqPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-zinc-500 uppercase">Açık PnL</span>
                                    <span className={`text-sm font-mono font-bold ${unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${roe >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                        style={{ width: `${Math.min(100, Math.abs(roe))}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Futures Settings */}
            <Card className="p-4 border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-bold text-zinc-400 uppercase">Futures Ayarları</h3>
                    </div>
                    <Badge variant="outline" className={`text-[10px] border-white/10 ${risk.color}`}>
                        {risk.label} RİSK
                    </Badge>
                </div>

                <div className="space-y-4">
                    {/* Margin Mode */}
                    <div className="flex p-1 bg-white/5 rounded-lg">
                        <button
                            onClick={() => !hasPosition && onFuturesChange({ marginMode: 'ISOLATED' })}
                            disabled={hasPosition}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${gameState.marginMode === 'ISOLATED'
                                ? 'bg-zinc-700 text-white shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-300'
                                } disabled:opacity-50`}
                        >
                            ISOLATED
                        </button>
                        <button
                            onClick={() => !hasPosition && onFuturesChange({ marginMode: 'CROSS' })}
                            disabled={hasPosition}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${gameState.marginMode === 'CROSS'
                                ? 'bg-zinc-700 text-white shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-300'
                                } disabled:opacity-50`}
                        >
                            CROSS
                        </button>
                    </div>

                    {/* Leverage Selector */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-zinc-500 uppercase">Kaldıraç</span>
                            <span className="text-sm font-mono font-bold text-amber-400">{gameState.leverage}x</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {leverages.map((lev) => (
                                <button
                                    key={lev}
                                    onClick={() => !hasPosition && onFuturesChange({ leverage: lev })}
                                    disabled={hasPosition}
                                    className={`py-1 text-[10px] font-mono rounded border transition-all ${gameState.leverage === lev
                                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                                        : 'border-white/5 bg-white/5 text-zinc-500 hover:bg-white/10'
                                        } disabled:opacity-50`}
                                >
                                    {lev}x
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Margin Input (Isolated only) */}
                    {gameState.marginMode === 'ISOLATED' && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] text-zinc-500 uppercase">Teminat (Margin)</span>
                                <span className="text-sm font-mono text-zinc-300">${gameState.marginUsedUSDT}</span>
                            </div>
                            <Slider
                                disabled={hasPosition}
                                value={[gameState.marginUsedUSDT]}
                                min={50}
                                max={Math.floor(cash)}
                                step={50}
                                onValueChange={([val]) => onFuturesChange({ marginUsedUSDT: val })}
                                className="py-2"
                            />
                            <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                                <span>$50</span>
                                <span>${Math.floor(cash)}</span>
                            </div>
                        </div>
                    )}
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
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={onLong}
                                    disabled={isProcessing || isEnded || cash < 50}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 h-12 text-lg font-bold disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-500/50"
                                >
                                    <TrendingUp className="mr-2 h-5 w-5" /> LONG
                                </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={onShort}
                                    disabled={isProcessing || isEnded || cash < 50}
                                    className="w-full bg-rose-600 hover:bg-rose-500 h-12 text-lg font-bold disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] border border-rose-500/50"
                                >
                                    <TrendingDown className="mr-2 h-5 w-5" /> SHORT
                                </Button>
                            </motion.div>
                        </div>
                    ) : (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={onClose}
                                disabled={isProcessing || isEnded}
                                variant="secondary"
                                className="w-full h-12 text-lg font-bold bg-zinc-700 hover:bg-zinc-600 text-white disabled:opacity-50 transition-all shadow-lg border border-white/10"
                            >
                                <X className="mr-2 h-5 w-5" /> POZİSYONU KAPAT
                            </Button>
                        </motion.div>
                    )}

                    <Button
                        onClick={onNext}
                        disabled={isProcessing || isEnded || gameState.mode === 'realtime'}
                        variant="outline"
                        className="w-full border-white/10 hover:bg-white/5 text-zinc-300 disabled:opacity-50 h-10"
                    >
                        <Play className="mr-2 h-4 w-4" />
                        {gameState.mode === 'realtime' ? 'Otomatik İlerliyor' : 'Sonraki Mum'}
                    </Button>
                </TooltipProvider>

                <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-600">
                    <Zap className="w-3 h-3" />
                    Büyüklük: ${((gameState.marginMode === 'ISOLATED' ? gameState.marginUsedUSDT : cash) * gameState.leverage).toLocaleString()} USDT
                </div>
            </Card>

            {/* Settings */}
            <Card className="p-4 border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                    <Settings2 className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-400 uppercase">Gelişmiş</h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="fees" className="text-[11px] text-zinc-500 uppercase">
                            İşlem Ücreti ({config.takerFeeBps / 100}%)
                        </Label>
                        <Switch
                            id="fees"
                            checked={config.feesEnabled}
                            onCheckedChange={(checked) => onConfigChange({ feesEnabled: checked })}
                        />
                    </div>
                </div>

                <Button
                    variant="link"
                    size="sm"
                    className="w-full mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 gap-1 p-0 h-auto"
                    onClick={onSettingsOpen}
                >
                    <Settings2 className="w-3 h-3" />
                    Gelişmiş Görsel/Ses Ayarları
                </Button>
            </Card>

            {/* Trade History */}
            <Card className="flex-1 border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md flex flex-col overflow-hidden">
                <div className="p-3 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase flex justify-between">
                    <span>İşlem Geçmişi ({trades.length})</span>
                    {liquidations > 0 && <span className="text-rose-500">{liquidations} LİKİT</span>}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {trades.slice().reverse().map((trade, i) => (
                        <div key={i} className={`flex flex-col p-2 rounded bg-white/5 text-xs ${trade.isLiquidated ? 'border border-rose-500/30' : ''}`}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={trade.side === 'LONG' ? 'default' : 'destructive'}
                                        className="text-[9px] h-4 px-1"
                                    >
                                        {trade.side} {trade.leverage}x
                                    </Badge>
                                    {trade.isLiquidated && (
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-rose-500 text-rose-500 animate-pulse">
                                            LİKİT
                                        </Badge>
                                    )}
                                </div>
                                <span className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                                <span>${trade.entryPrice.toFixed(1)} → ${trade.exitPrice.toFixed(1)}</span>
                                <span>Fee: ${trade.fees.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                    {trades.length === 0 && (
                        <div className="text-center text-zinc-600 py-8 text-sm italic">Henüz işlem yok</div>
                    )}
                </div>
            </Card>
        </div>
    );
}
