// src/pages/EditItemPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

// Importaciones de MUI
import { Button, TextField, Box, Typography, Container, Alert, Link, CssBaseline, CircularProgress } from '@mui/material';

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para el formulario y la carga
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true); // Para la carga inicial de datos
  const [error, setError] = useState('');

  // 1. useEffect para obtener los datos actuales del artículo al cargar la página
  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/items/${id}`);
        // Rellenamos el estado del formulario con los datos recibidos del backend
        setTitle(response.data.title);
        setDescription(response.data.description || ''); // Usamos '' si la descripción es null o undefined
      } catch (err) {
        setError('No se pudieron cargar los datos del artículo para editar.');
        console.error('Error al cargar el artículo para editar:', err);
      } finally {
        setLoading(false); // Dejamos de cargar, ya sea con éxito o con error
      }
    };
    fetchItemData();
  }, [id]); // Se ejecuta cada vez que el ID de la URL cambie

  // 2. Función para enviar los datos actualizados al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Hacemos la petición PUT a nuestro backend con los nuevos datos
      await axios.put(`http://localhost:5000/api/items/${id}`, {
        title,
        description,
      });

      // Si es exitoso, redirigimos al usuario a la página de detalles para que vea los cambios
      navigate(`/item/${id}`);

    } catch (err) {
      setError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
      console.error('Error al actualizar el artículo:', err);
    }
  };

  // Mostramos un indicador de carga mientras se obtienen los datos del artículo
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
            color="primary" // Usamos el color primario del tema
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