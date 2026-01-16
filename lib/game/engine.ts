// =============================================================================
// GAME ENGINE - Pure Functions for Price Action Master
// =============================================================================

import {
    Candle,
    Position,
    PositionSide,
    Trade,
    GameState,
    GameConfig,
    SessionStats,
    POSITION_SIZE,
    INITIAL_EQUITY,
    TOTAL_CANDLES,
} from './types';

// =============================================================================
// PRICE CALCULATIONS
// =============================================================================

/**
 * Apply slippage to a price based on trade direction
 * - LONG entry / SHORT exit: price goes UP (worse fill)
 * - SHORT entry / LONG exit: price goes DOWN (worse fill)
 */
export function applySlippage(
    price: number,
    side: PositionSide,
    isEntry: boolean,
    slippageBps: number
): number {
    if (slippageBps === 0) return price;

    const slippageMultiplier = slippageBps / 10000;

    // Entry: LONG pays more, SHORT receives less
    // Exit: LONG receives less, SHORT pays more
    const isUpwardSlippage = (side === 'LONG' && isEntry) || (side === 'SHORT' && !isEntry);

    return isUpwardSlippage
        ? price * (1 + slippageMultiplier)
        : price * (1 - slippageMultiplier);
}

/**
 * Calculate trading fees
 */
export function calculateFees(
    size: number,
    price: number,
    feeBps: number
): number {
    if (feeBps === 0) return 0;
    return (size * price * feeBps) / 10000;
}

/**
 * Get effective fill price with slippage
 */
export function getFillPrice(
    currentPrice: number,
    side: PositionSide,
    isEntry: boolean,
    config: GameConfig
): number {
    if (!config.slippageEnabled) return currentPrice;
    return applySlippage(currentPrice, side, isEntry, config.slippageBps);
}

/**
 * Get fees for a trade
 */
export function getTradeFees(
    size: number,
    price: number,
    config: GameConfig
): number {
    if (!config.feesEnabled) return 0;
    return calculateFees(size, price, config.takerFeeBps);
}

// =============================================================================
// POSITION MANAGEMENT
// =============================================================================

/**
 * Compute unrealized PnL for an open position
 */
export function computeUnrealized(
    position: Position | null,
    currentPrice: number
): number {
    if (!position) return 0;

    const priceDiff = position.side === 'LONG'
        ? currentPrice - position.entryPrice
        : position.entryPrice - currentPrice;

    return priceDiff * position.size;
}

/**
 * Open a new position
 * Returns null if already in a position
 */
export function openPosition(
    state: GameState,
    side: PositionSide
): GameState | null {
    // Guard: can't open if already in position
    if (state.position !== null) return null;

    // Guard: game ended
    if (state.isEnded) return null;

    const currentCandle = state.candles[state.currentIndex];
    if (!currentCandle) return null;

    const basePrice = currentCandle.c;
    const fillPrice = getFillPrice(basePrice, side, true, state.config);
    const entryFees = getTradeFees(POSITION_SIZE, fillPrice, state.config);

    const newPosition: Position = {
        side,
        entryPrice: fillPrice,
        entryTime: currentCandle.t,
        size: POSITION_SIZE,
        entryFees,
    };

    return {
        ...state,
        position: newPosition,
        cash: state.cash - entryFees,
        totalFeesPaid: state.totalFeesPaid + entryFees,
    };
}

/**
 * Close the current position
 * Returns null if no position
 */
