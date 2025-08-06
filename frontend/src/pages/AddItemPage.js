// src/pages/AddItemPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Importamos más componentes de MUI
import { Button, TextField, Box, Typography, Container, Alert, Link, CssBaseline, CircularProgress } from '@mui/material';

const AddItemPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null); // <-- Estado para el archivo de imagen
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Estado para el proceso de envío

  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Nueva función para manejar el cambio en el input de archivo
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]); // Guardamos el primer archivo seleccionado
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Debes iniciar sesión para publicar un artículo.');
      setLoading(false);
      return;
    }

    try {
      // PASO 1: Crear el artículo (solo texto)
      const itemResponse = await axios.post('http://localhost:5000/api/items', {
        title,
        description,
      });

      const newItemId = itemResponse.data.id;

      // PASO 2: Si el usuario seleccionó una imagen, la subimos
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile); // La clave 'image' debe coincidir con el backend

        // Hacemos la petición de subida al endpoint de upload
        await axios.post(`http://localhost:5000/api/upload/item/${newItemId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Cabecera especial para archivos
          },
        });
      }
      
      // Si todo va bien, redirigimos al inicio
      navigate('/');

    } catch (err) {
      console.error('Error al crear el artículo:', err);
      setError('Ocurrió un error inesperado al crear el artículo.');
    } finally {
      setLoading(false); // Dejamos de cargar, ya sea con éxito o con error
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Publicar un Nuevo Artículo
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal" required fullWidth id="title" label="Título del Artículo"
            name="title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="normal" fullWidth name="description" label="Descripción (opcional)"
            id="description" multiline rows={5} value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* --- NUEVO INPUT PARA SUBIR IMAGEN --- */}
          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
            Seleccionar Imagen
            <input type="file" hidden onChange={handleFileChange} accept="image/png, image/jpeg" />
          </Button>
          {imageFile && <Typography variant="body2" sx={{ mt: 1 }}>Archivo seleccionado: {imageFile.name}</Typography>}
          
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Publicar Artículo"}
          </Button>

          <Box textAlign="center">
            <Link component={RouterLink} to="/" variant="body2">
              Cancelar y volver al inicio
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default AddItemPage;