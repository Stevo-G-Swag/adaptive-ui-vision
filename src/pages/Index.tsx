import React from 'react';
import AdaptiveUIGenerator from '@/components/AdaptiveUIGenerator';
import { Button } from '@/components/ui/button';

interface IndexProps {
  onLogout: () => void;
}

const Index: React.FC<IndexProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex justify-end mb-4">
        <Button onClick={onLogout}>Logout</Button>
      </div>
      <AdaptiveUIGenerator />
    </div>
  );
};

export default Index;