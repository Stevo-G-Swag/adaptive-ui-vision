import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

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
    setConnectionStatus('connecting');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      toast({
        title: 'Connected',
        description: 'Successfully connected to the server.',
        variant: 'default',
      });
      if (options.onOpen) options.onOpen();
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (options.onMessage) options.onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        toast({
          title: 'Message Error',
          description: 'Failed to parse incoming message.',
          variant: 'destructive',
        });
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'An error occurred with the WebSocket connection.',
        variant: 'destructive',
      });
      if (options.onError) options.onError(error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      toast({
        title: 'Disconnected',
        description: 'Lost connection to the server.',
        variant: 'destructive',
      });
      if (options.onClose) options.onClose();

      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(baseReconnectDelay * 2 ** reconnectAttempts.current, 30000);
        toast({
          title: 'Reconnecting',
          description: `Attempting to reconnect in ${delay / 1000} seconds...`,
          variant: 'default',
        });
        setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      } else {
        toast({
          title: 'Connection Failed',
          description: 'Max reconnection attempts reached. Please try again later.',
          variant: 'destructive',
        });
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