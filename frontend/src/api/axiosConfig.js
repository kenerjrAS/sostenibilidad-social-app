// src/api/axiosConfig.js
import axios from 'axios';

// Creamos una instancia de axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // La URL base de nuestra API
});

// Añadimos un interceptor a la instancia
// Este código se ejecutará ANTES de cada petición
api.interceptors.request.use(
  (config) => {
    // Obtenemos el token del localStorage en cada petición
    const token = localStorage.getItem('authToken');
    if (token) {
      // Si el token existe, lo añadimos a las cabeceras
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Manejamos errores principal en la configuración de la petición
    return Promise.reject(error);
  }
);

export default api;