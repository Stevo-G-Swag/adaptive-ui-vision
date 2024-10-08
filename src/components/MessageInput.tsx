import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle } from 'lucide-react';

interface MessageInputProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  register: UseFormRegister<{ message: string }>;
  startListening: () => void;
  interruptAI: () => void;
  isListening: boolean;
  connectionStatus: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSubmit,
  register,
  startListening,
  interruptAI,
  isListening,
  connectionStatus
}) => {
  return (
    <form onSubmit={onSubmit} className="flex space-x-2">
      <Input {...register('message')} placeholder="Type your message..." className="flex-grow" />
      <Button type="submit" disabled={connectionStatus !== 'connected'}>Send</Button>
      <Button type="button" onClick={startListening} variant="outline" disabled={connectionStatus !== 'connected'}>
        <Mic className={`w-4 h-4 ${isListening ? 'text-red-500' : ''}`} />
      </Button>
      <Button type="button" onClick={interruptAI} variant="outline" disabled={connectionStatus !== 'connected'}>
        <StopCircle className="w-4 h-4" />
      </Button>
    </form>
  );
};

export default MessageInput;