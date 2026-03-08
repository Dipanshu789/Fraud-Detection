import useWebSocket from 'react-use-websocket';
import { useState, useEffect } from 'react';

const WS_URL = 'ws://localhost:8000/ws/live-feed';

export const useTransactionWS = () => {
    const [transactions, setTransactions] = useState([]);
    const { lastJsonMessage, readyState } = useWebSocket(WS_URL, {
        shouldReconnect: (closeEvent) => true,
    });

    useEffect(() => {
        if (lastJsonMessage) {
            setTransactions((prev) => [lastJsonMessage, ...prev].slice(0, 100));
        }
    }, [lastJsonMessage]);

    return { transactions, lastJsonMessage, readyState };
};
