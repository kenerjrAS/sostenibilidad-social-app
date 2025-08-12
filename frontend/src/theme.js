// src/theme.js
import { createTheme } from '@mui/material/styles';

// Creamos un tema personalizado para Material-UI
const theme = createTheme({
  // Paleta de colores principal de nuestra aplicación
  palette: {
    primary: {
      main: '#1976d2', // Un azul estándar, profesional y accesible
    },
    secondary: {
      main: '#dc004e', // Un color de acento (rosa/rojo)
    },
    warning: {
      main: '#ff9800', // Naranja para el botón de editar
    },
    // Podemos definir más colores si los necesitamos (error, info, success)
  },

  // Configuración de la tipografía (fuentes)
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Fuente principal
    h4: {
      fontWeight: 600, // Hacemos los títulos h4 un poco más gruesos
    },
  },

  // Modificaciones globales para componentes específicos
  components: {
    // Estilos por defecto para todas las tarjetas (Card) de la aplicación
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Bordes más redondeados
          transition: 'transform 0.2s, box-shadow 0.2s',
          // Efecto hover sutil para todas las tarjetas
          '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        },
      },
    },
  },
});

export default theme;