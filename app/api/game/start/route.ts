import { NextResponse } from 'next/server';
import { fetchKlines, generateRandomStartTime } from '@/lib/game/binance';

export const preferredRegion = 'fra1'; // Frankfurt, Germany - to bypass Binance region blocks
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const symbol = searchParams.get('symbol') || 'BTCUSDT';
        const interval = searchParams.get('interval') || '1h';
        const mode = searchParams.get('mode') as 'random' | 'date' || 'random';
        const dateParam = searchParams.get('date');
        const startTimeParam = searchParams.get('startTime');

        // Determine start time
        let startTime: number | undefined;

        if (mode === 'date' && dateParam) {
            // Parse date (YYYY-MM-DD) to midnight UTC timestamp
            const date = new Date(dateParam + 'T00:00:00.000Z');
            if (isNaN(date.getTime())) {
                return NextResponse.json(
                    { error: 'Invalid date format. Use YYYY-MM-DD.', code: 'INVALID_DATA', retryable: false },
                    { status: 400 }
                );
            }
            startTime = date.getTime();
        } else if (startTimeParam) {
            startTime = parseInt(startTimeParam);
            if (isNaN(startTime)) {
                return NextResponse.json(
                    { error: 'Invalid startTime parameter.', code: 'INVALID_DATA', retryable: false },
                    { status: 400 }
                );
            }
        }
        // If no startTime, fetchKlines will generate random

        // Fetch data with retries
        let result = await fetchKlines({
            symbol,
            interval,
            startTime,
            limit: 500,
        });

        // If random mode failed, try with new seed
        if (!result.success && mode === 'random' && result.error.retryable) {
            const newStartTime = generateRandomStartTime();
            result = await fetchKlines({
                symbol,
                interval,
                startTime: newStartTime,
                limit: 500,
            });
        }

        // Return error if still failed
        if (!result.success) {
            return NextResponse.json(
                result.error,
                { status: result.error.code === 'RATE_LIMIT' ? 429 : 500 }
            );
        }

        // Success response
        return NextResponse.json({
            symbol,
            interval,
            mode,
            startTime: result.startTime,
            candles: result.candles,
        });

    } catch (error) {
        console.error('Game API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', code: 'UNKNOWN', retryable: true },
            { status: 500 }
        );
    }
}
