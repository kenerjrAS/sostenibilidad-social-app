// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link as RouterLink } from 'react-router-dom';

// Importaciones de páginas
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AddItemPage from './pages/AddItemPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EditItemPage from './pages/EditItemPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChatPage from './pages/ChatPage';

// Importaciones de Material-UI y Tema
import { AppBar, Toolbar, Typography, Button, Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';

// Importaciones de contexto y estilos
import { useAuth } from './context/AuthContext';
import './App.css';


function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static">
          <Container maxWidth="lg">
            <Toolbar disableGutters>
                <Typography
                  variant="h6"
                  noWrap
                  component="div" // No es un link por sí mismo, el Box ya lo es
                >
                  NexoK
                </Typography>
              </Box>

              {/* Elemento invisible para empujar los botones a la derecha */}
              <Box sx={{ flexGrow: 1 }} />
              
              {/* Lógica condicional para mostrar botones */}
              {isAuthenticated ? (
                <Box>
                  <Button color="inherit" component={RouterLink} to="/add-item">
                    Añadir Artículo
                  </Button>
                  <Typography variant="body1" component="span" sx={{ mx: 2 }}>
                    ¡Hola, {user ? user.email.split('@')[0] : ''}!
                  </Typography>
                  <Button color="inherit" onClick={logout} variant="outlined">
                    Logout
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Button color="inherit" component={RouterLink} to="/login">
                    Login
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/register">
                    Registro
                  </Button>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>

        <Container component="main" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/add-item" element={<AddItemPage />} />
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/item/:id/edit" element={<EditItemPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
          </Routes>
        </Container>
      </ThemeProvider>
    </Router>
  );
}

export default App;