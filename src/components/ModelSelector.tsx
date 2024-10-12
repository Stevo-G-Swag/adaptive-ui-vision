import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ currentModel, onModelChange }) => {
  return (
    <Select value={currentModel} onValueChange={onModelChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select AI model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
        <SelectItem value="gpt-4">GPT-4</SelectItem>
        <SelectItem value="claude-v1">Claude v1</SelectItem>
        <SelectItem value="claude-instant-v1">Claude Instant v1</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ModelSelector;