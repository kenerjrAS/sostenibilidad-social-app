// src/context/SocketContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let newSocket;

    if (isAuthenticated) {
      // --- CAMBIO REALIZADO AQUÍ ---
      // Obtenemos la URL base de la API de nuestras variables de entorno.
      // Le quitamos el '/api' al final, ya que socket.io se conecta a la raíz del servidor.
      const socketUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

      // Creamos la conexión a la URL correcta (sea de producción o local)
      newSocket = io(socketUrl);
      setSocket(newSocket);
      console.log(`🔌 Socket.IO: Conectado al servidor en ${socketUrl}`);
      // ----------------------------
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
        console.log('🔌 Socket.IO: Desconectado del servidor.');
      }
    };
  }, [isAuthenticated]);

  const value = {
    socket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};