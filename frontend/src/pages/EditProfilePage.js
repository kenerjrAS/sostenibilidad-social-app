// src/pages/EditProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from '../api/axiosConfig'; // <-- CAMBIO 1: Importamos nuestra instancia configurada
import { useAuth } from '../context/AuthContext';

// Importaciones de MUI
import { Button, TextField, Box, Typography, Container, Alert, Link, CssBaseline, CircularProgress } from '@mui/material';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        // --- CAMBIO 2: URL relativa ---
        const response = await axios.get(`/profiles/${user.id}`);
        setUsername(response.data.username);
      } catch (err) {
        setError('No se pudieron cargar los datos de tu perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // --- CAMBIO 2: URL relativa ---
      await axios.put('/profiles/me', {
        username,
      });
      navigate(`/profile/${user.id}`);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Ocurrió un error al actualizar el perfil.');
      }
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
          Editar mi Perfil
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nombre de Usuario"
            name="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Guardar Cambios
          </Button>

          <Box textAlign="center">
            {/* Aseguramos que user.id exista antes de renderizar el Link */}
            {user && <Link component={RouterLink} to={`/profile/${user.id}`} variant="body2">
              Cancelar
            </Link>}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default EditProfilePage;