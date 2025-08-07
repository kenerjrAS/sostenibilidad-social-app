// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from '../api/axiosConfig'; // <-- CAMBIO 1: Importamos nuestra instancia configurada
import { useAuth } from '../context/AuthContext';

// Importaciones de MUI
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, CardActionArea, CardMedia, Button } from '@mui/material';

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // --- CAMBIO 2: URLs relativas ---
        const profilePromise = axios.get(`/profiles/${id}`);
        const itemsPromise = axios.get(`/profiles/${id}/items`);

        const [profileResponse, itemsResponse] = await Promise.all([profilePromise, itemsPromise]);

        setProfile(profileResponse.data);
        setItems(itemsResponse.data);
      } catch (err) {
        setError('No se pudo cargar el perfil del usuario.');
        console.error("Error al obtener datos del perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error || 'Perfil no encontrado.'}</Alert>;
  }

  const isOwnProfile = user && user.id === id;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Perfil de: {profile.username}
        </Typography>

        {isOwnProfile && (
          <Button component={RouterLink} to="/profile/edit" variant="contained">
            Editar mi Perfil
          </Button>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Miembro desde: {new Date(profile.create_at).toLocaleDateString()}
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Artículos Publicados
      </Typography>

      {items.length === 0 ? (
        <Typography>Este usuario aún no ha publicado ningún artículo.</Typography>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => {
            const imageUrl = item.images && item.images.length > 0
              ? item.images[0]
              : `https://placehold.co/600x400?text=${encodeURIComponent(item.title)}`;
            
            return (
              <Grid item key={item.id} xs={12} sm={6} md={4}>
                <CardActionArea component={RouterLink} to={`/item/${item.id}`} sx={{ height: '100%' }}>
                  <Card sx={{ height: '100%' }}>
                    <CardMedia component="img" sx={{ height: 150 }} image={imageUrl} alt={item.title} />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {item.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </CardActionArea>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default ProfilePage;