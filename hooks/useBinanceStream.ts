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

export function useBinanceStream({
    symbol,
    interval,
    enabled,
    onUpdate,
    onClose
}: WebSocketHookProps) {
    const wsRef = useRef<WebSocket | null>(null);
    const intervalRef = useRef(interval);
    const enabledRef = useRef(enabled);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync refs
    useEffect(() => {
        intervalRef.current = interval;
        enabledRef.current = enabled;
    }, [interval, enabled]);

    // Accumulate updates within the throttle window
    const pendingUpdate = useRef<{
        c?: number;
        h?: number;
        l?: number;
        v?: number;
    }>({});

    // Throttled update flush (100ms)
    useEffect(() => {
        if (!enabled) return;

        const flushUpdates = () => {
            if (Object.keys(pendingUpdate.current).length > 0) {
                onUpdate({ ...pendingUpdate.current });
                pendingUpdate.current = {};
            }
        };

        const intervalId = setInterval(flushUpdates, 100);
        return () => clearInterval(intervalId);
    }, [enabled, onUpdate]);

    const connect = useCallback(() => {
        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (!enabledRef.current) return;

        // If already connecting or open for the correct interval, skip
        if (wsRef.current) {
            if (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN) {
                return;
            }
        }

        const currentInterval = intervalRef.current;
        const klineStream = `${symbol.toLowerCase()}@kline_${currentInterval}`;
        const tradeStream = `${symbol.toLowerCase()}@aggTrade`;
        const url = `wss://stream.binance.com:9443/stream?streams=${klineStream}/${tradeStream}`;

        console.log(`🔌 Connecting to Binance Stream: ${url} (Intent: ${currentInterval})`);
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            if (ws !== wsRef.current) {
                ws.close();
                return;
            }
            console.log(`✅ Binance Stream Connected [${currentInterval}]`);
            toast.success("Canlı veri akışı başladı");
        };

        ws.onmessage = (event) => {
            if (ws !== wsRef.current) return;

            try {
                const message = JSON.parse(event.data);
                const stream = message.stream;
                const data = message.data;

                if (stream.endsWith('@aggTrade')) {
                    const price = parseFloat(data.p);
                    const qty = parseFloat(data.q);
                    pendingUpdate.current.c = price;
                    pendingUpdate.current.h = Math.max(pendingUpdate.current.h ?? price, price);
                    pendingUpdate.current.l = Math.min(pendingUpdate.current.l ?? price, price);
                    pendingUpdate.current.v = (pendingUpdate.current.v ?? 0) + qty;
                } else if (stream.endsWith(`@kline_${currentInterval}`)) {
                    const k = data.k;
                    const klineData: Partial<Candle> = {
                        t: k.t,
                        o: parseFloat(k.o),
                        h: parseFloat(k.h),
                        l: parseFloat(k.l),
                        c: parseFloat(k.c),
                        v: parseFloat(k.v),
                    };

                    if (k.x) {
                        onClose(klineData as Candle);
                        pendingUpdate.current = {};
                    } else {
                        pendingUpdate.current = { ...pendingUpdate.current, ...klineData };
                    }
                }
            } catch (error) {
                console.error('WS Parse Error:', error);
            }
        };

        ws.onclose = () => {
            console.log(`❌ Binance Stream Closed [${currentInterval}]`);

            if (ws === wsRef.current) {
                wsRef.current = null;
                // Only reconnect if still enabled AND interval hasn't changed
                if (enabledRef.current && intervalRef.current === currentInterval) {
                    reconnectTimeoutRef.current = setTimeout(connect, 3000);
                }
            }
        };

        ws.onerror = (err) => {
            console.error('Binance WS Error:', err);
            ws.close();
        };

    }, [symbol, onClose]); // Minimal fixed dependencies

    useEffect(() => {
        if (enabled) {
            connect();
        }

        return () => {
            if (wsRef.current) {
                const ws = wsRef.current;
                wsRef.current = null;
                ws.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [enabled, interval, connect]);
}
