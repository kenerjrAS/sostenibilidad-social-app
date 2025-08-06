// src/context/SocketContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext'; // Usaremos el AuthContext para saber si estamos logueados

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth(); // Obtenemos el estado de autenticación

  useEffect(() => {
    let newSocket;

    // Solo nos conectamos al socket si el usuario está autenticado
    if (isAuthenticated) {
      // Creamos la conexión al servidor de backend
      newSocket = io('http://localhost:5000');
      setSocket(newSocket);
      console.log('🔌 Socket.IO: Conectado al servidor.');
    }

    // Función de limpieza: se ejecuta cuando el componente se desmonta o el usuario hace logout
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        console.log('🔌 Socket.IO: Desconectado del servidor.');
      }
    };
  }, [isAuthenticated]); // Este efecto se volverá a ejecutar cada vez que cambie 'isAuthenticated'

  const value = {
    socket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};