import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface SettingsProps {
  systemMessage: string;
  setSystemMessage: (value: string) => void;
  voice: string;
  setVoice: (value: string) => void;
  serverTurnDetection: string;
  setServerTurnDetection: (value: string) => void;
  threshold: number;
  setThreshold: (value: number) => void;
  prefixPadding: number;
  setPrefixPadding: (value: number) => void;
  silenceDuration: number;
  setSilenceDuration: (value: number) => void;
  temperature: number;
  setTemperature: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
}

const Settings: React.FC<SettingsProps> = (props) => {
  return (
    <div className="space-y-4">
      <TextAreaSetting
        label="System Instructions"
        value={props.systemMessage}
        onChange={props.setSystemMessage}
      />
      <SelectSetting
        label="Voice"
        value={props.voice}
        onChange={props.setVoice}
        options={['Alloy', 'Echo', 'Shimmer']}
      />
      <ButtonGroupSetting
        label="Server turn detection"
        value={props.serverTurnDetection}
        onChange={props.setServerTurnDetection}
        options={['Voice activity', 'Disabled']}
      />
      <SliderSetting
        label="Threshold"
        value={props.threshold}
        onChange={props.setThreshold}
        min={0}
        max={1}
        step={0.01}
      />
      <SliderSetting
        label="Prefix padding"
        value={props.prefixPadding}
        onChange={props.setPrefixPadding}
        min={0}
        max={1000}
        step={10}
      />
      <SliderSetting
        label="Silence duration"
        value={props.silenceDuration}
        onChange={props.setSilenceDuration}
        min={0}
        max={2000}
        step={10}
      />
      <SliderSetting
        label="Temperature"
        value={props.temperature}
        onChange={props.setTemperature}
        min={0}
        max={2}
        step={0.01}
      />
      <SliderSetting
        label="Max tokens"
        value={props.maxTokens}
        onChange={props.setMaxTokens}
        min={1}
        max={8192}
        step={1}
      />
    </div>
  );
};

const TextAreaSetting: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
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

const SelectSetting: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <Label htmlFor={label}>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={label}>
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const ButtonGroupSetting: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}> = ({ label, value, onChange, options }) => (
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

const SliderSetting: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}> = ({ label, value, onChange, min, max, step }) => (
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

export default Settings;