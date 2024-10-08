import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketHookOptions {
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

export function useWebSocket(url: string, options: WebSocketHookOptions) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      if (options.onOpen) options.onOpen();
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (options.onMessage) options.onMessage(data);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (options.onError) options.onError(error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      if (options.onClose) options.onClose();

      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(baseReconnectDelay * 2 ** reconnectAttempts.current, 30000);
        setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };
  }, [url, options]);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  return { sendMessage, connectionStatus };
}