// src/api/axiosConfig.js
import axios from 'axios';

// Creamos una instancia de axios que usará la variable de entorno
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Añadimos el interceptor para el token, que es una excelente práctica
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;