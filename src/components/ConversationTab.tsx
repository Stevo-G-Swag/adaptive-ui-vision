import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import ConversationView from './ConversationView';
import MessageInput from './MessageInput';
import DynamicUIElement from './DynamicUIElement';

interface ConversationTabProps {
  conversation: string[];
  setConversation: React.Dispatch<React.SetStateAction<string[]>>;
  sendMessage: (message: string) => void;
  connectionStatus: string;
  interruptResponse: () => void;
  addLog: (type: string, message: string) => void;
}

const ConversationTab: React.FC<ConversationTabProps> = ({
  conversation,
  setConversation,
  sendMessage,
  connectionStatus,
  interruptResponse,
  addLog
}) => {
  const { register, handleSubmit, reset } = useForm<{ message: string }>();
  const [isListening, setIsListening] = useState(false);
  const [dynamicElements, setDynamicElements] = useState<Array<{ type: string; props: any }>>([]);

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: 'Speech Recognition Unavailable',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive',
      });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => {
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
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast({
        title: 'Speech Recognition Error',
        description: `An error occurred: ${event.error}`,
        variant: 'destructive',
      });
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  const handleDynamicUIUpdate = (update: { type: string; props: any }) => {
    setDynamicElements(prev => [...prev, update]);
  };

  const handleDynamicUIInteraction = (data: any) => {
    sendMessage(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'ui_interaction', data }]
      }
    }));
    sendMessage(JSON.stringify({ type: 'response.create' }));
  };

  return (
    <>
      <ConversationView conversation={conversation} />
      <div className="my-4 space-y-2">
        {dynamicElements.map((element, index) => (
          <DynamicUIElement
            key={index}
            type={element.type}
            props={element.props}
            onInteraction={handleDynamicUIInteraction}
          />
        ))}
      </div>
      <MessageInput
        onSubmit={onSubmit}
        register={register}
        startListening={startListening}
        interruptAI={interruptResponse}
        isListening={isListening}
        connectionStatus={connectionStatus}
      />
    </>
  );
};

export default ConversationTab;