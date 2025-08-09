// src/pages/ChatLoaderPage.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

const ChatLoaderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extraemos los datos que nos pasó la página anterior a través del 'state'
  const { otherUserId, itemId } = location.state || {};

  useEffect(() => {
    // Si por alguna razón llegamos aquí sin los datos necesarios, redirigimos al inicio.
    if (!otherUserId || !itemId) {
      console.error("Faltan datos para iniciar el chat, redirigiendo...");
      navigate('/');
      return;
    }

    const initiateConversation = async () => {
      try {
        // Hacemos la petición a nuestro backend para crear o encontrar la conversación.
        const response = await axios.post('/api/conversations', { otherUserId, itemId });
        
        // Una vez que tenemos el ID real de la conversación, redirigimos a la página de chat.
        // 'replace: true' es importante para que el usuario no pueda volver a esta página de carga.
        navigate(`/chat/${response.data.id}`, { replace: true });
      } catch (error) {
        console.error("Error al iniciar la conversación:", error);
        // Aquí podríamos redirigir a una página de error o mostrar un mensaje
        navigate('/', { state: { error: "No se pudo iniciar el chat." } });
      }
    };

    initiateConversation();
  }, [otherUserId, itemId, navigate]);

  // Mientras se hace la petición, mostramos un indicador de carga profesional.
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Iniciando conversación segura...</Typography>
    </Box>
  );
};

export default ChatLoaderPage;