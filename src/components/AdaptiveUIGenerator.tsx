import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mic, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const WS_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";

const AdaptiveUIGenerator: React.FC = () => {
  const [requirements, setRequirements] = useState<string[]>([]);
  const [generatedUI, setGeneratedUI] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ requirement: string }>();
  const { toast } = useToast();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("Connected to server.");
      sendInitialMessage();
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data.toString());
      handleIncomingMessage(message);
    };

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
          instructions: "You are an AI assistant that generates UI components based on user requirements. Provide detailed descriptions of UI elements.",
        }
      }));
    }
  };

  const handleIncomingMessage = (message: any) => {
    if (message.type === 'response.text.delta') {
      setGeneratedUI(prev => prev + message.delta);
    } else if (message.type === 'response.done') {
      toast({ title: 'UI Generation Complete', description: 'The UI components have been generated based on your requirements.' });
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
        setRequirements(prevRequirements => {
          const updatedRequirements = [...prevRequirements];
          updatedRequirements[updatedRequirements.length - 1] = transcript;
          return updatedRequirements;
        });
        generateUIRealtime(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      console.error('Speech recognition not supported');
      setIsListening(false);
    }
  };

  const generateUIRealtime = (requirement: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    ws.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: `Generate UI components for this requirement: ${requirement}`
        }]
      }
    }));

    ws.current.send(JSON.stringify({ type: 'response.create' }));
  };

  const onSubmit = handleSubmit(({ requirement }) => {
    setRequirements(prevRequirements => [...prevRequirements, requirement]);
    generateUIRealtime(requirement);
    reset();
  });

  const handleGenerateUI = () => {
    const allRequirements = requirements.join(', ');
    generateUIRealtime(allRequirements);
  };

  const handleFeedback = (isPositive: boolean) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    ws.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: `Feedback for UI: ${isPositive ? 'Positive' : 'Negative'}` }]
      }
    }));
    toast({ title: 'Feedback Sent', description: 'Thank you for your feedback!' });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Adaptive UI Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Textarea
            {...register('requirement')}
            placeholder="Enter your UI requirements..."
            className="w-full"
          />
          <div className="flex justify-between">
            <Button type="submit">Add Requirement</Button>
            <Button type="button" onClick={startListening} disabled={isListening}>
              {isListening ? 'Listening...' : <Mic className="mr-2" />}
              Voice Input
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Requirements:</h3>
          <ul className="list-disc pl-5">
            {requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        <Button onClick={handleGenerateUI} className="mt-4">
          Generate UI
        </Button>

        {generatedUI && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Generated UI:</h3>
            <div className="p-4 border rounded whitespace-pre-wrap">
              {generatedUI}
            </div>
            <div className="flex justify-end mt-2">
              <Button onClick={() => handleFeedback(true)} variant="outline" size="sm" className="mr-2">
                <ThumbsUp className="mr-1" /> Like
              </Button>
              <Button onClick={() => handleFeedback(false)} variant="outline" size="sm">
                <ThumbsDown className="mr-1" /> Dislike
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdaptiveUIGenerator;