
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval');
    const limit = searchParams.get('limit') || '100';

    if (!symbol || !interval) {
        return NextResponse.json(
            { error: 'Symbol and interval are required' },
            { status: 400 }
        );
    }

    try {
        const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;

        const response = await fetch(binanceUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Binance API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        // Transform [timestamp, open, high, low, close, volume, ...] to Candle object
        const candles = data.map((d: any) => ({
            t: d[0],
            o: parseFloat(d[1]),
            h: parseFloat(d[2]),
            l: parseFloat(d[3]),
            c: parseFloat(d[4]),
            v: parseFloat(d[5]),
        }));

        return NextResponse.json({ candles });

    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch from Binance' },
            { status: 500 }
        );
    }
}
