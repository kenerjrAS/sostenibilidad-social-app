// src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Importamos los componentes de MUI
import { Button, TextField, Box, Typography, Container, Alert, Link, CssBaseline } from '@mui/material';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // ... la lógica de handleSubmit se mantiene igual ...
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
        setSuccess(response.data.message + " Redirigiendo a Login...");
        setTimeout(() => {
            navigate('/login');
        }, 2000); // Esperamos 2 segundos antes de redirigir
    } catch (err) {
        if (err.response) {
            setError(err.response.data.error || 'Error desconocido.');
        } else {
            setError('No se pudo conectar con el servidor.');
        }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Crear una Cuenta
        </Typography>
        
        {/* Si hay un mensaje de éxito, lo mostramos y ocultamos el formulario */}
        {success ? (
          <Alert severity="success" sx={{ width: '100%', mt: 3 }}>{success}</Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nombre de Usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Registrar
            </Button>

            <Link component={RouterLink} to="/login" variant="body2">
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default RegisterPage;