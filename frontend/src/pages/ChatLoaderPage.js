// src/pages/ChatLoaderPage.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig'; // Asegúrate de que apunte a tu axiosConfig

// Importaciones de MUI (sin 'Alert')
import { Box, CircularProgress, Typography } from '@mui/material';

const ChatLoaderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { otherUserId, itemId } = location.state || {};

  useEffect(() => {
    if (!otherUserId || !itemId) {
      console.error("Faltan datos para iniciar el chat, redirigiendo...");
      navigate('/');
      return;
    }

    const initiateConversation = async () => {
      try {
        const response = await axios.post('/conversations', { otherUserId, itemId });
        navigate(`/chat/${response.data.id}`, { replace: true });
      } catch (error) {
        console.error("Error al iniciar la conversación:", error);
        // Navegamos a la página de inicio y pasamos un estado de error para mostrar un mensaje
        navigate('/', { state: { error: "No se pudo iniciar el chat." } });
      }
    };

    initiateConversation();
  }, [otherUserId, itemId, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Iniciando conversación segura...</Typography>
    </Box>
  );
};

export default ChatLoaderPage;