// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Un azul profesional
    },
    secondary: {
      main: '#dc004e', // Un rosa/rojo para acentos
    },
    warning: { // Color para el botón de editar
      main: '#ff9800',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Bordes más redondeados para las tarjetas
          transition: 'transform 0.2s, box-shadow 0.2s',
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