// =============================================================================
// GAME TYPES - Price Action Master
// =============================================================================

/**
 * Single candlestick data from Binance
 */
export interface Candle {
    t: number;  // Open time (timestamp ms)
    o: number;  // Open price
    h: number;  // High price
    l: number;  // Low price
    c: number;  // Close price
    v: number;  // Volume
}

/**
 * Position side
 */
export type PositionSide = 'LONG' | 'SHORT';

/**
 * Margin Mode
 */
export type MarginMode = 'ISOLATED' | 'CROSS';

/**
 * Open position
 */
export interface Position {
    side: PositionSide;
    entryPrice: number;
    entryTime: number;
    size: number;          // Size in BTC (Qty)
    notional: number;      // Size in USDT (size * entryPrice)
    leverage: number;      // Selected leverage
    marginUsed: number;    // Collateral used for this position
    entryFees: number;
    liqPrice: number;      // Liquidation price
    mmr: number;           // Maintenance margin rate (0.005 = 0.5%)
    mode: MarginMode;      // ISOLATED or CROSS
}

/**
 * Completed trade
 */
export interface Trade {
    side: PositionSide;
    entryPrice: number;
    exitPrice: number;
    entryTime: number;
    exitTime: number;
    size: number;
    notional: number;
    leverage: number;
    marginMode: MarginMode;
    pnl: number;           // Net PnL after all fees
    grossPnl: number;      // PnL before fees
    fees: number;          // Total fees (entry + exit)
    isLiquidated: boolean; // Whether position was liquidated
}

/**
 * Game configuration (fees & slippage)
 */
export interface GameConfig {
    feesEnabled: boolean;
    slippageEnabled: boolean;
    takerFeeBps: number;   // Default: 4 (0.04%)
    slippageBps: number;   // Default: 2 (0.02%)
    mmr: number;           // Default: 50 (0.50% = 0.005)
}

/**
 * Core game state
 */
export interface GameState {
    // Data
    candles: Candle[];
    currentIndex: number;

    // Financials
    initialEquity: number;
    cash: number;          // Free balance
    position: Position | null;
    trades: Trade[];
    totalFeesPaid: number;

    // Futures Settings
    leverage: number;
    marginMode: MarginMode;
    marginUsedUSDT: number; // Selected margin for Isolated mode

    // Config
    config: GameConfig;

    // Meta
    mode: 'random' | 'date';
    startTime: number;
    symbol: string;
    interval: string;

    // Game status
    isEnded: boolean;
    endReason: 'completed' | 'margin_call' | 'liquidated' | null;
}

/**
 * Session summary for localStorage
 */
export interface SessionSummary {
    id: string;
    startDate: string;      // ISO date
    endDate: string;        // ISO date
    mode: 'random' | 'date';
    pnl: number;
    returnPct: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    maxRoe: number;         // NEW: Maximum ROE% achieved
    liquidated: boolean;    // NEW: Whether any trade was liquidated
    timestamp: number;      // When session was saved
}

/**
 * Session statistics (calculated at game end)
 */
export interface SessionStats {
    totalPnl: number;
    returnPct: number;
    maxDrawdown: number;
    maxDrawdownPct: number;
    winRate: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    largestWin: number;
    largestLoss: number;
    avgWin: number;
    avgLoss: number;
    totalFees: number;
    maxRoe: number;         // NEW: Maximum ROE% achieved
    liquidations: number;   // NEW: Total 
}

/**
 * API response from /api/game/start
 */
export interface GameStartResponse {
    symbol: string;
    interval: string;
    mode: 'random' | 'date';
    startTime: number;
    candles: Candle[];
}

/**
 * API error response
 */
export interface GameApiError {
    error: string;
    code: 'RATE_LIMIT' | 'NETWORK_ERROR' | 'INVALID_DATA' | 'NO_DATA' | 'UNKNOWN';
    retryable: boolean;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_CONFIG: GameConfig = {
    feesEnabled: true,
    slippageEnabled: true,
    takerFeeBps: 4,    // 0.04%
    slippageBps: 2,    // 0.02%
    mmr: 50,           // 0.50%
};

export const INITIAL_EQUITY = 10_000;
export const POSITION_SIZE = 1; // 1 BTC
export const TOTAL_CANDLES = 500;
export const INITIAL_VISIBLE_CANDLES = 50;
