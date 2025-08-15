// src/pages/ItemDetailsPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

import { Box, Typography, Button, CircularProgress, Alert, Paper, Stack, Divider, CardMedia, Link } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
        try {
            const response = await axios.get(`/items/${id}`);
            setItem(response.data);
        } catch (err) {
            setError('No se pudo encontrar el artículo.');
        } finally {
            setLoading(false);
        }
    };
    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      try {
        await axios.delete(`/items/${id}`);
        navigate('/');
      } catch (err) {
        setError('No se pudo eliminar el artículo. Inténtalo de nuevo.');
        console.error('Error al eliminar el artículo:', err);
      }
    }
  };
  
  // --- FUNCIÓN ACTUALIZADA PARA NAVEGACIÓN INSTANTÁNEA ---
  const handleContactOwner = () => {
    if (!user || !item?.owner_id) {
        setError("No se puede iniciar el chat, falta información.");
        return;
    }

    // 1. Ordenamos los IDs para que la conversación sea la misma sin importar quién la inicie
    const participants = [user.id, item.owner_id].sort();
    
    // 2. Creamos un ID único y predecible para la URL
    const predictableConversationId = `chat-${participants[0]}-${participants[1]}-${item.id}`;

    // 3. Navegamos INMEDIATAMENTE, pasando los datos necesarios a través del 'state'
    navigate(`/chat/${predictableConversationId}`, { 
      state: {
        participantIds: participants,
        itemId: item.id
      }
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !item) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error || 'Artículo no encontrado.'}</Alert>;
  }

  const isOwner = user && user.id === item.owner_id;

  return (
    <Box>
      <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
        Volver a todos los artículos
      </Button>
      <Paper elevation={3} sx={{ padding: { xs: 2, md: 4 }, borderRadius: '12px' }}>
        {item.images && item.images.length > 0 && (
          <CardMedia
            component="img"
            sx={{ height: { xs: 200, md: 350 }, borderRadius: '8px', mb: 4 }}
            image={item.images[0]}
            alt={item.title}
          />
        )}
        <Typography variant="h3" component="h1" gutterBottom>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Publicado el: {new Date(item.created_at).toLocaleDateString()}
        </Typography>
        
        {item.profiles && (
          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>
            Publicado por: <Link component={RouterLink} to={`/profile/${item.owner_id}`}>{item.profiles.username}</Link>
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" paragraph>
          {item.description || "Este artículo no tiene descripción."}
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          {isAuthenticated && !isOwner && (
            <Button variant="contained" onClick={handleContactOwner} startIcon={<ChatIcon />} size="large">
              Contactar al Dueño
            </Button>
          )}

          {isOwner && (
            <>
              <Typography variant="h6" gutterBottom>Acciones del Propietario</Typography>
              <Stack direction="row" spacing={2}>
                <Button component={RouterLink} to={`/item/${id}/edit`} variant="contained" color="warning" startIcon={<EditIcon />}>
                  Editar
                </Button>
                <Button onClick={handleDelete} variant="outlined" color="error" startIcon={<DeleteIcon />}>
                  Eliminar
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ItemDetailsPage;