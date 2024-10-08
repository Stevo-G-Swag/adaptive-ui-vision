import React from 'react';
import Settings from './Settings';

interface SettingsTabProps {
  settings: {
    systemMessage: string;
    voice: string;
    serverTurnDetection: string;
    threshold: number;
    prefixPadding: number;
    silenceDuration: number;
    temperature: number;
    maxTokens: number;
  };
  setSettings: React.Dispatch<React.SetStateAction<{
    systemMessage: string;
    voice: string;
    serverTurnDetection: string;
    threshold: number;
    prefixPadding: number;
    silenceDuration: number;
    temperature: number;
    maxTokens: number;
  }>>;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ settings, setSettings }) => {
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Settings
      systemMessage={settings.systemMessage}
      setSystemMessage={(value) => updateSetting('systemMessage', value)}
      voice={settings.voice}
      setVoice={(value) => updateSetting('voice', value)}
      serverTurnDetection={settings.serverTurnDetection}
      setServerTurnDetection={(value) => updateSetting('serverTurnDetection', value)}
      threshold={settings.threshold}
      setThreshold={(value) => updateSetting('threshold', value)}
      prefixPadding={settings.prefixPadding}
      setPrefixPadding={(value) => updateSetting('prefixPadding', value)}
      silenceDuration={settings.silenceDuration}
      setSilenceDuration={(value) => updateSetting('silenceDuration', value)}
      temperature={settings.temperature}
      setTemperature={(value) => updateSetting('temperature', value)}
      maxTokens={settings.maxTokens}
      setMaxTokens={(value) => updateSetting('maxTokens', value)}
    />
  );
};

export default SettingsTab;