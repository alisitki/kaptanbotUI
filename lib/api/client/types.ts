
export interface Signal {
    id: string;
    symbol: string;
    timestamp: string;
    type: 'LONG' | 'SHORT';
    strength: number; // 0-100
    price: number;
    reasons: string[];
    suggested_entry: [number, number];
    suggested_tp: [number, number];
    confidence: number;
}

export interface Watch {
    id: string;
    symbol: string;
    entry_price: number;
    amount_usdt: number;
    current_price: number;
    peak_price: number;
    tp_mode: 'FIXED' | 'TRAILING';
    target_tp_price: number;
    trailing_step_percent: number;
    tp_percent: number;
    status: 'WATCHING' | 'READY_TO_SELL' | 'SOLD';
    pnl_unrealized: number;
    pnl_percent: number;
    started_at: string;
    client_order_id?: string;
}

export interface Trade {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    price: number;
    qty: number;
    notional: number;
    fee: number;
    pnl?: number;
    timestamp: string;
}

export interface PortfolioState {
    equity_usdt: number;
    balance_available: number;
    pnl_total_usdt: number;
    pnl_realized_usdt: number;
    pnl_unrealized_usdt: number;
    total_return_percent: number;
    win_rate: number;
    profit_factor: number;
    max_drawdown: number;
    open_positions_count: number;
}

export interface AppState {
    connected: boolean;
    latency: number;
    mode: 'PAPER' | 'LIVE';
    notifications: number;
    active_symbol: string;
}

export interface BotSettings {
    mode: 'PAPER' | 'LIVE';
    allow_symbols: string[];
    live_max_order_usdt: number;
    paper_fee_bps: number;
    telegram_enabled: boolean;
    telegram_bot_token: string;
    telegram_chat_id: string;
    telegram_notify_on: string[];
}

export interface BotEvent {
    id: string;
    timestamp: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    message: string;
    metadata?: any;
}

export interface OhlcCandle {
    ts: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