export function closePosition(state: GameState): GameState | null {
    // Guard: can't close if no position
    if (state.position === null) return null;

    const currentCandle = state.candles[state.currentIndex];
    if (!currentCandle) return null;

    const position = state.position;
    const basePrice = currentCandle.c;
    const fillPrice = getFillPrice(basePrice, position.side, false, state.config);
    const exitFees = getTradeFees(POSITION_SIZE, fillPrice, state.config);

    // Calculate PnL
    const grossPnl = position.side === 'LONG'
        ? (fillPrice - position.entryPrice) * position.size
        : (position.entryPrice - fillPrice) * position.size;

    const totalFees = position.entryFees + exitFees;
    const netPnl = grossPnl - exitFees; // Entry fees already deducted from cash

    const trade: Trade = {
        side: position.side,
        entryPrice: position.entryPrice,
        exitPrice: fillPrice,
        entryTime: position.entryTime,
        exitTime: currentCandle.t,
        size: position.size,
        pnl: netPnl,
        grossPnl,
        fees: totalFees,
    };

    const newCash = state.cash + netPnl;

    // Check for margin call
    const isMarginCall = newCash <= 0;

    return {
        ...state,
        position: null,
        cash: Math.max(0, newCash),
        trades: [...state.trades, trade],
        totalFeesPaid: state.totalFeesPaid + exitFees,
        isEnded: isMarginCall ? true : state.isEnded,
        endReason: isMarginCall ? 'margin_call' : state.endReason,
    };
}

// =============================================================================
// CANDLE NAVIGATION
// =============================================================================

/**
 * Advance to next candle
 */
export function nextCandle(state: GameState): GameState {
    // Guard: game ended
    if (state.isEnded) return state;

    const newIndex = state.currentIndex + 1;

    // Check if game completed
    if (newIndex >= TOTAL_CANDLES || newIndex >= state.candles.length) {
        return {
            ...state,
            currentIndex: Math.min(newIndex, state.candles.length - 1),
            isEnded: true,
            endReason: 'completed',
        };
    }

    return {
        ...state,
        currentIndex: newIndex,
    };
}

// =============================================================================
// EQUITY CALCULATIONS
// =============================================================================

/**
 * Calculate current equity (cash + unrealized PnL)
 */
export function calculateEquity(state: GameState): number {
    const currentCandle = state.candles[state.currentIndex];
    if (!currentCandle) return state.cash;

    const unrealized = computeUnrealized(state.position, currentCandle.c);
    return state.cash + unrealized;
}

/**
 * Check if margin call should trigger
 */
export function isMarginCall(state: GameState): boolean {
    return calculateEquity(state) <= 0;
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Compute session statistics from completed trades
 */
export function computeStats(
    trades: Trade[],
    initialEquity: number,
    totalFeesPaid: number,
    finalCash: number
): SessionStats {
    if (trades.length === 0) {
        return {
            totalPnl: finalCash - initialEquity,
            returnPct: ((finalCash - initialEquity) / initialEquity) * 100,
            maxDrawdown: 0,
            maxDrawdownPct: 0,
            winRate: 0,
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            largestWin: 0,
            largestLoss: 0,
            avgWin: 0,
            avgLoss: 0,
            totalFees: totalFeesPaid,
        };
    }

    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl <= 0);

    const totalPnl = finalCash - initialEquity;
    const returnPct = (totalPnl / initialEquity) * 100;

    // Calculate max drawdown
    let peak = initialEquity;
    let maxDrawdown = 0;
    let runningEquity = initialEquity;

    for (const trade of trades) {
        runningEquity += trade.pnl;
        if (runningEquity > peak) {
            peak = runningEquity;
        }
        const drawdown = peak - runningEquity;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    const maxDrawdownPct = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

    return {
        totalPnl,
        returnPct,
        maxDrawdown,
        maxDrawdownPct,
        winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
        largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0,
        avgWin: winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0,
        avgLoss: losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length : 0,
        totalFees: totalFeesPaid,
    };
}

// =============================================================================
// STATE INITIALIZATION
// =============================================================================

/**
 * Create initial game state from candles
 */
export function createInitialState(
    candles: Candle[],
    mode: 'random' | 'date',
    startTime: number,
    config: GameConfig,
    symbol: string = 'BTCUSDT',
    interval: string = '1h'
): GameState {
    return {
        candles,
        currentIndex: TOTAL_CANDLES > 50 ? 49 : candles.length - 1, // Start at candle 50 (0-indexed: 49)
        initialEquity: INITIAL_EQUITY,
        cash: INITIAL_EQUITY,
        position: null,
        trades: [],
        totalFeesPaid: 0,
        config,
        mode,
        startTime,
        symbol,
        interval,
        isEnded: false,
        endReason: null,
    };
}
