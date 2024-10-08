import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface LogEntry {
  timestamp: string;
  type: 'user' | 'ai' | 'system' | 'error';
  message: string;
}

interface LogViewerProps {
  logs: LogEntry[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  return (
    <ScrollArea className="h-[60vh] w-full border rounded-md">
      <div className="p-4">
        {logs.map((log, index) => (
          <div key={index} className="mb-2 text-sm">
            <span className="text-gray-500">[{log.timestamp}]</span>{' '}
            <span className={`font-semibold ${getTypeColor(log.type)}`}>
              {log.type.toUpperCase()}:
            </span>{' '}
            {log.message}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

function getTypeColor(type: LogEntry['type']): string {
  switch (type) {
    case 'user':
      return 'text-blue-600';
    case 'ai':
      return 'text-green-600';
    case 'system':
      return 'text-purple-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

export default LogViewer;