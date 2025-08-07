// src/context/AuthContext.js

// Ya no necesitamos 'axios' aquí
import React, { createContext, useState, useContext, useEffect } from 'react';

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
  };

  const logoutAction = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
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