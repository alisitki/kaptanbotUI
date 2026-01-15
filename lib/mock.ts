import { BotState, DecisionLog, Order } from './types';

// Singleton in-memory state (global var) to simulate persistence in dev mode server
declare global {
    var mockState: BotState | undefined;
    var mockDecisions: DecisionLog[] | undefined;
    var mockOrders: Order[] | undefined;
}

const INITIAL_STATE: BotState = {
    symbol: "BTCUSDT",
    price: 92844.2,
    bias: "SHORT",
    mode: "HEDGE",
    long_units: 3,
    short_units: 15,
    target_long_units: 3,
    target_short_units: 15,
    flip_level: 91400,
    supports: [90500, 89500, 87500],
    resistances: [93500, 95500, 99000],
    cooldown_remaining_sec: 22,
    equity_usdt: 12450.22,
    pnl_unrealized_usdt: -332.14,
    net_exposure_usdt: -8200,
    funding_hourly_usdt: -12.4,
    ws_connected: true,
    latency_ms: 41
};

export function getMockState(): BotState {
    if (!global.mockState) {
        global.mockState = { ...INITIAL_STATE };
    }

    // Simulate random fluctuations
    const state = global.mockState;
    state.price += (Math.random() - 0.5) * 50;
    state.latency_ms = 30 + Math.floor(Math.random() * 20);
    state.pnl_unrealized_usdt += (Math.random() - 0.5) * 10;

    // Update cooling down
    if (state.cooldown_remaining_sec > 0) {
        if (Math.random() > 0.8) state.cooldown_remaining_sec -= 1;
        // Real decrement would be time-based but this is per-request/random-tick
    }

    return state;
}

export function updateMockState(updates: Partial<BotState>) {
    if (!global.mockState) {
        global.mockState = { ...INITIAL_STATE };
    }
    global.mockState = { ...global.mockState, ...updates };
    return global.mockState;
}

const INITIAL_DECISIONS: DecisionLog[] = [
    {
        id: "d1",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        intent: "REBALANCE",
        reason: "Resistance hit at 93500",
        diff_long: -1,
        diff_short: +2,
        price_at_decision: 93505
    },
    {
        id: "d2",
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        intent: "TP",
        reason: "Partial take profit on dump",
        diff_long: 0,
        diff_short: -5,
        price_at_decision: 92100
    },
    {
        id: "d3",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        intent: "FLIP",
        reason: "Level lost confirmed",
        diff_long: -10,
        diff_short: +10,
        price_at_decision: 92800
    }
];

export function getMockDecisions(): DecisionLog[] {
    if (!global.mockDecisions) global.mockDecisions = [...INITIAL_DECISIONS];
    return global.mockDecisions;
}

export function getMockOrders(): Order[] {
    // Generate some dummy orders
    return [
        { id: "o1", symbol: "BTCUSDT", side: "SELL", type: "LIMIT", price: 93500, size: 2, status: "FILLED", timestamp: new Date().toISOString() },
        { id: "o2", symbol: "BTCUSDT", side: "BUY", type: "LIMIT", price: 90500, size: 1, status: "OPEN", timestamp: new Date().toISOString() },
    ];
}
