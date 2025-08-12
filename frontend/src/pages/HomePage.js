// src/pages/HomePage.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axiosConfig';
import { Link as RouterLink } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import { useAuth } from '../context/AuthContext';

import { 
  Grid, Card, CardContent, CardActionArea, Typography, Box, 
  CircularProgress, CardHeader, Avatar, CardMedia, 
  Switch, FormControlLabel, Alert, Tabs, Tab,
  Popover, TextField, RadioGroup, Radio, FormControl, FormLabel, Button, Paper
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

const HomePage = () => {
  const { isAuthenticated } = useAuth(); // Obtenemos el estado de autenticación
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [searchNearby, setSearchNearby] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/items', {
        params: { 
          type: selectedCategory,
          search: searchTerm,
          sortBy: sortBy
        }
      });
      setItems(response.data);
    } catch (err) {
      setError('No se pudieron cargar los artículos.');
      console.error("Error al obtener artículos:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, sortBy]);

  const fetchNearbyItems = useCallback(async (location) => {
    setLoading(true);
    setError('');
    try {
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchNearby && userLocation) {
      fetchNearbyItems(userLocation);
      setSelectedCategory('todos');
      setSearchTerm('');
      setSortBy('newest');
    } else {
      fetchItems();
    }
  }, [searchNearby, userLocation, fetchItems, fetchNearbyItems]);

  const handleNearbyToggle = (event) => {
    const isChecked = event.target.checked;
    setSearchNearby(isChecked);
    if (isChecked && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        (err) => {
          setError('No se pudo obtener tu ubicación.');
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, sm: 0 } }}>
          Explora Artículos
        </Typography>
        <FormControlLabel
          control={<Switch checked={searchNearby} onChange={handleNearbyToggle} />}
          label="Mostrar solo cercanos"
        />
      </Box>

      {/* --- HERO SECTION CONDICIONAL --- */}
      {/* Solo se muestra si el usuario NO está autenticado */}
      {!isAuthenticated && (
        <Paper 
          elevation={4} 
          sx={{ 
            padding: { xs: 2, md: 3 },
            marginBottom: 4, 
            borderRadius: '16px',
            color: '#fff',
            background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bienvenido/a a NexoK
          </Typography>
          <Typography variant="body1" component="p" sx={{ mb: 3, maxWidth: '700px', mx: 'auto', fontWeight: 300 }}>
            La plataforma comunitaria para dar y recibir. Conecta con tus vecinos, dale una segunda vida a los objetos y fomenta un estilo de vida sostenible.
          </Typography>
          <Button 
            component={RouterLink} 
            to="/register" 
            variant="contained" 
            size="large"
            sx={{ 
              backgroundColor: 'white', 
              color: 'primary.main',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#f0f0f0'
              }
            }}
          >
            Únete a la Comunidad
          </Button>
        </Paper>
      )}
      {/* ------------------------------------------- */}

      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedCategory} onChange={handleCategoryChange} aria-label="categorías de artículos" variant="scrollable" scrollButtons="auto">
          <Tab label="Todos" value="todos" />
          <Tab label="Donaciones" value="donacion" />
          <Tab label="Intercambios" value="intercambio" />
          <Tab label="Ventas" value="venta" />
        </Tabs>
        <Button 
          onClick={handleFilterClick} 
          startIcon={<FilterListIcon />} 
          sx={{ ml: 'auto', flexShrink: 0 }}
          variant="outlined"
          aria-label="filtros avanzados"
        >
          Filtro
        </Button>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, width: { xs: 250, sm: 300 } }}>
          <Typography variant="h6" gutterBottom>Filtros Avanzados</Typography>
          <TextField
            fullWidth
            label="Buscar por palabra clave..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl>
            <FormLabel>Ordenar por</FormLabel>
            <RadioGroup value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <FormControlLabel value="newest" control={<Radio />} label="Más recientes" />
              <FormControlLabel value="oldest" control={<Radio />} label="Más antiguos" />
            </RadioGroup>
          </FormControl>
        </Box>
      </Popover>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {searchNearby && userLocation && items.length > 0 && (
            <MapComponent items={items} userLocation={userLocation} />
          )}

          {items.length === 0 ? (
            <Typography>
              No se encontraron artículos que coincidan con tus filtros.
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
                        <CardMedia component="img" sx={{ height: 150 }} image={imageUrl} alt={item.title} />
                        <CardHeader
                          avatar={ <Avatar sx={{ bgcolor: 'primary.main' }}>{item.title ? item.title[0].toUpperCase() : '?'}</Avatar> }
                          title={ <Typography variant="h6" component="div" noWrap>{item.title}</Typography> }
                          subheader={`Publicado: ${new Date(item.created_at).toLocaleDateString()}`}
                        />
                        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
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
        </>
      )}
    </Box>
  );
};

export default HomePage;