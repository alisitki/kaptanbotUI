import { Signal, Watch, Trade, PortfolioState, AppState } from "./types";

// Singleton Mock Store to persist data in-memory during dev session
class MockStore {
    private static instance: MockStore;

    public state: AppState = {
        connected: true,
        latency: 42,
        mode: "PAPER",
        notifications: 3,
        active_symbol: "BTCUSDT"
    };

    public portfolio: PortfolioState = {
        equity_usdt: 12450.00,
        balance_available: 8450.00,
        pnl_total_usdt: 2450.00,
        pnl_realized_usdt: 1850.00,
        pnl_unrealized_usdt: 600.00,
        total_return_percent: 24.5,
        win_rate: 68.4,
        profit_factor: 2.1,
        max_drawdown: 8.5,
        open_positions_count: 2
    };

    public signals: Signal[] = [
        {
            id: "sig-1",
            symbol: "BTCUSDT",
            timestamp: new Date().toISOString(),
            type: "LONG",
            strength: 85,
            price: 98420.50,
            reasons: ["RSI 28 Oversold", "BB Lower Band Touch", "Volume Spike"],
            suggested_entry: [98300, 98500],
            suggested_tp: [102000, 105000],
            confidence: 88
        },
        {
            id: "sig-2",
            symbol: "ETHUSDT",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            type: "LONG",
            strength: 72,
            price: 2650.20,
            reasons: ["MA 50 Cross", "Support Level Bounce"],
            suggested_entry: [2640, 2660],
            suggested_tp: [2750, 2800],
            confidence: 75
        },
        {
            id: "sig-3",
            symbol: "SOLUSDT",
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            type: "LONG",
            strength: 65,
            price: 142.50,
            reasons: ["Trendline Support"],
            suggested_entry: [140, 142],
            suggested_tp: [155, 160],
            confidence: 60
        }
    ];

    public watches: Watch[] = [
        {
            id: "w-1",
            symbol: "AVAXUSDT",
            entry_price: 35.40,
            current_price: 36.80,
            peak_price: 37.00,
            amount_usdt: 1000,
            tp_mode: "TRAILING",
            tp_percent: 5,
            target_tp_price: 38.00, // Dynamic in real logic
            trailing_step_percent: 1,
            status: "WATCHING",
            pnl_unrealized: 39.54,
            pnl_percent: 3.95,
            started_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        },
        {
            id: "w-2",
            symbol: "DOGEUSDT",
            entry_price: 0.1200,
            current_price: 0.1180,
            peak_price: 0.1200,
            amount_usdt: 500,
            tp_mode: "FIXED",
            tp_percent: 10,
            target_tp_price: 0.1320,
            trailing_step_percent: 0,
            status: "WATCHING",
            pnl_unrealized: -8.33,
            pnl_percent: -1.66,
            started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        }
    ];

    public trades: Trade[] = [
        {
            id: "t-1",
            symbol: "BTCUSDT",
            side: "BUY",
            price: 92000,
            qty: 0.05,
            notional: 4600,
            fee: 2.3,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
        },
        {
            id: "t-2",
            symbol: "BTCUSDT",
            side: "SELL",
            price: 94500,
            qty: 0.05,
            notional: 4725,
            fee: 2.36,
            pnl: 125,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        }
    ];

    private constructor() { }

    public static getInstance(): MockStore {
        if (!MockStore.instance) {
            MockStore.instance = new MockStore();
        }
        return MockStore.instance;
    }

    // --- Actions ---

    public addWatch(symbol: string, amount: number, tpMode: 'FIXED' | 'TRAILING', tpPercent: number, trailingStep: number) {
        // Mock current price based on symbol (randomize a bit around a base)
        const basePrice = symbol.includes("BTC") ? 98000 : symbol.includes("ETH") ? 2700 : 100;
        const price = basePrice * (1 + (Math.random() * 0.02 - 0.01));

        const newWatch: Watch = {
            id: `w-${Date.now()}`,
            symbol,
            entry_price: price,
            current_price: price,
            peak_price: price,
            amount_usdt: amount,
            tp_mode: tpMode,
            tp_percent: tpPercent,
            target_tp_price: price * (1 + tpPercent / 100),
            trailing_step_percent: trailingStep,
            status: "WATCHING",
            pnl_unrealized: 0,
            pnl_percent: 0,
            started_at: new Date().toISOString()
        };

        this.watches.unshift(newWatch);
        this.portfolio.balance_available -= amount;
        this.portfolio.open_positions_count += 1;

        return newWatch;
    }

    public sellWatch(id: string) {
        const idx = this.watches.findIndex(w => w.id === id);
        if (idx === -1) return null;

        const watch = this.watches[idx];
        watch.status = "SOLD";

        // Create Trade Record
        const sellTrade: Trade = {
            id: `t-${Date.now()}`,
            symbol: watch.symbol,
            side: "SELL",
            price: watch.current_price,
            qty: watch.amount_usdt / watch.entry_price, // approx
            notional: (watch.amount_usdt / watch.entry_price) * watch.current_price,
            fee: 1.5,
            pnl: watch.pnl_unrealized,
            timestamp: new Date().toISOString()
        };

        this.trades.unshift(sellTrade);
        this.portfolio.balance_available += sellTrade.notional;
        this.portfolio.pnl_realized_usdt += (watch.pnl_unrealized || 0);
        this.portfolio.pnl_total_usdt += (watch.pnl_unrealized || 0);
        this.portfolio.open_positions_count -= 1;
        this.watches = this.watches.filter(w => w.id !== id); // Remove from active watches or keep as history? Keeping concise for now.

        return watch;
    }
}

export const mockStore = MockStore.getInstance();
