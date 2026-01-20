import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BINANCE_ENDPOINTS = [
    'https://api.binance.com',
    'https://api1.binance.com',
    'https://api2.binance.com',
    'https://api3.binance.com',
    'https://data-api.binance.vision'
];

async function fetchFromBinance(symbol: string, interval: string, limit: string) {
    let lastError: any = null;

    for (const endpoint of BINANCE_ENDPOINTS) {
        try {
            const url = `${endpoint}/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
            console.log(`Attempting binance fetch: ${url}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const response = await fetch(url, {
                signal: controller.signal,
                next: { revalidate: 0 } // No cache
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`Binance Endpoint ${endpoint} failed: ${response.status} ${errorText}`);
                lastError = new Error(`Binance API Error: ${response.status}`);
                continue;
            }

            return await response.json();
        } catch (error) {
            console.error(`Fetch error for ${endpoint}:`, error);
            lastError = error;
            continue;
        }
    }

    throw lastError || new Error('All Binance endpoints failed');
}

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
        const data = await fetchFromBinance(symbol, interval, limit);

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
        console.error('Final Proxy Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch from Binance' },
            { status: 500 }
        );
    }
}
