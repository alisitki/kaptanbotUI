"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/altuq/layout/Sidebar";
import { ArrowLeft, RefreshCcw, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Game Components
import { SessionHeader } from "@/components/game/SessionHeader";
import { TradePanel } from "@/components/game/TradePanel";
import { GameChart } from "@/components/game/Chart";
import { EndModal } from "@/components/game/EndModal";

// Game Engine & Types
import {
    GameState,
    GameConfig,
    GameStartResponse,
    SessionSummary,
    DEFAULT_CONFIG,
    INITIAL_EQUITY,
} from "@/lib/game/types";
import {
    createInitialState,
    openPosition,
    closePosition,
    nextCandle,
    computeUnrealized,
    calculateEquity,
    computeStats,
} from "@/lib/game/engine";
import { saveSession, generateSessionId } from "@/lib/game/storage";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function PlayGameContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Game State
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);

    // Config (can be changed mid-game)
    const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

    // Processing lock ref (prevents rapid button spam)
    const processingLock = useRef(false);

    // =============================================================================
    // DATA LOADING
    // =============================================================================

    const loadGame = useCallback(async (startTime?: number, mode: 'random' | 'date' = 'random') => {
        try {
            setIsLoading(true);
            setLoadError(null);
            setShowEndModal(false);

            const params = new URLSearchParams({
                symbol: 'BTCUSDT',
                interval: '1h',
                mode,
            });

            if (startTime) {
                params.set('startTime', startTime.toString());
            }

            const res = await fetch(`/api/game/start?${params}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Veri yüklenemedi');
            }

            const response = data as GameStartResponse;

            if (!response.candles || response.candles.length < 50) {
                throw new Error('Yetersiz veri');
            }

            // Create initial game state
            const initialState = createInitialState(
                response.candles,
                response.mode,
                response.startTime,
                config,
                response.symbol,
                response.interval
            );

            setGameState(initialState);
            toast.success("Oyun Başladı", {
                description: mode === 'random' ? "Rastgele tarih yüklendi" : "Seçilen tarih yüklendi",
            });

        } catch (error) {
            console.error('Game load error:', error);
            setLoadError(error instanceof Error ? error.message : 'Bilinmeyen hata');
            toast.error("Yükleme Hatası", {
                description: error instanceof Error ? error.message : 'Veri yüklenemedi',
            });
        } finally {
            setIsLoading(false);
        }
    }, [config]);

    // Initial load
    useEffect(() => {
        const startTime = searchParams.get('startTime');
        const mode = searchParams.get('mode') as 'random' | 'date';

        loadGame(
            startTime ? parseInt(startTime) : undefined,
            mode || 'random'
        );
    }, [searchParams, loadGame]);

    // =============================================================================
    // GAME END HANDLER (defined first since executeAction depends on it)
    // =============================================================================

    const handleGameEnd = useCallback((state: GameState) => {
        const stats = computeStats(state.trades, INITIAL_EQUITY, state.totalFeesPaid, state.cash);

        // Save session to localStorage
        const firstCandle = state.candles[0];
        const lastCandle = state.candles[state.currentIndex];

        const summary: SessionSummary = {
            id: generateSessionId(),
            startDate: new Date(firstCandle.t).toISOString(),
            endDate: new Date(lastCandle.t).toISOString(),
            mode: state.mode,
            pnl: stats.totalPnl,
            returnPct: stats.returnPct,
            maxDrawdown: stats.maxDrawdown,
            winRate: stats.winRate,
            totalTrades: stats.totalTrades,
            maxRoe: stats.maxRoe,
            liquidated: stats.liquidations > 0,
            timestamp: Date.now(),
        };

        saveSession(summary);
        setShowEndModal(true);

        if (state.endReason === 'liquidated') {
            toast.error("LİKİTE OLDUN!", {
                description: "Tüm teminatın sıfırlandı. Dikkatli ol!",
                duration: 5000,
            });
        }
    }, []);

    // =============================================================================
    // GAME ACTIONS
    // =============================================================================

    const executeAction = useCallback((action: () => GameState | null) => {
        if (processingLock.current || !gameState || gameState.isEnded) return;

        processingLock.current = true;
        setIsProcessing(true);

        try {
            const newState = action();
            if (newState) {
                // Update config if changed
                const stateWithConfig = { ...newState, config };
                setGameState(stateWithConfig);

                // Check for game end
                if (stateWithConfig.isEnded) {
                    handleGameEnd(stateWithConfig);
                }
            }
        } finally {
            processingLock.current = false;
            setIsProcessing(false);
        }
    }, [gameState, config, handleGameEnd]);

    const handleLong = useCallback(() => {
        if (!gameState) return;
        executeAction(() => openPosition(gameState, 'LONG'));
        toast.success("LONG Açıldı");
    }, [gameState, executeAction]);

    const handleShort = useCallback(() => {
        if (!gameState) return;
        executeAction(() => openPosition(gameState, 'SHORT'));
        toast.success("SHORT Açıldı");
    }, [gameState, executeAction]);

    const handleClose = useCallback(() => {
        if (!gameState) return;
        executeAction(() => closePosition(gameState));
    }, [gameState, executeAction]);

    const handleNext = useCallback(() => {
        if (!gameState) return;
        executeAction(() => nextCandle(gameState));
    }, [gameState, executeAction]);

    const handleConfigChange = useCallback((changes: Partial<GameConfig>) => {
        setConfig(prev => ({ ...prev, ...changes }));
    }, []);

    const handleFuturesChange = useCallback((settings: Partial<Pick<GameState, 'leverage' | 'marginMode' | 'marginUsedUSDT'>>) => {
        setGameState(prev => prev ? ({ ...prev, ...settings }) : null);
    }, []);

    // =============================================================================
    // KEYBOARD CONTROLS
    // =============================================================================

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case 'n':
                    handleNext();
                    break;
                case 'l':
                    if (!gameState?.position) handleLong();
                    break;
                case 's':
                    if (!gameState?.position) handleShort();
                    break;
                case 'c':
                    if (gameState?.position) handleClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handleLong, handleShort, handleClose, gameState?.position]);
    // COMPUTED VALUES
    // =============================================================================

    const currentCandle = gameState?.candles[gameState.currentIndex];
    const currentPrice = currentCandle?.c ?? 0;
    const unrealizedPnl = gameState ? computeUnrealized(gameState.position, currentPrice) : 0;
    const equity = gameState ? calculateEquity(gameState) : INITIAL_EQUITY;
    const stats = gameState
        ? computeStats(gameState.trades, INITIAL_EQUITY, gameState.totalFeesPaid, gameState.cash)
        : null;

    // =============================================================================
    // RENDER (updated props)
    // =============================================================================

    if (isLoading) {
        return (
            <div className="flex h-screen w-full bg-[#020202] items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-400 animate-pulse">Piyasa verileri yükleniyor...</p>
                    <p className="text-xs text-zinc-600">Geçmiş BTC hareketleri taranıyor</p>
                </div>
            </div>
        );
    }

    if (loadError || !gameState) {
        return (
            <div className="flex h-screen w-full bg-[#020202] items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                    <p className="text-rose-400 font-bold text-lg">Veri Yüklenemedi</p>
                    <p className="text-zinc-500">
                        {loadError || 'Binance API ile bağlantı kurulamadı. Lütfen tekrar deneyin.'}
                    </p>
                    <Button
                        onClick={() => loadGame()}
                        className="bg-indigo-600 hover:bg-indigo-500"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" /> Tekrar Dene
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#020202] dark font-sans antialiased text-white selection:bg-indigo-500/30 overflow-hidden">
            <Sidebar />

            <div className="flex flex-1 flex-col pl-64 h-full transition-all duration-300">
                {/* Session Header */}
                <SessionHeader
                    startTime={gameState.startTime}
                    currentTime={currentCandle?.t ?? gameState.startTime}
                    currentIndex={gameState.currentIndex}
                    mode={gameState.mode}
                />

                {/* Main Content */}
                <main className="flex-1 h-full flex flex-col p-4 relative overflow-hidden">
                    {/* Back Button */}
                    <div className="absolute top-2 left-2 z-20">
                        <Link href="/games">
                            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                <ArrowLeft className="w-5 h-5 text-zinc-400" />
                            </Button>
                        </Link>
                    </div>

                    {/* Game Layout */}
                    <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
                        {/* Chart (3 columns) */}
                        <div className="col-span-3 h-full">
                            <GameChart
                                candles={gameState.candles}
                                currentIndex={gameState.currentIndex}
                                position={gameState.position}
                            />
                        </div>

                        {/* Trade Panel (1 column) */}
                        <div className="col-span-1 h-full overflow-y-auto">
                            <TradePanel
                                gameState={gameState}
                                equity={equity}
                                cash={gameState.cash}
                                position={gameState.position}
                                unrealizedPnl={unrealizedPnl}
                                trades={gameState.trades}
                                config={config}
                                isProcessing={isProcessing}
                                isEnded={gameState.isEnded}
                                onLong={handleLong}
                                onShort={handleShort}
                                onClose={handleClose}
                                onNext={handleNext}
                                onConfigChange={handleConfigChange}
                                onFuturesChange={handleFuturesChange}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* End Game Modal */}
            {stats && (
                <EndModal
                    isOpen={showEndModal}
                    stats={stats}
                    endReason={gameState.endReason}
                    onPlayAgain={() => loadGame()}
                    onChooseDate={() => router.push('/games')}
                />
            )}
        </div>
    );
}

export default function PlayGamePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full bg-[#020202] items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-400 animate-pulse">Başlatılıyor...</p>
                </div>
            </div>
        }>
            <PlayGameContent />
        </Suspense>
    );
}
