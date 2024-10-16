import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import ConversationView from './ConversationView';
import MessageInput from './MessageInput';

interface ConversationTabProps {
  conversation: string[];
  setConversation: React.Dispatch<React.SetStateAction<string[]>>;
  sendMessage: (message: string) => void;
  addLog: (type: string, message: string) => void;
}

const ConversationTab: React.FC<ConversationTabProps> = ({
  conversation,
  setConversation,
  sendMessage,
  addLog
}) => {
  const { register, handleSubmit, reset } = useForm<{ message: string }>();

  const onSubmit = handleSubmit(({ message }) => {
    try {
      sendMessage(message);
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

  return (
    <>
      <ConversationView conversation={conversation} />
      <MessageInput
        onSubmit={onSubmit}
        register={register}
      />
    </>
  );
};

export default ConversationTab;