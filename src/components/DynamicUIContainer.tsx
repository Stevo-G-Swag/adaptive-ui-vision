import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DynamicUIContainerProps {
  elements: Array<{ type: string; props: any }>;
}

const DynamicUIContainer: React.FC<DynamicUIContainerProps> = ({ elements }) => {
  const renderElement = (element: { type: string; props: any }, index: number) => {
    switch (element.type) {
      case 'button':
        return <Button key={index} {...element.props}>{element.props.text}</Button>;
      case 'input':
        return <Input key={index} {...element.props} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-4 space-y-2">
      {elements.map((element, index) => renderElement(element, index))}
    </div>
  );
};

export default DynamicUIContainer;