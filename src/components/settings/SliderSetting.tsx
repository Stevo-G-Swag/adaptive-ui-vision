import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SliderSettingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

const SliderSetting: React.FC<SliderSettingProps> = ({ label, value, onChange, min, max, step }) => (
  <div>
    <Label htmlFor={label}>{label}</Label>
    <Slider
      id={label}
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={([newValue]) => onChange(newValue)}
    />
  </div>
);

export default SliderSetting;