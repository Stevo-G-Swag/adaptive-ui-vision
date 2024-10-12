import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  register: UseFormRegister<{ message: string }>;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSubmit,
  register
}) => {
  return (
    <form onSubmit={onSubmit} className="flex space-x-2">
      <Input {...register('message')} placeholder="Type your message..." className="flex-grow" />
      <Button type="submit">Send</Button>
    </form>
  );
};

export default MessageInput;