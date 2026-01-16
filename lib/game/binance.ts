// =============================================================================
// BINANCE API HELPER - Hardened Fetch for Game Data
// =============================================================================

import { Candle, GameApiError } from './types';

const BINANCE_ENDPOINTS = [
    { url: 'https://data-api.binance.vision', path: '/api/v3' },
    { url: 'https://api.binance.com', path: '/api/v3' },
    { url: 'https://api1.binance.com', path: '/api/v3' },
    { url: 'https://api2.binance.com', path: '/api/v3' },
    { url: 'https://api3.binance.com', path: '/api/v3' },
    { url: 'https://api-gcp.binance.com', path: '/api/v3' },
];
const FETCH_TIMEOUT = 2500; // 2.5 seconds - very tight for fast rotation
const MAX_RETRIES = 3;      // Total 4 attempts
const RETRY_DELAYS = [0, 200, 500]; // Almost immediate retry

// =============================================================================
// CACHE
// =============================================================================

interface CacheEntry {
    data: Candle[];
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(symbol: string, interval: string, startTime: number): string {
    return `${symbol}-${interval}-${startTime}`;
}

function getFromCache(key: string): Candle[] | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

function setCache(key: string, data: Candle[]): void {
    cache.set(key, { data, timestamp: Date.now() });
}

// =============================================================================
// FETCH WITH TIMEOUT
// =============================================================================

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    // Use API key if provided in env to increase rate limits/rank
    if (process.env.BINANCE_API_KEY) {
        headers['X-MBX-APIKEY'] = process.env.BINANCE_API_KEY;
    }

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

// =============================================================================
// DATA VALIDATION
// =============================================================================

function validateKlines(data: unknown): data is Array<unknown[]> {
    if (!Array.isArray(data)) return false;
    if (data.length === 0) return false;

    // Check first element structure
    const first = data[0];
    if (!Array.isArray(first) || first.length < 6) return false;

    return true;
}

function parseKlines(rawData: Array<unknown[]>): Candle[] {
    return rawData.map(kline => ({
        t: Number(kline[0]),  // Open time
        o: parseFloat(String(kline[1])),
        h: parseFloat(String(kline[2])),
        l: parseFloat(String(kline[3])),
        c: parseFloat(String(kline[4])),
        v: parseFloat(String(kline[5])),
    }));
}

function validateCandles(candles: Candle[]): boolean {
    if (candles.length === 0) return false;

    // Check for duplicate timestamps
    const timestamps = new Set<number>();
    for (const candle of candles) {
        if (timestamps.has(candle.t)) {
            console.error('Duplicate timestamp found:', candle.t);
            return false;
        }
        timestamps.add(candle.t);
    }

    // Check ascending order
    for (let i = 1; i < candles.length; i++) {
        if (candles[i].t <= candles[i - 1].t) {
            console.error('Timestamps not in ascending order');
            return false;
        }
    }

    // Check for NaN values
    for (const candle of candles) {
        if (isNaN(candle.o) || isNaN(candle.h) || isNaN(candle.l) || isNaN(candle.c)) {
            console.error('NaN values in candle:', candle);
            return false;
        }
    }

    return true;
}

// =============================================================================
// MAIN FETCH FUNCTION
// =============================================================================

export interface FetchKlinesOptions {
    symbol?: string;
    interval?: string;
    startTime?: number;
    limit?: number;
}

export type FetchKlinesResult = {
    success: true;
    candles: Candle[];
    startTime: number;
} | {
    success: false;
    error: GameApiError;
};

/**
 * Fetch klines from Binance with retry logic and validation
 */
export async function fetchKlines(options: FetchKlinesOptions = {}): Promise<FetchKlinesResult> {
    const {
        symbol = 'BTCUSDT',
        interval = '1h',
        startTime,
        limit = 500,
    } = options;

    // Determine start time
    let effectiveStartTime: number;

    if (startTime) {
        effectiveStartTime = startTime;
    } else {
        // Random start time within last 2 years
        const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const minStartTime = now - TWO_YEARS_MS;
        // Leave buffer for 500 hourly candles (~21 days)
        const buffer = limit * 60 * 60 * 1000;
        effectiveStartTime = Math.floor(minStartTime + Math.random() * (now - minStartTime - buffer));
    }

    // Check cache
    const cacheKey = getCacheKey(symbol, interval, effectiveStartTime);
    const cached = getFromCache(cacheKey);
    if (cached) {
        return { success: true, candles: cached, startTime: effectiveStartTime };
    }

    // Retry loop
    let lastError: GameApiError | null = null;
    let endpointIndex = 0;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const endpoint = BINANCE_ENDPOINTS[endpointIndex % BINANCE_ENDPOINTS.length];
        const url = `${endpoint.url}${endpoint.path}/klines?symbol=${symbol}&interval=${interval}&startTime=${effectiveStartTime}&limit=${limit}`;

        try {
            console.log(`[Binance API] Attempt ${attempt + 1}: Fetching from ${endpoint.url}`);

            // Wait before retry (except first attempt)
            if (attempt > 0) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt - 1] || 1000));
            }

            const response = await fetchWithTimeout(url, FETCH_TIMEOUT);

            // Handle 451 (Region Blocked) or 404 (Path/Domain Issues)
            if (response.status === 451 || response.status === 404) {
                console.warn(`[Binance API] ${response.status} Error at ${endpoint.url}. Rotating...`);
                endpointIndex++; // Try next endpoint
                lastError = {
                    error: `Binance API returned ${response.status} at ${endpoint.url}. Switching endpoint...`,
                    code: 'NETWORK_ERROR',
                    retryable: true,
                };
                continue;
            }

            // Handle rate limiting
            if (response.status === 429) {
                console.warn(`[Binance API] 429 Rate Limit: ${endpoint.url}`);
                lastError = {
                    error: 'Binance API rate limit exceeded. Please wait a moment.',
                    code: 'RATE_LIMIT',
                    retryable: true,
                };
                continue;
            }

            // Handle other errors
            if (!response.ok) {
                console.error(`[Binance API] Error ${response.status}: ${endpoint.url}`);
                lastError = {
                    error: `Binance API returned status ${response.status}`,
                    code: 'NETWORK_ERROR',
                    retryable: response.status >= 500,
                };
                if (!lastError.retryable) {
                    endpointIndex++; // Even if not retryable, try next endpoint
                    continue;
                }
                continue;
            }

            const rawData = await response.json();
            console.log(`[Binance API] Success! Received data from ${endpoint.url}`);
            // ... rest of the validation logic remains same but I will include it to ensure consistency

            // Validate structure
            if (!validateKlines(rawData)) {
                lastError = {
                    error: 'Invalid data structure from Binance API',
                    code: 'INVALID_DATA',
                    retryable: false,
                };
                break;
            }

            // Parse candles
            const candles = parseKlines(rawData);

            // Validate candles
            if (!validateCandles(candles)) {
                lastError = {
                    error: 'Candle data validation failed (duplicates or invalid order)',
                    code: 'INVALID_DATA',
                    retryable: true,
                };
                continue;
            }

            const minRequired = options.startTime ? 60 : limit - 10;
            if (candles.length < minRequired) {
                lastError = {
                    error: `Insufficient data: got ${candles.length} candles`,
                    code: 'NO_DATA',
                    retryable: true,
                };
                continue;
            }

            // Success!
            setCache(cacheKey, candles);
            return { success: true, candles, startTime: effectiveStartTime };

        } catch (error) {
            console.error(`[Binance API] Exception on ${endpoint.url}:`, error);
            if (error instanceof Error && error.name === 'AbortError') {
                lastError = {
                    error: 'Request timed out. Please check your connection.',
                    code: 'NETWORK_ERROR',
                    retryable: true,
                };
            } else {
                lastError = {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    code: 'UNKNOWN',
                    retryable: true,
                };
            }
            // Switch endpoint on network failure too
            endpointIndex++;
        }
    }

    return { success: false, error: lastError! };
}

/**
 * Generate a new random start time (for retry with different seed)
 */
export function generateRandomStartTime(): number {
    const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const minStartTime = now - TWO_YEARS_MS;
    const buffer = 500 * 60 * 60 * 1000;
    return Math.floor(minStartTime + Math.random() * (now - minStartTime - buffer));
}
