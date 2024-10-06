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
    ws.current = new WebSocket(WS_URL, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    ws.current.onopen = () => {
      console.log("Connected to server.");
      ws.current?.send(JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["text"],
          instructions: "Please assist the user with UI generation.",
        }
      }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data.toString());
      console.log(message);
      // Handle incoming messages here
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const startListening = () => {
    setIsListening(true);
    // Implement speech recognition here (unchanged)
    // For example, using the Web Speech API
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRequirements([...requirements, { text: transcript }]);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const generateUI = useMutation({
    mutationFn: async (reqs: string[]) => {
      if (!ws.current) throw new Error('WebSocket not connected');
      
      ws.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{
            type: 'input_text',
            text: `Generate UI components for these requirements: ${reqs.join(', ')}`
          }]
        }
      }));

      // For demonstration, we'll return a placeholder response
      return "Generated UI placeholder";
    },
    onSuccess: (data) => {
      setGeneratedUI(data);
      toast({ title: 'UI Generated Successfully', description: 'New UI components have been created based on your requirements.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to generate UI components. Please try again.', variant: 'destructive' });
    },
  });

  const onSubmit = handleSubmit(({ requirement }) => {
    setRequirements([...requirements, requirement]);
    reset();
  });

  const handleGenerateUI = () => {
    generateUI.mutate(requirements);
  };

  const handleFeedback = (isPositive: boolean) => {
    if (!ws.current) return;
    
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

        <Button onClick={handleGenerateUI} className="mt-4" disabled={generateUI.isPending}>
          Generate UI
        </Button>

        {generatedUI && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Generated UI:</h3>
            <div className="p-4 border rounded">
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
