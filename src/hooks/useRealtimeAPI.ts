import { useState, useEffect, useRef, useCallback } from 'react';
import { RealtimeClient } from '../lib/realtime-api-beta';
import { createRealtimeClient } from '../lib/realtimeClient';
import { useToast } from '@/hooks/use-toast';
import { addWeatherTool, addMemoryTool } from '../lib/tools';

export const useRealtimeAPI = (apiKey: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const clientRef = useRef<RealtimeClient | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (apiKey) {
      clientRef.current = createRealtimeClient(apiKey);
      connectToRealtimeAPI();
    }
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [apiKey]);

  const connectToRealtimeAPI = async () => {
    if (!clientRef.current) return;

    try {
      await clientRef.current.connect();
      setIsConnected(true);
      toast({
        title: 'Connected',
        description: 'Successfully connected to the Realtime API',
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to the Realtime API',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = useCallback((message: string) => {
    if (!clientRef.current) {
      toast({
        title: 'Not Connected',
        description: 'Please connect to the Realtime API first',
        variant: 'destructive',
      });
      return;
    }
    clientRef.current.sendUserMessageContent([{ type: 'input_text', text: message }]);
  }, [toast]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording logic here
    } else {
      if (!clientRef.current) {
        toast({
          title: 'Not Connected',
          description: 'Please connect to the Realtime API first',
          variant: 'destructive',
        });
        return;
      }
      setIsRecording(true);
      // Start recording logic here
      // Implement audio recording and streaming
    }
  }, [isRecording, toast]);

  const interruptResponse = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.cancelResponse('current-item-id', 0); // Replace with actual item ID and sample count
    }
  }, []);

  useEffect(() => {
    if (clientRef.current) {
      addWeatherTool(clientRef.current);
      addMemoryTool(clientRef.current);
    }
  }, [isConnected]);

  return {
    isConnected,
    isRecording,
    sendMessage,
    toggleRecording,
    interruptResponse,
    client: clientRef.current
  };
};
