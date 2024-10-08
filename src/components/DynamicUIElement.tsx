import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DynamicUIElementProps {
  type: string;
  props: any;
  onInteraction: (data: any) => void;
}

const DynamicUIElement: React.FC<DynamicUIElementProps> = ({ type, props, onInteraction }) => {
  switch (type) {
    case 'button':
      return (
        <Button onClick={() => onInteraction({ type: 'button_click', ...props })}>
          {props.label}
        </Button>
      );
    case 'input':
      return (
        <Input
          type="text"
          placeholder={props.placeholder}
          onChange={(e) => onInteraction({ type: 'input_change', value: e.target.value, ...props })}
        />
      );
    default:
      return null;
  }
};

export default DynamicUIElement;