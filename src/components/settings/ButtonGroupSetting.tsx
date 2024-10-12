import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ButtonGroupSettingProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

const ButtonGroupSetting: React.FC<ButtonGroupSettingProps> = ({ label, value, onChange, options }) => (
  <div>
    <Label htmlFor={label}>{label}</Label>
    <div className="flex space-x-2 mt-1">
      {options.map((option) => (
        <Button
          key={option}
          variant={value === option ? "default" : "outline"}
          onClick={() => onChange(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  </div>
);

export default ButtonGroupSetting;