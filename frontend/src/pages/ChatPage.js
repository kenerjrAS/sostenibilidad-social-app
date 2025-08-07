// src/pages/ChatPage.js

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosConfig'; // <-- CAMBIO 1: Importamos nuestra instancia configurada
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

import { Box, TextField, Button, Paper, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatPage = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (conversationId && socket && user) {
      setLoading(true);
      const fetchMessages = async () => {
        try {
          // --- CAMBIO 2: URL relativa ---
          const response = await axios.get(`/conversations/${conversationId}/messages`);
          setMessages(response.data);
        } catch (err) {
          console.error("Error al cargar mensajes:", err);
          setError('No se pudo cargar el historial del chat.');
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();

      socket.emit('join_conversation', conversationId);
    } else if (!user) {
        setError("Debes iniciar sesión para ver los chats.");
        setLoading(false);
    } else {
        setLoading(false);
    }
  }, [conversationId, socket, user]);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user) {
      socket.emit('send_message', {
        conversationId,
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