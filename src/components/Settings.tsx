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

const Settings: React.FC<SettingsProps> = ({
  systemMessage, setSystemMessage, voice, setVoice, serverTurnDetection, setServerTurnDetection,
  threshold, setThreshold, prefixPadding, setPrefixPadding, silenceDuration, setSilenceDuration,
  temperature, setTemperature, maxTokens, setMaxTokens
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="systemMessage">System Instructions</Label>
        <Textarea
          id="systemMessage"
          value={systemMessage}
          onChange={(e) => setSystemMessage(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="voice">Voice</Label>
        <Select value={voice} onValueChange={setVoice}>
          <SelectTrigger id="voice">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alloy">Alloy</SelectItem>
            <SelectItem value="Echo">Echo</SelectItem>
            <SelectItem value="Shimmer">Shimmer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="serverTurnDetection">Server turn detection</Label>
        <div className="flex space-x-2 mt-1">
          <Button
            variant={serverTurnDetection === "Voice activity" ? "default" : "outline"}
            onClick={() => setServerTurnDetection("Voice activity")}
          >
            Voice activity
          </Button>
          <Button
            variant={serverTurnDetection === "Disabled" ? "default" : "outline"}
            onClick={() => setServerTurnDetection("Disabled")}
          >
            Disabled
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="threshold">Threshold</Label>
        <Slider
          id="threshold"
          min={0}
          max={1}
          step={0.01}
          value={[threshold]}
          onValueChange={([value]) => setThreshold(value)}
        />
      </div>
      <div>
        <Label htmlFor="prefixPadding">Prefix padding</Label>
        <Slider
          id="prefixPadding"
          min={0}
          max={1000}
          step={10}
          value={[prefixPadding]}
          onValueChange={([value]) => setPrefixPadding(value)}
        />
      </div>
      <div>
        <Label htmlFor="silenceDuration">Silence duration</Label>
        <Slider
          id="silenceDuration"
          min={0}
          max={2000}
          step={10}
          value={[silenceDuration]}
          onValueChange={([value]) => setSilenceDuration(value)}
        />
      </div>
      <div>
        <Label htmlFor="temperature">Temperature</Label>
        <Slider
          id="temperature"
          min={0}
          max={2}
          step={0.01}
          value={[temperature]}
          onValueChange={([value]) => setTemperature(value)}
        />
      </div>
      <div>
        <Label htmlFor="maxTokens">Max tokens</Label>
        <Slider
          id="maxTokens"
          min={1}
          max={8192}
          step={1}
          value={[maxTokens]}
          onValueChange={([value]) => setMaxTokens(value)}
        />
      </div>
    </div>
  );
};

export default Settings;