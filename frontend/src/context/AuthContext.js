// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // El estado 'loading' sigue siendo útil para evitar parpadeos
  const [loading, setLoading] = useState(true);

  // --- useEffect SIMPLIFICADO ---
  useEffect(() => {
    // Esta función se ejecutará solo una vez al cargar la app
    const loadUserFromStorage = () => {
      // Buscamos el token y los datos del usuario en localStorage
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        // Si encontramos ambos, los cargamos en nuestro estado
        setUser(JSON.parse(storedUser)); // El usuario se guarda como texto, lo convertimos de vuelta a objeto
        setToken(storedToken);
        
        // Configuramos axios para que use este token en futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      
      // Terminamos de cargar, independientemente de si encontramos algo o no
      setLoading(false);
    };

    loadUserFromStorage();
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  // --- FUNCIONES DE LOGIN Y LOGOUT MODIFICADAS ---
  const loginAction = (userData, sessionData) => {
    setUser(userData);
    setToken(sessionData.access_token);
    
    // Guardamos AMBOS, el token y los datos del usuario
    localStorage.setItem('authToken', sessionData.access_token);
    localStorage.setItem('authUser', JSON.stringify(userData)); // Convertimos el objeto de usuario a texto para guardarlo
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${sessionData.access_token}`;
  };

  const logoutAction = () => {
    setUser(null);
    setToken(null);
    
    // Limpiamos AMBOS del localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login: loginAction,
    logout: logoutAction,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};