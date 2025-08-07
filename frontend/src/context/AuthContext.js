// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axiosConfig'; // <-- CAMBIO 1: Importamos nuestra instancia configurada

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        // La cabecera de axios ahora se establece automáticamente por el interceptor
        // axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  const loginAction = (userData, sessionData) => {
    setUser(userData);
    setToken(sessionData.access_token);
    localStorage.setItem('authToken', sessionData.access_token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    // La cabecera de axios ahora se establece automáticamente por el interceptor
    // axios.defaults.headers.common['Authorization'] = `Bearer ${sessionData.access_token}`;
  };

  const logoutAction = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // La cabecera se eliminará de las futuras peticiones porque el token ya no está en localStorage
    // delete axios.defaults.headers.common['Authorization'];
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