// src/pages/ChatLoaderPage.js
import React, { useEffect, useState } from 'react'; // <-- Añadimos useState
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

const ChatLoaderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(''); // <-- Estado para mostrar errores

  // Extraemos los datos del 'state' de la navegación
  const { otherUserId, itemId } = location.state || {};

  useEffect(() => {
    // --- CONSOLE.LOGS DE DEPURACIÓN ---
    console.log("Entrando en ChatLoaderPage");
    console.log("Datos recibidos del state:", { otherUserId, itemId });
    // ------------------------------------

    if (!otherUserId || !itemId) {
      console.error("Faltan datos (otherUserId o itemId) para iniciar el chat, redirigiendo al inicio.");
      navigate('/');
      return;
    }

    const initiateConversation = async () => {
      try {
        console.log("Enviando petición a /api/conversations...");
        const response = await axios.post('/conversations', { otherUserId, itemId });
        console.log("Respuesta recibida:", response.data);
        
        // Redirigimos al chat real, reemplazando esta página en el historial
        navigate(`/chat/${response.data.id}`, { replace: true });

      } catch (err) {
        console.error("Error al iniciar la conversación:", err);
        setError("No se pudo iniciar la conversación. Intenta de nuevo más tarde.");
        // Opcional: podrías redirigir de vuelta a la página del artículo después de un error
        // setTimeout(() => navigate(`/item/${itemId}`), 3000);
      }
    };

    initiateConversation();

  }, [otherUserId, itemId, navigate]);

  // Si hubo un error durante la petición, lo mostramos
  if (error) {
      return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
              <Alert severity="error">{error}</Alert>
          </Box>
      );
  }

  // Mientras se hace la petición, mostramos el indicador de carga.
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Iniciando conversación segura...</Typography>
    </Box>
  );
};

export default ChatLoaderPage;