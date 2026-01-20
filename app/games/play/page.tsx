"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/tradingbotv1/layout/Sidebar";
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
    updateCurrentCandle,
    appendNewCandle,
} from "@/lib/game/engine";
import { saveSession, generateSessionId } from "@/lib/game/storage";
import { EffectsLayer } from "@/components/game/EffectsLayer";
import { useGameSound } from "@/lib/game/sfx";
import { triggerEffect } from "@/lib/game/effects";
import { GameBackground } from "@/components/game/GameBackground";
import { SettingsModal, GamePreferences } from "@/components/game/SettingsModal";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

import { useBinanceStream } from "@/hooks/useBinanceStream";
import { Candle } from "@/lib/game/types";

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
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Preferences
    const [preferences, setPreferences] = useState<GamePreferences>({
        soundEnabled: true,
        effectsEnabled: true,
        visualIntensity: 80,
        backgroundEnabled: true,
    });

    // Config (can be changed mid-game)
    const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

    // Processing lock ref (prevents rapid button spam)
    const processingLock = useRef(false);

    // =============================================================================
    // REALTIME UPDATES
    // =============================================================================

    // Game Config (including interval)
    const [interval, setInterval] = useState<string>('1h');

    // Callback for websocket updates (throttled)
    const handleStreamUpdate = useCallback((candleData: Partial<Candle>) => {
        setGameState(current => {
            if (!current || current.isEnded || current.mode !== 'realtime') return current;
            return { ...updateCurrentCandle(current, candleData), config };
        });
    }, [config]); // Config is needed for liquidation checks in update

    // Callback for candle close
    const handleStreamClose = useCallback((candle: Candle) => {
        setGameState(current => {
            if (!current || current.isEnded || current.mode !== 'realtime') return current;
            return { ...appendNewCandle(current, candle), config };
        });
    }, [config]);

    // Initialize Websocket Hook
    useBinanceStream({
        symbol: 'BTCUSDT',
        interval: interval,
        enabled: gameState?.mode === 'realtime' && !gameState.isEnded,
        onUpdate: handleStreamUpdate,
        onClose: handleStreamClose,
    });

    // =============================================================================
    // DATA LOADING
    // =============================================================================

    const loadGame = useCallback(async (startTime?: number, mode: 'random' | 'date' | 'realtime' = 'random', targetInterval: string = interval) => {
        try {
            setIsLoading(true);
            setLoadError(null);
            setShowEndModal(false);

            let candles: Candle[] = [];
            let gameStartTime = startTime;
            let symbol = 'BTCUSDT';

            // Should use the target interval
            const activeInterval = targetInterval;

            if (mode === 'realtime') {
                // Fetch initial data from Proxy (add timestamp to prevent caching)
                const res = await fetch(`/api/proxy/binance/klines?symbol=${symbol}&interval=${activeInterval}&limit=100&_t=${Date.now()}`);
                if (!res.ok) throw new Error('Proxy error');
                const data = await res.json();
                if (data.error) throw new Error(data.error);

                candles = data.candles;
                gameStartTime = candles[0].t;
            } else {
                // Determine API endpoint
                const params = new URLSearchParams({
                    symbol,
                    interval: activeInterval,
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
                candles = response.candles;
                gameStartTime = response.startTime;
            }

            if (!candles || candles.length < 50) {
                throw new Error('Yetersiz veri');
            }

            // Create initial game state
            const initialState = createInitialState(
                candles,
                mode,
                gameStartTime || Date.now(),
                config,
                symbol,
                activeInterval
            );

            setGameState(initialState);
            toast.success("Oyun Başladı", {
                description: mode === 'realtime'
                    ? `Canlı piyasa (${activeInterval}) yüklendi`
                    : (mode === 'random' ? "Rastgele tarih yüklendi" : "Seçilen tarih yüklendi"),
            });

        } catch (error) {
            console.error('Game load load error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
            setLoadError(errorMessage);

            let description = "Binance API ile bağlantı kurulamadı.";
            if (errorMessage.includes('Proxy error') || errorMessage.includes('500')) {
                description = "Vercel proxy bağlantısı başarısız oldu. Lütfen internetinizi kontrol edin veya tekrar deneyin.";
            }

            toast.error("Yükleme Hatası", {
                description,
            });
        } finally {
            setIsLoading(false);
        }
    }, [config, interval]);

    // Initial load ref to prevent double-loading and re-triggering upon interval changes
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;

        const startTime = searchParams.get('startTime');
        const mode = searchParams.get('mode') as 'random' | 'date' | 'realtime';

        loadGame(
            startTime ? parseInt(startTime) : undefined,
            mode || 'random',
            '1h' // Initial default
        );

        hasInitialized.current = true;
    }, [searchParams, loadGame]);

    const handleIntervalChange = useCallback((newInterval: string) => {
        if (isLoading) return; // Prevent spamming while loading

        setInterval(newInterval);

        if (gameState) {
            // Pass the new interval explicitly to bypass state lag
            loadGame(undefined, gameState.mode, newInterval);
        }
    }, [gameState, loadGame, isLoading]);

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
            triggerEffect('LIQUIDATED');
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
        triggerEffect('OPEN_LONG');
        executeAction(() => openPosition(gameState, 'LONG'));
        toast.success("LONG Açıldı");
    }, [gameState, executeAction]);

    const handleShort = useCallback(() => {
        if (!gameState) return;
        triggerEffect('OPEN_SHORT');
        executeAction(() => openPosition(gameState, 'SHORT'));
        toast.success("SHORT Açıldı");
    }, [gameState, executeAction]);

    const handleClose = useCallback(() => {
        if (!gameState) return;

        // Calculate PnL for effect before closing
        const currentPrice = gameState.candles[gameState.currentIndex].c;
        const pnl = gameState.position ? computeUnrealized(gameState.position, currentPrice) : 0;

        if (pnl > 0) {
            triggerEffect('CLOSE_WIN', { pnl });
        } else {
            triggerEffect('CLOSE_LOSS', { pnl });
        }

        executeAction(() => closePosition(gameState));
    }, [gameState, executeAction]);

    const handleNext = useCallback(() => {
        if (!gameState) return;
        // In Realtime mode, "Next" might be disabled or just acts as a skip? 
        // For now, let's keep it but it moves the manual cursor if checking history, 
        // effectively nextCandle works on 'currentIndex', which is auto-updated by WS.
        // However, if we want to prevent manual skip in realtime:
        if (gameState.mode === 'realtime') {
            toast.info("Canlı moddasınız", { description: "Mumlar otomatik ilerler." });
            return;
        }
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

    // =============================================================================
    // COMPUTED VALUES
    // =============================================================================

    const currentCandle = gameState?.candles[gameState.currentIndex];
    const currentPrice = currentCandle?.c ?? 0;
    const unrealizedPnl = gameState ? computeUnrealized(gameState.position, currentPrice) : 0;
    const equity = gameState ? calculateEquity(gameState) : INITIAL_EQUITY;
    const stats = gameState
        ? computeStats(gameState.trades, INITIAL_EQUITY, gameState.totalFeesPaid, gameState.cash)
        : null;

    // Calculate streak from trades
    const streak = gameState?.trades
        ? (() => {
            let s = 0;
            // Iterate backwards
            for (let i = gameState.trades.length - 1; i >= 0; i--) {
                if (gameState.trades[i].pnl > 0) s++;
                else break;
            }
            return s;
        })()
        : 0;

    // Initialize/Enable Sound
    useGameSound(preferences.soundEnabled);

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
        <div className="flex h-screen w-full bg-[#020202] dark font-sans antialiased text-white selection:bg-indigo-500/30 overflow-hidden relative">
            <GameBackground enabled={preferences.backgroundEnabled} />
            <EffectsLayer
                enabled={preferences.effectsEnabled}
                intensity={preferences.visualIntensity}
            />
            <Sidebar />

            <div className="flex flex-1 flex-col pl-64 h-full transition-all duration-300">
                {/* Session Header */}
                <SessionHeader
                    startTime={gameState.startTime}
                    currentTime={currentCandle?.t ?? gameState.startTime}
                    currentIndex={gameState.currentIndex}
                    mode={gameState.mode}
                    streak={streak}
                    interval={interval}
                    onIntervalChange={handleIntervalChange}
                    onSettingsOpen={() => setShowSettingsModal(true)}
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
                                onSettingsOpen={() => setShowSettingsModal(true)}
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

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                preferences={preferences}
                onPreferencesChange={(newPrefs) => setPreferences(prev => ({ ...prev, ...newPrefs }))}
            />
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
