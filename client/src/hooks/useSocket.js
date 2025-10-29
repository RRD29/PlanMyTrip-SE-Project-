import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext'; // To get the JWT

// Use the same URL as the backend API
const SOCKET_URL = 'http://localhost:8000'; 

/**
 * A hook to manage the single WebSocket connection.
 * @returns {object} The socket instance.
 */
const useSocket = () => {
  const socketRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated and socket doesn't exist
    if (isAuthenticated && !socketRef.current) {
      const token = localStorage.getItem('token'); 

      if (!token) return;

      const socket = io(SOCKET_URL, {
        // Pass the JWT token for authentication on handshake
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

    // Cleanup function: disconnects the socket when the component unmounts
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