// src/pages/ChatPage.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

import { Box, TextField, Button, Paper, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatPage = () => {
  const { conversationId: predictableId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [dbConversationId, setDbConversationId] = useState(null); // El ID real de la conversación en la BD
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null); // Ref para hacer scroll automático

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // useEffect para iniciar el chat y cargar el historial de mensajes
  useEffect(() => {
    // Si no recibimos el 'state' de la navegación, es un acceso inválido
    if (!location.state) {
      setError("No se puede acceder al chat directamente. Por favor, inícialo desde la página de un artículo.");
      setLoading(false);
      return; // Detenemos la ejecución
    }

    const setupAndFetch = async () => {
      setLoading(true);
      try {
        const { participantIds, itemId } = location.state;

        // 1. Llamamos al nuevo endpoint para asegurar que la conversación exista en la BD
        const convResponse = await axios.post('/conversations/ensure', {
          participantIds,
          itemId
        });
        
        const actualConvId = convResponse.data.id;
        setDbConversationId(actualConvId); // Guardamos el ID real que nos dio el backend

        // 2. Cargamos los mensajes de esa conversación usando el ID real
        const messagesResponse = await axios.get(`/conversations/${actualConvId}/messages`);
        setMessages(messagesResponse.data);
        
        // 3. Nos unimos a la sala de socket.io con el ID real
        if(socket) {
          socket.emit('join_conversation', actualConvId);
        }

      } catch (err) {
        setError('No se pudo cargar el chat. Intenta de nuevo.');
        console.error("Error al iniciar o cargar el chat:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && socket) {
      setupAndFetch();
    } else if (!user) {
        setError("Debes iniciar sesión para ver los chats.");
        setLoading(false);
    }
  }, [predictableId, user, socket, location.state, navigate]);

  // useEffect para escuchar los mensajes que llegan en tiempo real
  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (receivedMessage) => {
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      };
      socket.on('receive_message', handleReceiveMessage);
      return () => {
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [socket]);

  // useEffect para hacer scroll automático cuando la lista de mensajes cambia
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función para manejar el envío de un nuevo mensaje
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user && dbConversationId) {
      socket.emit('send_message', {
        conversationId: dbConversationId, // Usamos el ID real de la BD
        senderId: user.id,
        content: newMessage,
      });
      setNewMessage('');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper elevation={3} sx={{ height: {xs: '80vh', md: '70vh'}, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((msg) => (
            <ListItem key={msg.id} sx={{ justifyContent: msg.sender_id === user?.id ? 'flex-end' : 'flex-start' }}>
              <Box sx={{
                bgcolor: msg.sender_id === user?.id ? 'primary.main' : 'grey.300',
                color: msg.sender_id === user?.id ? 'primary.contrastText' : 'text.primary',
                p: 1.5,
                borderRadius: '16px',
                maxWidth: '70%',
              }}>
                <ListItemText
                  primary={msg.content}
                  secondary={`${msg.profiles?.username || '...'} - ${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  secondaryTypographyProps={{ 
                    color: msg.sender_id === user?.id ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    textAlign: 'right',
                    fontSize: '0.75rem',
                    mt: 0.5,
                  }}
                />
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: '1px solid #ddd', display: 'flex', backgroundColor: '#f9f9f9' }}>
        <TextField
          fullWidth variant="outlined" placeholder="Escribe un mensaje..."
          value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
          autoComplete="off"
        />
        <Button type="submit" variant="contained" endIcon={<SendIcon />} sx={{ ml: 1 }}>
          Enviar
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatPage;