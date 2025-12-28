import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext'; 


const SOCKET_URL = 'http://localhost:8000'; 


const useSocket = () => {
  const socketRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    
    if (isAuthenticated && !socketRef.current) {
      const token = localStorage.getItem('token'); 

      if (!token) return;

      const socket = io(SOCKET_URL, {
        
        auth: {
          token: token,
        },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log("WebSocket connected!");
      });

      socket.on('connect_error', (err) => {
        console.error("WebSocket connection error:", err.message);
      });

      socketRef.current = socket;
    }

    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("WebSocket disconnected.");
      }
    };
  }, [isAuthenticated]);

  return socketRef.current;
};

export default useSocket;