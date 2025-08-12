// src/theme.js
import { createTheme } from '@mui/material/styles';

// Colores extraídos de tu logo
const primaryColor = '#00A99D'; // Turquesa
const secondaryColor = '#F58220'; // Naranja

const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
    // Opcional: Definir un color de fondo sutil
    background: {
      default: '#f7f9fc', // Un gris azulado muy claro
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
  },
  components: {
    // Estilos por defecto para componentes específicos
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Usamos un gradiente sutil en la AppBar
          background: `linear-gradient(90deg, ${primaryColor} 0%, #008f86 100%)`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        // Hacemos los botones un poco más redondeados
        root: {
          borderRadius: '8px',
          textTransform: 'none', // Quitamos las mayúsculas por defecto
          fontWeight: 'bold',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 4px S20px rgba(0,0,0,0.1)',
          }
        },
      },
    },
  },
});

export default theme;