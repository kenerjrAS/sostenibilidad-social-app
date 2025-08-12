// src/pages/AddItemPage.js
import React, { useState } from 'react';
import axios from '../api/axiosConfig'; // Asegúrate de usar la instancia configurada
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Importamos los componentes necesarios de MUI, incluyendo Select, MenuItem, etc.
import { 
  Button, TextField, Box, Typography, Container, Alert, Link, 
  CssBaseline, CircularProgress, Select, MenuItem, InputLabel, FormControl 
} from '@mui/material';

const AddItemPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [offerType, setOfferType] = useState(''); // <-- 1. NUEVO ESTADO PARA EL TIPO DE OFERTA
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
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
      // PASO 1: Crear el artículo, AHORA INCLUYENDO EL offer_type
      const itemResponse = await axios.post('/items', {
        title,
        description,
        offer_type: offerType, // <-- 2. AÑADIMOS EL DATO A LA PETICIÓN
      });

      const newItemId = itemResponse.data.id;

      // PASO 2: Si hay una imagen, subirla (sin cambios)
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await axios.post(`/upload/item/${newItemId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      navigate('/');

    } catch (err) {
      console.error('Error al crear el artículo:', err);
      // Mostramos el error específico del backend si existe
      setError(err.response?.data?.error || 'Ocurrió un error inesperado al crear el artículo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Publicar un nuevo Artículo
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal" required fullWidth id="title" label="Título del Artículo"
            name="title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
          />

          {/* --- 3. NUEVO SELECTOR PARA EL TIPO DE OFERTA --- */}
          <FormControl fullWidth required margin="normal">
            <InputLabel id="offer-type-label">Tipo de Oferta</InputLabel>
            <Select
              labelId="offer-type-label"
              id="offer-type-select"
              value={offerType}
              label="Tipo de Oferta"
              onChange={(e) => setOfferType(e.target.value)}
            >
              <MenuItem value="donacion">Donación</MenuItem>
              <MenuItem value="intercambio">Intercambio</MenuItem>
              <MenuItem value="venta">Venta</MenuItem>
            </Select>
          </FormControl>
          {/* ------------------------------------------- */}

          <TextField
            margin="normal" fullWidth name="description" label="Descripción (opcional)"
            id="description" multiline rows={5} value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
            Seleccionar Imagen
            <input type="file" hidden onChange={handleFileChange} accept="image/png, image/jpeg" />
          </Button>
          {imageFile && <Typography variant="body2" sx={{ mt: 1 }}>Archivo: {imageFile.name}</Typography>}
          
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