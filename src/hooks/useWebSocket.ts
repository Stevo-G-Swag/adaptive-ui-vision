import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface WebSocketHookOptions {
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

const CONNECTION_TIMEOUT = 30000; // 30 seconds
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 1000;

export function useWebSocket(url: string, options: WebSocketHookOptions) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutId = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    ws.current = new WebSocket(url);
    setConnectionStatus('connecting');

    const connectionTimer = setTimeout(() => {
      if (ws.current && ws.current.readyState !== WebSocket.OPEN) {
        ws.current.close();
        setConnectionStatus('disconnected');
        handleReconnect();
      }
    }, CONNECTION_TIMEOUT);

    ws.current.onopen = () => {
      clearTimeout(connectionTimer);
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      if (options.onOpen) options.onOpen();
    };

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (options.onMessage) options.onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onerror = (error: Event) => {
      clearTimeout(connectionTimer);
      console.error('WebSocket error:', error);
      if (options.onError) options.onError(error);
    };

    ws.current.onclose = (event: CloseEvent) => {
      clearTimeout(connectionTimer);
      console.log('WebSocket disconnected. Reason:', event.reason);
      setConnectionStatus('disconnected');
      if (options.onClose) options.onClose();
      handleReconnect();
    };
  }, [url, options]);

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(BASE_RECONNECT_DELAY * 2 ** reconnectAttempts.current, 30000);
      console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
      
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }

      reconnectTimeoutId.current = setTimeout(() => {
        reconnectAttempts.current++;
        connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      toast({
        title: 'Connection Failed',
        description: 'Max reconnection attempts reached. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.error('WebSocket is not connected');
      toast({
        title: 'Send Error',
        description: 'Failed to send message. WebSocket is not connected.',
        variant: 'destructive',
      });
    }
  }, []);

  const interruptResponse = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'response.interrupt' }));
    } else {
      console.error('WebSocket is not connected');
      toast({
        title: 'Interrupt Error',
        description: 'Failed to interrupt response. WebSocket is not connected.',
        variant: 'destructive',
      });
    }
  }, []);

  return { sendMessage, connectionStatus, interruptResponse };
}