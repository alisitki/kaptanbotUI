import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 1. Calculate a random start time within the last 2 years
        // End time: now
        // Start time range: now - 2 years
        const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const minStartTime = now - TWO_YEARS_MS;

        // Random start point
        const randomStartTime = Math.floor(minStartTime + Math.random() * (now - minStartTime - (500 * 3600 * 1000))); // Ensure enough buffer for 500 candles

        // 2. Fetch from Binance (Public API)
        // Symbol: BTCUSDT
        // Interval: 1h usually provides good price action for training
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=500&startTime=${randomStartTime}`);

        if (!response.ok) {
            throw new Error(`Binance API error: ${response.statusText}`);
        }

        const data = await response.json();

        // 3. Transform Data
        // Binance format: [openTime, open, high, low, close, volume, ...]
        // We need: { time, price, ma20, etc.. } for the game
        // We will calculate basic MAs here to keep client light

        const candles = data.map((c: any) => ({
            time: c[0],
            open: parseFloat(c[1]),
            high: parseFloat(c[2]),
            low: parseFloat(c[3]),
            close: parseFloat(c[4]),
            price: parseFloat(c[4]), // Game uses 'price' as close
        }));

        // Calculate Simple Moving Averages
        const gameData = candles.map((candle: any, index: number, arr: any[]) => {
            // MA20
            const ma20Slice = arr.slice(Math.max(0, index - 19), index + 1);
            const ma20Sum = ma20Slice.reduce((sum: number, c: any) => sum + c.close, 0);
            const ma20 = ma20Sum / ma20Slice.length;

            return {
                ...candle,
                ma20
            };
        });

        return NextResponse.json(gameData);

    } catch (error) {
        console.error("Game data fetch error:", error);
        return NextResponse.json({ error: "Failed to load game data" }, { status: 500 });
    }
}
