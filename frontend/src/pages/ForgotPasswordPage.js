// src/pages/ForgotPasswordPage.js

import React, { useState } from 'react';
import axios from '../api/axiosConfig'; // <-- CAMBIO 1: Importamos nuestra instancia configurada
import { Link as RouterLink } from 'react-router-dom';

// Importaciones de MUI
import { Button, TextField, Box, Typography, Container, Alert, Link, CssBaseline } from '@mui/material';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      // --- CAMBIO 2: URL relativa ---
      const response = await axios.post('/auth/forgot-password', {
        email,
      });
      setMessage(response.data.message);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Restablecer Contraseña
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
          Introduce tu email y te enviaremos un enlace para crear una nueva contraseña.
        </Typography>
        
        {/* Mostramos el mensaje de éxito aquí arriba si existe */}
        {message ? (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{message}</Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Enviar Enlace de Restablecimiento
            </Button>
          </Box>
        )}
        
        <Box textAlign="center" sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/login" variant="body2">
            Volver a Iniciar Sesión
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;