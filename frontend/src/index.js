// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';

// Importaciones de Contexto
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext'; // <-- 1. IMPORTAMOS EL NUEVO PROVEEDOR

// Importaciones de Estilos
import './index.css';
import 'leaflet/dist/leaflet.css';

// Importación del Componente Principal
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* AuthProvider envuelve a todo para que la app sepa si hay un usuario */}
    <AuthProvider>
      {/* SocketProvider va dentro para que pueda usar la información de AuthProvider */}
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);