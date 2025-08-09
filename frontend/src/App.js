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
import ChatLoaderPage from './pages/ChatLoaderPage'; // <-- 1. IMPORTAMOS LA NUEVA PÁGINA

// Importaciones de Material-UI y Tema
import { 
  AppBar, Toolbar, Typography, Button, Box, Container, 
  CssBaseline, ThemeProvider, useTheme, useMediaQuery 
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import theme from './theme';

// Importaciones de contexto y estilos
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static">
          <Container maxWidth="lg">
            <Toolbar disableGutters>
              <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <img src="/logo192.png" alt="NexoK Logo" style={{ height: '32px', marginRight: '12px' }} />
                <Typography variant="h6">NexoK</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              {isAuthenticated ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button color="inherit" component={RouterLink} to="/add-item" title="Añadir Artículo">
                    {isMobile ? <AddCircleOutlineIcon /> : 'Añadir Artículo'}
                  </Button>
                  {!isMobile && (
                    <Typography variant="body1" component="span" sx={{ mx: 2 }}>
                      ¡Hola, {user ? user.email.split('@')[0] : ''}!
                    </Typography>
                  )}
                  <Button color="inherit" onClick={logout} variant="outlined">
                    Logout
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Button color="inherit" component={RouterLink} to="/login">Login</Button>
                  <Button color="inherit" component={RouterLink} to="/register">Registro</Button>
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
            {/* --- 2. AÑADIMOS LAS NUEVAS RUTAS DE CHAT --- */}
            <Route path="/chat/new" element={<ChatLoaderPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
          </Routes>
        </Container>
      </ThemeProvider>
    </Router>
  );
}

export default App;