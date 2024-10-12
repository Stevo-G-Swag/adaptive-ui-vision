import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TextAreaSettingProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TextAreaSetting: React.FC<TextAreaSettingProps> = ({ label, value, onChange }) => (
  <div>
    <Label htmlFor={label}>{label}</Label>
    <Textarea
      id={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1"
    />
  </div>
);

export default TextAreaSetting;