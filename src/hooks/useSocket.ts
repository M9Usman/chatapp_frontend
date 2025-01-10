import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(userId: number | undefined) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (userId) {
      const newSocket = io('http://localhost:4000', {
        query: { userId: userId.toString() },
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [userId]);

  return socket;
}

