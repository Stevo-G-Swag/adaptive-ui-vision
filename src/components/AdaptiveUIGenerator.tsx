import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, FileText } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import ConversationTab from './ConversationTab';
import SettingsTab from './SettingsTab';
import LogsTab from './LogsTab';
import { LogEntry } from './LogViewer';

const API_KEY = 'sk-bks-54d86fb254ccaaba45930425c80fac6f841d0741ec449972';
const WS_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";

const AdaptiveUIGenerator: React.FC = () => {
  const [conversation, setConversation] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState({
    systemMessage: "Assist a real-time software developer in interacting with a full-stack agentic framework including creating and editing files using a cache API.",
    voice: "Alloy",
    serverTurnDetection: "Voice activity",
    threshold: 0.5,
    prefixPadding: 300,
    silenceDuration: 500,
    temperature: 0.8,
    maxTokens: 4096
  });

  const { sendMessage, connectionStatus, interruptResponse } = useWebSocket(WS_URL, {
    onOpen: sendInitialMessage,
    onMessage: handleIncomingMessage,
    onError: handleWebSocketError,
    onClose: handleWebSocketClose,
  });

  useEffect(() => {
    if (connectionStatus === 'connected') {
      addLog('system', 'Connected to the server.');
    }
  }, [connectionStatus]);

  function addLog(type: LogEntry['type'], message: string) {
    setLogs(prevLogs => {
      const newLog: LogEntry = {
        timestamp: new Date().toISOString(),
        type,
        message,
      };
      return [...prevLogs.slice(-99), newLog];
    });
  }

  function sendInitialMessage() {
    try {
      sendMessage(JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["text"],
          instructions: settings.systemMessage,
        }
      }));
      addLog('system', 'Sent initial message to the server.');
    } catch (error) {
      console.error('Error sending initial message:', error);
      addLog('error', 'Failed to send initial message to the server.');
    }
  }

  function handleIncomingMessage(message: any) {
    try {
      if (message.type === 'response.text.delta') {
        setConversation(prev => [...prev, message.delta]);
        if (Math.random() < 0.1) {
          addLog('ai', `Received message: ${message.delta}`);
        }
      } else if (message.type === 'response.done') {
        addLog('system', 'AI response complete.');
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
      addLog('error', 'An error occurred while processing the incoming message.');
    }
  }

  function handleWebSocketError(error: Event) {
    console.error('WebSocket error:', error);
    addLog('error', 'WebSocket connection error.');
  }

  function handleWebSocketClose() {
    addLog('system', 'WebSocket connection closed.');
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="conversation" className="w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Realtime</h1>
          <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="settings"><SettingsIcon className="w-4 h-4 mr-2" />Settings</TabsTrigger>
            <TabsTrigger value="logs"><FileText className="w-4 h-4 mr-2" />Logs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="conversation" className="p-4">
          <ConversationTab
            conversation={conversation}
            setConversation={setConversation}
            sendMessage={sendMessage}
            connectionStatus={connectionStatus}
            interruptResponse={interruptResponse}
            addLog={addLog}
          />
        </TabsContent>

        <TabsContent value="settings" className="p-4">
          <SettingsTab settings={settings} setSettings={setSettings} />
        </TabsContent>

        <TabsContent value="logs" className="p-4">
          <LogsTab logs={logs} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AdaptiveUIGenerator;