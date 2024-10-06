import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Settings, FileText } from 'lucide-react';

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
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log("Connected to server.");
        sendInitialMessage();
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data.toString());
        handleIncomingMessage(message);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({ title: 'Connection Error', description: 'Failed to connect to the server. Please try again.', variant: 'destructive' });
      };

      ws.current.onclose = () => {
        console.log("WebSocket connection closed. Attempting to reconnect...");
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendInitialMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["text"],
          instructions: systemMessage,
        }
      }));
    }
  };

  const handleIncomingMessage = (message: any) => {
    if (message.type === 'response.text.delta') {
      setConversation(prev => [...prev, message.delta]);
    } else if (message.type === 'response.done') {
      toast({ title: 'Response Complete', description: 'The AI has finished its response.' });
    }
  };

  const startListening = () => {
    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setConversation(prev => [...prev, `User: ${transcript}`]);
        sendMessage(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      console.error('Speech recognition not supported');
      setIsListening(false);
    }
  };

  const sendMessage = (message: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      toast({ title: 'Connection Error', description: 'Not connected to the server. Please try again.', variant: 'destructive' });
      return;
    }
    
    try {
      ws.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: message }]
        }
      }));

      ws.current.send(JSON.stringify({ type: 'response.create' }));
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Send Error', description: 'Failed to send message. Please try again.', variant: 'destructive' });
    }
  };

  const onSubmit = handleSubmit(({ message }) => {
    setConversation(prev => [...prev, `User: ${message}`]);
    sendMessage(message);
    reset();
  });

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="conversation" className="w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Realtime</h1>
          <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
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
            <Button type="submit">Send</Button>
            <Button type="button" onClick={startListening} variant="outline">
              <Mic className={`w-4 h-4 ${isListening ? 'text-red-500' : ''}`} />
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="settings" className="p-4 space-y-4">
          <div>
            <Label htmlFor="systemMessage">System Instructions</Label>
            <Textarea
              id="systemMessage"
              value={systemMessage}
              onChange={(e) => setSystemMessage(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="voice">Voice</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger id="voice">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alloy">Alloy</SelectItem>
                <SelectItem value="Echo">Echo</SelectItem>
                <SelectItem value="Shimmer">Shimmer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="serverTurnDetection">Server turn detection</Label>
            <div className="flex space-x-2 mt-1">
              <Button
                variant={serverTurnDetection === "Voice activity" ? "default" : "outline"}
                onClick={() => setServerTurnDetection("Voice activity")}
              >
                Voice activity
              </Button>
              <Button
                variant={serverTurnDetection === "Disabled" ? "default" : "outline"}
                onClick={() => setServerTurnDetection("Disabled")}
              >
                Disabled
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="threshold">Threshold</Label>
            <Slider
              id="threshold"
              min={0}
              max={1}
              step={0.01}
              value={[threshold]}
              onValueChange={([value]) => setThreshold(value)}
            />
          </div>
          <div>
            <Label htmlFor="prefixPadding">Prefix padding</Label>
            <Slider
              id="prefixPadding"
              min={0}
              max={1000}
              step={10}
              value={[prefixPadding]}
              onValueChange={([value]) => setPrefixPadding(value)}
            />
          </div>
          <div>
            <Label htmlFor="silenceDuration">Silence duration</Label>
            <Slider
              id="silenceDuration"
              min={0}
              max={2000}
              step={10}
              value={[silenceDuration]}
              onValueChange={([value]) => setSilenceDuration(value)}
            />
          </div>
          <div>
            <Label htmlFor="temperature">Temperature</Label>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.01}
              value={[temperature]}
              onValueChange={([value]) => setTemperature(value)}
            />
          </div>
          <div>
            <Label htmlFor="maxTokens">Max tokens</Label>
            <Slider
              id="maxTokens"
              min={1}
              max={8192}
              step={1}
              value={[maxTokens]}
              onValueChange={([value]) => setMaxTokens(value)}
            />
          </div>
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