// src/components/MapComponent.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';

// Leaflet a veces tiene problemas con los iconos por defecto en React,
// así que importamos y corregimos el path manualmente.
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // Punto del icono que corresponderá a la ubicación del marcador
});

L.Marker.prototype.options.icon = DefaultIcon;


const MapComponent = ({ items, userLocation }) => {
  // Usamos la ubicación del usuario como centro del mapa, o una ubicación por defecto si no está disponible
  const mapCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [40.416775, -3.703790]; // Centro de Madrid por defecto

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={13} 
      style={{ height: '400px', width: '100%', borderRadius: '8px', marginBottom: '20px' }}
    >
      {/* La capa de teselas (tiles) es el mapa base. Usamos OpenStreetMap, que es gratuito. */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Si tenemos la ubicación del usuario, ponemos un marcador especial para él */}
      {userLocation && (
        <Marker position={[userLocation.latitude, userLocation.longitude]}>
          <Popup>Estás aquí</Popup>
        </Marker>
      )}

      {/* Mapeamos los artículos para crear un marcador para cada uno */}
      {items.map(item => {
        // Suponemos que cada item tiene un objeto 'profiles' con una propiedad 'location'
        // en formato '(longitud, latitud)'
        if (item.profiles && item.profiles.location) {
          // Necesitamos parsear las coordenadas del formato de Supabase
          const coords = item.profiles.location.replace('(', '').replace(')', '').split(',');
          const lon = parseFloat(coords[0]);
          const lat = parseFloat(coords[1]);

          return (
            <Marker key={item.id} position={[lat, lon]}>
              <Popup>
                <Link component={RouterLink} to={`/item/${item.id}`} underline="hover">
                  {item.title}
                </Link>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
};

export default MapComponent;