import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle } from 'lucide-react';

interface MessageInputProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  register: UseFormRegister<{ message: string }>;
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSubmit,
  register,
  startListening,
  stopListening,
  isListening
}) => {
  return (
    <form onSubmit={onSubmit} className="flex space-x-2">
      <Input {...register('message')} placeholder="Type your message..." className="flex-grow" />
      <Button type="submit">Send</Button>
      <Button type="button" onClick={isListening ? stopListening : startListening} variant="outline">
        {isListening ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button>
    </form>
  );
};

export default MessageInput;