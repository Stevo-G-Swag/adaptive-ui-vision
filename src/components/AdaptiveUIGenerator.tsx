import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Settings as SettingsIcon, FileText } from 'lucide-react';
import Settings from './Settings';
import { useWebSocket } from '@/hooks/useWebSocket';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const WS_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";

const AdaptiveUIGenerator: React.FC = () => {
  const [conversation, setConversation] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>(
    "Assist a real-time software developer in interacting with a full-stack agentic framework including creating and editing files using a cache API."
  );
  const [voice, setVoice] = useState<string>("Alloy");
  const [serverTurnDetection, setServerTurnDetection] = useState<string>("Voice activity");
  const [threshold, setThreshold] = useState<number>(0.5);
  const [prefixPadding, setPrefixPadding] = useState<number>(300);
  const [silenceDuration, setSilenceDuration] = useState<number>(500);
  const [temperature, setTemperature] = useState<number>(0.8);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const { register, handleSubmit, reset } = useForm<{ message: string }>();
  const { toast } = useToast();

  const { sendMessage, connectionStatus } = useWebSocket(WS_URL, {
    onOpen: sendInitialMessage,
    onMessage: handleIncomingMessage,
    onError: () => toast({ title: 'Connection Error', description: 'Failed to connect to the server. Retrying...', variant: 'destructive' }),
    onClose: () => toast({ title: 'Connection Closed', description: 'WebSocket connection closed. Attempting to reconnect...', variant: 'destructive' }),
  });

  useEffect(() => {
    if (connectionStatus === 'connected') {
      toast({ title: 'Connected', description: 'Successfully connected to the server.', variant: 'default' });
    } else if (connectionStatus === 'disconnected') {
      toast({ title: 'Disconnected', description: 'Lost connection to the server. Attempting to reconnect...', variant: 'destructive' });
    }
  }, [connectionStatus, toast]);

  function sendInitialMessage() {
    sendMessage(JSON.stringify({
      type: "response.create",
      response: {
        modalities: ["text"],
        instructions: systemMessage,
      }
    }));
  }

  function handleIncomingMessage(message: any) {
    if (message.type === 'response.text.delta') {
      setConversation(prev => [...prev, message.delta]);
    } else if (message.type === 'response.done') {
      toast({ title: 'Response Complete', description: 'The AI has finished its response.' });
    }
  }

  const onSubmit = handleSubmit(({ message }) => {
    setConversation(prev => [...prev, `User: ${message}`]);
    sendMessage(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: message }]
      }
    }));
    sendMessage(JSON.stringify({ type: 'response.create' }));
    reset();
  });

  const startListening = () => {
    if (!isListening) {
      setIsListening(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setConversation(prev => [...prev, `User: ${transcript}`]);
        sendMessage(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      setIsListening(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="conversation" className="w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Realtime</h1>
          <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="settings"><SettingsIcon className="w-4 h-4 mr-2" />Settings</TabsTrigger>
            <TabsTrigger value="logs"><FileText className="w-4 h-4 mr-2" />Logs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="conversation" className="p-4">
          <div className="h-[60vh] overflow-y-auto mb-4 p-4 bg-gray-100 rounded-md">
            {conversation.map((msg, index) => (
              <div key={index} className="mb-2">{msg}</div>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex space-x-2">
            <Input {...register('message')} placeholder="Type your message..." className="flex-grow" />
            <Button type="submit" disabled={connectionStatus !== 'connected'}>Send</Button>
            <Button type="button" onClick={startListening} variant="outline" disabled={connectionStatus !== 'connected'}>
              <Mic className={`w-4 h-4 ${isListening ? 'text-red-500' : ''}`} />
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="settings" className="p-4">
          <Settings
            systemMessage={systemMessage}
            setSystemMessage={setSystemMessage}
            voice={voice}
            setVoice={setVoice}
            serverTurnDetection={serverTurnDetection}
            setServerTurnDetection={setServerTurnDetection}
            threshold={threshold}
            setThreshold={setThreshold}
            prefixPadding={prefixPadding}
            setPrefixPadding={setPrefixPadding}
            silenceDuration={silenceDuration}
            setSilenceDuration={setSilenceDuration}
            temperature={temperature}
            setTemperature={setTemperature}
            maxTokens={maxTokens}
            setMaxTokens={setMaxTokens}
          />
        </TabsContent>

        <TabsContent value="logs" className="p-4">
          <div className="h-[60vh] overflow-y-auto p-4 bg-gray-100 rounded-md">
            <p>Logs will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AdaptiveUIGenerator;
