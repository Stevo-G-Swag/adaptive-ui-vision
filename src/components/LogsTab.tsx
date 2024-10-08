import React from 'react';
import LogViewer, { LogEntry } from './LogViewer';

interface LogsTabProps {
  logs: LogEntry[];
}

const LogsTab: React.FC<LogsTabProps> = ({ logs }) => {
  return <LogViewer logs={logs} />;
};

export default LogsTab;