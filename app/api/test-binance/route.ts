import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    const url = 'https://data-api.binance.vision/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=5';

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const status = response.status;
        const body = await response.text();

        return NextResponse.json({
            success: response.ok,
            status,
            url,
            sample: body.substring(0, 200),
            headers: Object.fromEntries(response.headers.entries())
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            url
        }, { status: 500 });
    }
}
