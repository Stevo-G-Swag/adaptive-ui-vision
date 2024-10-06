import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

const API_KEY = import.meta.env.VITE_BRICKLLM_API_KEY;
const API_URL = 'https://api.bricksllm.com/v1';
const WS_URL = 'wss://api.bricksllm.com/v1/realtime';

interface UIRequirement {
  text: string;
}

interface GeneratedUI {
  id: string;
  component: React.ReactNode;
}

const AdaptiveUIGenerator: React.FC = () => {
  const [requirements, setRequirements] = useState<UIRequirement[]>([]);
  const [generatedUIs, setGeneratedUIs] = useState<GeneratedUI[]>([]);
  const [activeVariant, setActiveVariant] = useState<'A' | 'B'>('A');
  const [isListening, setIsListening] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ requirement: string }>();
  const { toast } = useToast();
  const ws = useRef<WebSocket | null>(null);

  // WebSocket setup
  useEffect(() => {
    ws.current = new WebSocket(`${WS_URL}?model=gpt-4o-realtime-preview-2024-10-01`);
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["text"],
          instructions: "Please assist the user with UI generation.",
        }
      }));
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      // Handle real-time updates here
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const startListening = () => {
    setIsListening(true);
    // Implement speech recognition here
    // For example, using the Web Speech API
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRequirements([...requirements, { text: transcript }]);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // AI-generated UI components
  const generateUI = useMutation({
    mutationFn: async (reqs: UIRequirement[]) => {
      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "o1-preview",
          messages: [
            { role: "system", content: "You are an AI that generates UI components based on requirements." },
            { role: "user", content: `Generate UI components for these requirements: ${reqs.map(r => r.text).join(', ')}` }
          ],
        }),
      });
      if (!response.ok) throw new Error('Failed to generate UI');
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    },
    onSuccess: (data) => {
      setGeneratedUIs(data.components);
      toast({ title: 'UI Generated Successfully', description: 'New UI components have been created based on your requirements.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to generate UI components. Please try again.', variant: 'destructive' });
    },
  });

  // A/B test results
  const { data: abTestResults } = useQuery({
    queryKey: ['abTestResults'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/ab-test-results`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
      });
      if (!response.ok) throw new Error('Failed to fetch A/B test results');
      return await response.json();
    },
  });

  const onSubmit = handleSubmit(({ requirement }) => {
    setRequirements([...requirements, { text: requirement }]);
    reset();
  });

  const handleGenerateUI = () => {
    generateUI.mutate(requirements);
  };

  const handleFeedback = (id: string, isPositive: boolean) => {
    ws.current?.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: `Feedback for UI ${id}: ${isPositive ? 'Positive' : 'Negative'}` }]
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
              <li key={index}>{req.text}</li>
            ))}
          </ul>
        </div>

        <Button onClick={handleGenerateUI} className="mt-4" disabled={generateUI.isPending}>
          {generateUI.isPending ? <RefreshCw className="mr-2 animate-spin" /> : 'Generate UI'}
        </Button>

        {generatedUIs.length > 0 && (
          <Tabs value={activeVariant} onValueChange={(value) => setActiveVariant(value as 'A' | 'B')} className="mt-6">
            <TabsList>
              <TabsTrigger value="A">Variant A</TabsTrigger>
              <TabsTrigger value="B">Variant B</TabsTrigger>
            </TabsList>
            <TabsContent value="A">
              {generatedUIs[0].component}
              <div className="flex justify-end mt-2">
                <Button onClick={() => handleFeedback(generatedUIs[0].id, true)} variant="outline" size="sm" className="mr-2">
                  <ThumbsUp className="mr-1" /> Like
                </Button>
                <Button onClick={() => handleFeedback(generatedUIs[0].id, false)} variant="outline" size="sm">
                  <ThumbsDown className="mr-1" /> Dislike
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="B">
              {generatedUIs[1]?.component || <p>No variant B available</p>}
              {generatedUIs[1] && (
                <div className="flex justify-end mt-2">
                  <Button onClick={() => handleFeedback(generatedUIs[1].id, true)} variant="outline" size="sm" className="mr-2">
                    <ThumbsUp className="mr-1" /> Like
                  </Button>
                  <Button onClick={() => handleFeedback(generatedUIs[1].id, false)} variant="outline" size="sm">
                    <ThumbsDown className="mr-1" /> Dislike
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {abTestResults && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>A/B Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Display A/B test results here */}
              <p>Variant A: {abTestResults.variantA}% preference</p>
              <p>Variant B: {abTestResults.variantB}% preference</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default AdaptiveUIGenerator;
