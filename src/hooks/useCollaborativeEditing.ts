import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface CollaborativeEditingProps {
  projectId: string;
  userId: string;
}

export const useCollaborativeEditing = ({ projectId, userId }: CollaborativeEditingProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [collaborators, setCollaborators] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      query: { projectId, userId },
    });

    setSocket(newSocket);

    newSocket.on('collaborators_update', (updatedCollaborators: string[]) => {
      setCollaborators(updatedCollaborators);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [projectId, userId]);

  const sendEdit = (edit: any) => {
    if (socket) {
      socket.emit('edit', edit);
    }
  };

  return { collaborators, sendEdit };
};