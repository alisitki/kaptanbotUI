
import { useEffect, useRef, useCallback } from 'react';
import { Candle } from '@/lib/game/types';
import { toast } from 'sonner';

interface WebSocketHookProps {
    symbol: string;
    interval: string;
    enabled: boolean;
    onUpdate: (candle: Partial<Candle>) => void;
    onClose: (candle: Candle) => void;
}

// Global variable to track active connection to prevent duplicates
let activeSocket: WebSocket | null = null;

export function useBinanceStream({
    symbol,
    interval,
    enabled,
    onUpdate,
    onClose
}: WebSocketHookProps) {
    const wsRef = useRef<WebSocket | null>(null);
    const throttleRef = useRef<NodeJS.Timeout | null>(null);

    // Accumulate updates within the throttle window
    const pendingUpdate = useRef<{
        c?: number; // Last Close/Price
        h?: number; // Max High in window
        l?: number; // Min Low in window
        v?: number; // Accumulated Volume in window
    }>({});

    // Throttled update flush (100ms for snappier feel)
    useEffect(() => {
        if (!enabled) return;

        const flushUpdates = () => {
            if (Object.keys(pendingUpdate.current).length > 0) {
                onUpdate({ ...pendingUpdate.current });
                // Reset pending, but keep tracking if needed? 
                // Actually reset is fine, next window starts fresh.
                // Engine handles accumulating V and checking absolute H/L.
                pendingUpdate.current = {};
            }
        };

        const intervalId = setInterval(flushUpdates, 100);
        return () => clearInterval(intervalId);
    }, [enabled, onUpdate]);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        // Clean up any existing global socket just in case
        if (activeSocket && activeSocket !== wsRef.current) {
            activeSocket.close();
        }

        const klineStream = `${symbol.toLowerCase()}@kline_${interval}`;
        const tradeStream = `${symbol.toLowerCase()}@aggTrade`;

        // Use Combined Streams
        const url = `wss://stream.binance.com:9443/stream?streams=${klineStream}/${tradeStream}`;

        console.log(`🔌 Connecting to Binance Stream: ${url}`);
        const ws = new WebSocket(url);
        wsRef.current = ws;
        activeSocket = ws;

        ws.onopen = () => {
            console.log('✅ Binance Stream Connected');
            toast.success("Canlı veri akışı başladı");
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                // Combined stream format: { stream: string, data: any }
                const stream = message.stream;
                const data = message.data;

                // Handle Aggregated Trade (Real-time ticks)
                if (stream.endsWith('@aggTrade')) {
                    const price = parseFloat(data.p);
                    const qty = parseFloat(data.q);

                    // Update pending stats for next flush
                    pendingUpdate.current.c = price;

                    // Track High/Low within this throttle window
                    pendingUpdate.current.h = Math.max(pendingUpdate.current.h ?? price, price);
                    pendingUpdate.current.l = Math.min(pendingUpdate.current.l ?? price, price);

                    // Accumulate volume
                    pendingUpdate.current.v = (pendingUpdate.current.v ?? 0) + qty;
                }

                // Handle Kline Update (Authoritative candle status)
                else if (stream.endsWith(`@kline_${interval}`)) {
                    const k = data.k;

                    const klineData: Partial<Candle> = {
                        t: k.t,
                        o: parseFloat(k.o),
                        h: parseFloat(k.h),
                        l: parseFloat(k.l),
                        c: parseFloat(k.c),
                        v: parseFloat(k.v),
                    };

                    // If closed, trigger closing logic immediately
                    if (k.x) {
                        onClose(klineData as Candle);
                        // Reset pending to avoid double counting or out-of-sync updates
                        pendingUpdate.current = {};
                    } else {
                        // For open klines, we can strictly sync to what Binance says
                        // This corrects any drift from our manual aggregation
                        pendingUpdate.current = {
                            ...pendingUpdate.current,
                            ...klineData
                        };
                    }
                }

            } catch (error) {
                console.error('WS Parse Error:', error);
            }
        };

        ws.onclose = () => {
            console.log('❌ Binance Stream Closed');
            if (wsRef.current === ws) wsRef.current = null;
            if (activeSocket === ws) activeSocket = null;

            // Reconnect if still enabled
            if (enabled) {
                setTimeout(connect, 2000);
            }
        };

        ws.onerror = (err) => {
            console.error('Binance WS Error:', err);
            ws.close();
        };

    }, [symbol, interval, enabled, onClose]);

    useEffect(() => {
        if (enabled) {
            connect();
        } else {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
            }
        };
    }, [enabled, connect]);
}
