// src/pages/EditItemPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from '../api/axiosConfig'; // <-- CAMBIO 1: Importamos nuestra instancia configurada

// Importaciones de MUI
import { Button, TextField, Box, Typography, Container, Alert, Link, CssBaseline, CircularProgress } from '@mui/material';

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        // --- CAMBIO 2: URL relativa ---
        const response = await axios.get(`/items/${id}`);
        setTitle(response.data.title);
        setDescription(response.data.description || '');
      } catch (err) {
        setError('No se pudieron cargar los datos del artículo para editar.');
        console.error('Error al cargar el artículo para editar:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItemData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // --- CAMBIO 2: URL relativa ---
      await axios.put(`/items/${id}`, {
        title,
        description,
      });
      navigate(`/item/${id}`);
    } catch (err) {
      setError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
      console.error('Error al actualizar el artículo:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Editar Artículo
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Título del Artículo"
            name="title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            name="description"
            label="Descripción"
            id="description"
            multiline
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Guardar Cambios
          </Button>

          <Box textAlign="center">
            <Link component={RouterLink} to={`/item/${id}`} variant="body2">
              Cancelar y volver a la vista del artículo
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default EditItemPage;