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
    INITIAL_EQUITY,
    TOTAL_CANDLES,
} from './types';

// =============================================================================
// PRICE CALCULATIONS
// =============================================================================

/**
 * Apply slippage to a price based on trade direction
 */
export function applySlippage(
    price: number,
    side: PositionSide,
    isEntry: boolean,
    slippageBps: number
): number {
    if (slippageBps === 0) return price;

    const slippageMultiplier = slippageBps / 10000;
    const isUpwardSlippage = (side === 'LONG' && isEntry) || (side === 'SHORT' && !isEntry);

    return isUpwardSlippage
        ? price * (1 + slippageMultiplier)
        : price * (1 - slippageMultiplier);
}

/**
 * Calculate trading fees based on notional size
 */
export function calculateFees(
    notional: number,
    feeBps: number
): number {
    if (feeBps === 0) return 0;
    return (notional * feeBps) / 10000;
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

// =============================================================================
// FUTURES MATH
// =============================================================================

/**
 * Compute liquidation price for a position
 * LONG: liqPrice = entryPrice * (1 - marginRatio + mmr)
 * SHORT: liqPrice = entryPrice * (1 + marginRatio - mmr)
 * 
 * Simplified for this simulation:
 * LONG: liqPrice = entry - (margin - mm)/qty
 * SHORT: liqPrice = entry + (margin - mm)/qty
 */
export function computeLiquidationPrice(
    side: PositionSide,
    entryPrice: number,
    qty: number,
    margin: number,
    mmrBps: number
): number {
    const mmr = mmrBps / 10000;
    const notional = qty * entryPrice;
    const maintenanceMargin = notional * mmr;

    if (side === 'LONG') {
        // liq = entry - (margin - maintenanceMargin) / qty
        return Math.max(0, entryPrice - (margin - maintenanceMargin) / qty);
    } else {
        // liq = entry + (margin - maintenanceMargin) / qty
        return entryPrice + (margin - maintenanceMargin) / qty;
    }
}

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
 * Calculate ROE% (Return on Equity)
 */
export function calculateRoe(
    position: Position | null,
    currentPrice: number
): number {
    if (!position || position.marginUsed === 0) return 0;
    const pnl = computeUnrealized(position, currentPrice);
    return (pnl / position.marginUsed) * 100;
}

// =============================================================================
// POSITION MANAGEMENT
// =============================================================================

/**
 * Open a new position
 */
export function openPosition(
    state: GameState,
    side: PositionSide
): GameState | null {
    if (state.position !== null || state.isEnded) return null;

    const currentCandle = state.candles[state.currentIndex];
    if (!currentCandle) return null;

    const basePrice = currentCandle.c;
    const fillPrice = getFillPrice(basePrice, side, true, state.config);

    // Leverage & Sizing
    const leverage = state.leverage;
    const marginMode = state.marginMode;

    // In Isolated: use selected marginUsedUSDT
    // In Cross: use entire current cash as margin
    const marginUsed = marginMode === 'ISOLATED'
        ? Math.min(state.marginUsedUSDT, state.cash)
        : state.cash;

    if (marginUsed <= 0) return null;

    const notional = marginUsed * leverage;
    const qty = notional / fillPrice;
    const entryFees = calculateFees(notional, state.config.takerFeeBps);

    const liqPrice = computeLiquidationPrice(
        side,
        fillPrice,
        qty,
        marginUsed,
        state.config.mmr
    );

    const newPosition: Position = {
        side,
        entryPrice: fillPrice,
        entryTime: currentCandle.t,
        size: qty,
        notional,
        leverage,
        marginUsed,
        entryFees,
        liqPrice,
        mmr: state.config.mmr / 10000,
        mode: marginMode,
    };

    // Correct cash deduction: 
    // Isolated: deduct only margin + fees
    // Cross: all cash is tied up in the position (effectively used as margin)
    const cashRemaining = marginMode === 'ISOLATED'
        ? state.cash - marginUsed - entryFees
        : -entryFees; // Cross: fees come from equity

    return {
        ...state,
        position: newPosition,
        cash: cashRemaining,
        totalFeesPaid: state.totalFeesPaid + entryFees,
    };
}

/**
 * Close the current position
 */
export function closePosition(state: GameState, isLiquidation: boolean = false): GameState | null {
    if (state.position === null) return null;

    const currentCandle = state.candles[state.currentIndex];
    if (!currentCandle) return null;

    const position = state.position;
    const exitPrice = isLiquidation
        ? position.liqPrice
        : getFillPrice(currentCandle.c, position.side, false, state.config);

    const notionalAtExit = position.size * exitPrice;
    const exitFees = isLiquidation ? 0 : calculateFees(notionalAtExit, state.config.takerFeeBps);

    // Calculate PnL
    const grossPnl = position.side === 'LONG'
        ? (exitPrice - position.entryPrice) * position.size
        : (position.entryPrice - exitPrice) * position.size;

    const totalFees = position.entryFees + exitFees;
    const netPnl = grossPnl - exitFees;

    const trade: Trade = {
        side: position.side,
        entryPrice: position.entryPrice,
        exitPrice,
        entryTime: position.entryTime,
        exitTime: currentCandle.t,
        size: position.size,
        notional: position.notional,
        leverage: position.leverage,
        marginMode: position.mode,
        pnl: netPnl,
        grossPnl,
        fees: totalFees,
        isLiquidated: isLiquidation,
    };

    // Isolated: return margin + net PnL (where entry fees were already deducted)
    // Cross: cash was -fees, return margin used (= old cash) + net PnL
    let newCash = 0;
    if (position.mode === 'ISOLATED') {
        newCash = state.cash + position.marginUsed + netPnl;
    } else {
        // Cross mode: state.cash was effectively 0 or negative (fees)
        // newCash = original_cash + netPnl
        newCash = position.marginUsed + netPnl - position.entryFees - exitFees;
    }

    const isMarginCall = newCash <= 0;

    return {
        ...state,
        position: null,
        cash: Math.max(0, newCash),
        trades: [...state.trades, trade],
        totalFeesPaid: state.totalFeesPaid + exitFees,
        isEnded: (isMarginCall || isLiquidation) ? true : state.isEnded,
        endReason: isLiquidation ? 'liquidated' : (isMarginCall ? 'margin_call' : state.endReason),
    };
}

// =============================================================================
// ENGINE CORE
// =============================================================================

/**
 * Check if current position should be liquidated
 */
export function checkLiquidation(state: GameState): GameState {
    if (!state.position) return state;

    const currentCandle = state.candles[state.currentIndex];
    const markPrice = currentCandle.c;
    const position = state.position;

    const pnl = computeUnrealized(position, markPrice);

    // Condition: Equity of position <= Maintenance Margin
    const maintenanceMargin = position.size * position.entryPrice * position.mmr;

    let currentPositionEquity = 0;
    if (position.mode === 'ISOLATED') {
        currentPositionEquity = position.marginUsed + pnl - position.entryFees;
    } else {
        // Cross mode use total cash (which is locked) + pnl
        currentPositionEquity = position.marginUsed + pnl - position.entryFees;
    }

    // Simplified: Check if price crossed LiqPrice
    const isLiquidated = position.side === 'LONG'
        ? markPrice <= position.liqPrice
        : markPrice >= position.liqPrice;

    if (isLiquidated || currentPositionEquity <= maintenanceMargin) {
        return closePosition(state, true) || state;
    }

    return state;
}

/**
 * Advance to next candle
 */
export function nextCandle(state: GameState): GameState {
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

    const newState = {
        ...state,
        currentIndex: newIndex,
    };

    // Check liquidation after price move
    return checkLiquidation(newState);
}

/**
 * Calculate current total equity
 */
export function calculateEquity(state: GameState): number {
    const currentCandle = state.candles[state.currentIndex];
    if (!currentCandle) return state.cash;

    const pnl = computeUnrealized(state.position, currentCandle.c);

    if (state.position?.mode === 'ISOLATED') {
        return state.cash + state.position.marginUsed + pnl;
    }

    // Cross: Position.marginUsed is the cash at entry
    // current equity = margin_at_entry + pnl - fees
    if (state.position) {
        return state.position.marginUsed + pnl - state.position.entryFees;
    }

    return state.cash;
}

// =============================================================================
// STATISTICS
// =============================================================================

export function computeStats(
    trades: Trade[],
    initialEquity: number,
    totalFeesPaid: number,
    finalCash: number
): SessionStats {
    // Calculate PnL and other stats
    // Note: for this sim, we already have trade results

    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl <= 0);
    const liquidations = trades.filter(t => t.isLiquidated).length;

    const totalPnl = finalCash - initialEquity;
    const returnPct = (totalPnl / initialEquity) * 100;

    // Max ROE% calculation - estimate from trades based on gross PnL vs margin
    let maxRoe = 0;
    for (const trade of trades) {
        // ROE% = (grossPnl / marginUsed) * 100
        // marginUsed = notional / leverage
        const marginUsed = trade.notional / trade.leverage;
        if (marginUsed > 0) {
            const roe = (trade.grossPnl / marginUsed) * 100;
            if (roe > maxRoe) maxRoe = roe;
        }
    }

    // Calculate max drawdown
    let peak = initialEquity;
    let maxDrawdown = 0;
    let runningEquity = initialEquity;

    for (const trade of trades) {
        runningEquity += trade.pnl;
        if (runningEquity > peak) peak = runningEquity;
        const drawdown = peak - runningEquity;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return {
        totalPnl,
        returnPct,
        maxDrawdown,
        maxDrawdownPct: peak > 0 ? (maxDrawdown / peak) * 100 : 0,
        winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
        largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0,
        avgWin: winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0,
        avgLoss: losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length : 0,
        totalFees: totalFeesPaid,
        maxRoe,
        liquidations,
    };
}

// =============================================================================
// STATE INITIALIZATION
// =============================================================================

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
        currentIndex: candles.length > 50 ? 49 : Math.max(0, candles.length - 1),
        initialEquity: INITIAL_EQUITY,
        cash: INITIAL_EQUITY,
        position: null,
        trades: [],
        totalFeesPaid: 0,
        leverage: 10,
        marginMode: 'ISOLATED',
        marginUsedUSDT: 1000,
        config,
        mode,
        startTime,
        symbol,
        interval,
        isEnded: false,
        endReason: null,
    };
}
