import React from 'react';

interface ConversationViewProps {
  conversation: string[];
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation }) => {
  return (
    <div className="h-[60vh] overflow-y-auto mb-4 p-4 bg-gray-100 rounded-md">
      {conversation.map((msg, index) => (
        <div key={index} className="mb-2">{msg}</div>
      ))}
    </div>
  );
};

export default ConversationView;