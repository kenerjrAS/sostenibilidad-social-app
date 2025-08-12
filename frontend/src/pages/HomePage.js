// src/pages/HomePage.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axiosConfig'; // <-- ¡IMPORTANTE! Usando la instancia configurada
import { Link as RouterLink } from 'react-router-dom';
import MapComponent from '../components/MapComponent';

import { 
  Grid, Card, CardContent, CardActionArea, Typography, Box, 
  CircularProgress, CardHeader, Avatar, CardMedia, 
  Switch, FormControlLabel, Alert, Tabs, Tab 
} from '@mui/material';

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchNearby, setSearchNearby] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const fetchAllItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // La URL ahora es relativa ("/items")
      const response = await axios.get('/items', {
        params: { type: selectedCategory }
      });
      setItems(response.data);
    } catch (err) {
      setError('No se pudieron cargar los artículos.');
      console.error("Error al obtener todos los artículos:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchNearbyItems = useCallback(async (location) => {
    setLoading(true);
    setError('');
    try {
      // La URL ahora es relativa ("/items/search/nearby")
      const response = await axios.get('/items/search/nearby', { 
        params: {
          lat: location.latitude,
          lon: location.longitude,
          dist: 10,
        },
      });
      setItems(response.data);
    } catch (err) {
      setError('No se pudieron cargar los artículos cercanos.');
      console.error("Error al obtener artículos cercanos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchNearby && userLocation) {
      fetchNearbyItems(userLocation);
      setSelectedCategory('todos');
    } else {
      fetchAllItems();
    }
  }, [searchNearby, userLocation, fetchAllItems, fetchNearbyItems]);

  const handleNearbyToggle = (event) => {
    const isChecked = event.target.checked;
    setSearchNearby(isChecked);

    if (isChecked && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (err) => {
          setError('No se pudo obtener tu ubicación. Por favor, activa los permisos en tu navegador.');
          setSearchNearby(false);
        }
      );
    }
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    if (searchNearby) {
      setSearchNearby(false);
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, sm: 0 } }}>
          Artículos Disponibles
        </Typography>
        <FormControlLabel
          control={<Switch checked={searchNearby} onChange={handleNearbyToggle} />}
          label="Mostrar solo cercanos"
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={selectedCategory} 
          onChange={handleCategoryChange} 
          aria-label="categorías de artículos"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Todos" value="todos" />
          <Tab label="Donaciones" value="donacion" />
          <Tab label="Intercambios" value="intercambio" />
          <Tab label="Ventas" value="venta" />
        </Tabs>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {searchNearby && userLocation && items.length > 0 && (
        <MapComponent items={items} userLocation={userLocation} />
      )}

      {items.length === 0 ? (
        <Typography>
          {searchNearby ? "No se encontraron artículos cerca de ti." : `No hay artículos disponibles en la categoría "${selectedCategory}".`}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => {
            const imageUrl = item.images && item.images.length > 0 
              ? item.images[0] 
              : `https://placehold.co/600x400?text=${encodeURIComponent(item.title)}`;
            
            return (
              <Grid item key={item.id} xs={12} sm={6} md={4}>
                <CardActionArea component={RouterLink} to={`/item/${item.id}`} sx={{ height: '100%' }}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      sx={{ height: 150 }}
                      image={imageUrl}
                      alt={item.title}
                    />
                    <CardHeader
                      avatar={ <Avatar sx={{ bgcolor: 'primary.main' }}>{item.title ? item.title[0].toUpperCase() : '?'}</Avatar> }
                      title={ <Typography variant="h6" component="div" noWrap>{item.title}</Typography> }
                      subheader={`Publicado: ${new Date(item.created_at).toLocaleDateString()}`}
                    />
                    <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                      <Typography variant="body2" color="text.secondary" sx={{
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                        }}>
                        {item.description || "Sin descripción"}
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

export default HomePage;