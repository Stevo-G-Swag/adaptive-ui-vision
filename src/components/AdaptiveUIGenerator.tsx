import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, FileText, FolderOpen, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConversationTab from './ConversationTab';
import SettingsTab from './SettingsTab';
import LogsTab from './LogsTab';
import FileExplorer from './FileExplorer';
import LanguageSelector from './LanguageSelector';
import ModelSelector from './ModelSelector';
import { useRealtimeAPI } from '../hooks/useRealtimeAPI';
import { LogEntry } from './LogViewer';

const AdaptiveUIGenerator: React.FC = () => {
  const [conversation, setConversation] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState({
    systemMessage: "You are an AI assistant capable of generating and modifying UI elements.",
    voice: "alloy",
    serverTurnDetection: "Voice activity",
    threshold: 0.5,
    prefixPadding: 300,
    silenceDuration: 500,
    temperature: 0.8,
    maxTokens: 4096
  });
  const [language, setLanguage] = useState('en');
  const [model, setModel] = useState('gpt-4');
  const [apiKey, setApiKey] = useState(localStorage.getItem('bricks_api_key') || '');

  const { isConnected, isRecording, sendMessage, toggleRecording, interruptResponse, client } = useRealtimeAPI(apiKey);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('bricks_api_key', apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    if (client) {
      client.on('conversation.updated', ({ item, delta }) => {
        if (item.type === 'message' && item.role === 'assistant') {
          setConversation(prev => [...prev, `Assistant: ${item.content[0].text}`]);
        }
      });
    }
  }, [client]);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prevLogs => {
      const newLog: LogEntry = {
        timestamp: new Date().toISOString(),
        type,
        message,
      };
      return [...prevLogs.slice(-99), newLog];
    });
  };

  const handleSendMessage = (message: string) => {
    setConversation(prev => [...prev, `User: ${message}`]);
    sendMessage(message);
    addLog('user', `Sent message: ${message}`);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="conversation" className="w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Adaptive UI Generator</h1>
          <div className="flex space-x-2">
            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
            <ModelSelector currentModel={model} onModelChange={setModel} />
          </div>
          <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="settings"><SettingsIcon className="w-4 h-4 mr-2" />Settings</TabsTrigger>
            <TabsTrigger value="logs"><FileText className="w-4 h-4 mr-2" />Logs</TabsTrigger>
            <TabsTrigger value="files"><FolderOpen className="w-4 h-4 mr-2" />Files</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="conversation" className="p-4">
          <ConversationTab
            conversation={conversation}
            setConversation={setConversation}
            sendMessage={handleSendMessage}
            addLog={addLog}
          />
          <div className="mt-4 flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter your BricksLLM API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={toggleRecording}>
              {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {isRecording ? 'Stop' : 'Start'} Recording
            </Button>
            <Button onClick={interruptResponse}>Interrupt</Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="p-4">
          <SettingsTab settings={settings} setSettings={setSettings} />
        </TabsContent>

        <TabsContent value="logs" className="p-4">
          <LogsTab logs={logs} />
        </TabsContent>

        <TabsContent value="files" className="p-4">
          <FileExplorer />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AdaptiveUIGenerator;