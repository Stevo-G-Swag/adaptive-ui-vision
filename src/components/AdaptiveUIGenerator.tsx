import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, FileText } from 'lucide-react';
import Settings from './Settings';
import { useWebSocket } from '@/hooks/useWebSocket';
import ConversationView from './ConversationView';
import MessageInput from './MessageInput';
import LogViewer, { LogEntry } from './LogViewer';

const API_KEY = 'sk-bks-54d86fb254ccaaba45930425c80fac6f841d0741ec449972';
const WS_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";

const AdaptiveUIGenerator: React.FC = () => {
  const [conversation, setConversation] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
  const synth = window.speechSynthesis;
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { sendMessage, connectionStatus, interruptResponse } = useWebSocket(WS_URL, {
    onOpen: sendInitialMessage,
    onMessage: handleIncomingMessage,
    onError: handleWebSocketError,
    onClose: handleWebSocketClose,
  });

  useEffect(() => {
    if (connectionStatus === 'connected') {
      addLog('system', 'Connected to the server.');
    }
  }, [connectionStatus]);

  function addLog(type: LogEntry['type'], message: string) {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
    };
    setLogs(prevLogs => [...prevLogs, newLog]);
  }

  function sendInitialMessage() {
    try {
      sendMessage(JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["text"],
          instructions: systemMessage,
        }
      }));
      addLog('system', 'Sent initial message to the server.');
    } catch (error) {
      console.error('Error sending initial message:', error);
      addLog('error', 'Failed to send initial message to the server.');
      toast({
        title: 'Initialization Error',
        description: 'Failed to send initial message to the server.',
        variant: 'destructive',
      });
    }
  }

  function handleIncomingMessage(message: any) {
    try {
      if (message.type === 'response.text.delta') {
        setConversation(prev => [...prev, message.delta]);
        speakText(message.delta);
        addLog('ai', `Received message: ${message.delta}`);
      } else if (message.type === 'response.done') {
        addLog('system', 'AI response complete.');
        toast({
          title: 'Response Complete',
          description: 'The AI has finished its response.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
      addLog('error', 'An error occurred while processing the incoming message.');
      toast({
        title: 'Message Error',
        description: 'An error occurred while processing the incoming message.',
        variant: 'destructive',
      });
    }
  }

  function handleWebSocketError(error: Event) {
    console.error('WebSocket error:', error);
    addLog('error', 'WebSocket connection error.');
    toast({
      title: 'Connection Error',
      description: 'An error occurred with the WebSocket connection.',
      variant: 'destructive',
    });
  }

  function handleWebSocketClose() {
    addLog('system', 'WebSocket connection closed.');
    toast({
      title: 'Connection Closed',
      description: 'WebSocket connection closed. The application will attempt to reconnect.',
      variant: 'destructive',
    });
  }

  const onSubmit = handleSubmit(({ message }) => {
    try {
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
      addLog('user', `Sent message: ${message}`);
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      addLog('error', 'Failed to send message.');
      toast({
        title: 'Send Error',
        description: 'Failed to send your message. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const startListening = () => {
    if (!isListening) {
      setIsListening(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({
          title: 'Speech Recognition Unavailable',
          description: 'Your browser does not support speech recognition.',
          variant: 'destructive',
        });
        setIsListening(false);
        return;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setConversation(prev => [...prev, `User: ${transcript}`]);
        sendMessage(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: transcript }]
          }
        }));
        sendMessage(JSON.stringify({ type: 'response.create' }));
        toast({
          title: 'Speech Recognized',
          description: 'Your speech has been converted to text and sent.',
          variant: 'default',
        });
      };
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: 'Speech Recognition Error',
          description: `An error occurred: ${event.error}`,
          variant: 'destructive',
        });
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.start();
    } else {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const speakText = (text: string) => {
    if (!isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      synth.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  const interruptAI = () => {
    interruptResponse();
    stopSpeaking();
    toast({
      title: 'AI Interrupted',
      description: 'The AI response has been interrupted.',
      variant: 'default',
    });
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
          <ConversationView conversation={conversation} />
          <MessageInput
            onSubmit={onSubmit}
            register={register}
            startListening={startListening}
            interruptAI={interruptAI}
            isListening={isListening}
            connectionStatus={connectionStatus}
          />
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
          <LogViewer logs={logs} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AdaptiveUIGenerator;