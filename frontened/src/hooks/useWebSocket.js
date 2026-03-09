import { useEffect, useRef, useCallback } from 'react';

export function useWebSocket(url, onMessage) {
    const wsRef = useRef(null);
    const retryRef = useRef(null);  // ← store timeout ref
    const retryCount = useRef(0);
    const isUnmounted = useRef(false);  // ← guard against stale callbacks

    const connect = useCallback(() => {
        if (isUnmounted.current) return;  // ← stop if component gone
        if (retryCount.current >= 10) {
            console.error('WS: max retries reached'); return;
        }

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onmessage = (e) => {
            if (!isUnmounted.current) onMessage(JSON.parse(e.data));
        };
        ws.onclose = () => {
            if (isUnmounted.current) return;
            retryCount.current += 1;
            retryRef.current = setTimeout(connect, 3000);  // ← stored!
        };
        ws.onerror = () => ws.close();
        retryCount.current = 0;  // reset on successful open
    }, [url, onMessage]);

    useEffect(() => {
        isUnmounted.current = false;
        connect();
        return () => {
            isUnmounted.current = true;      // ← prevent stale callbacks
            clearTimeout(retryRef.current);   // ← cancel pending reconnect
            wsRef.current?.close();           // ← close socket cleanly
        };
    }, [connect]);
}
