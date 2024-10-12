import React from 'react';
import TextAreaSetting from './settings/TextAreaSetting';
import SelectSetting from './settings/SelectSetting';
import ButtonGroupSetting from './settings/ButtonGroupSetting';
import SliderSetting from './settings/SliderSetting';

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

export default Settings;