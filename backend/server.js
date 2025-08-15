// server.js (VERSIÓN DE DEPURACIÓN DE CORS)

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const supabase = require('./config/supabaseClient');

// --- 1. IMPORTACIONES (SIN CAMBIOS) ---
const authController = require('./controllers/authController');
// ... (resto de importaciones sin cambios)

// --- 2. CONFIGURACIÓN INICIAL (SIN CAMBIOS) ---
dotenv.config();
const app = express();
const server = http.createServer(app);

// --- 3. CONFIGURACIÓN DE CORS (CAMBIO TEMPORAL PARA DEPURAR) ---
// Hemos comentado la configuración robusta
/*
const allowedOrigins = [
  'http://localhost:3000',
  'https://sostenibilidad-social-app.pages.dev'
];
app.use(cors({
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
*/

// Y la hemos reemplazado por la configuración más simple y abierta
console.log("==> [MODO DEPURACIÓN] Usando configuración de CORS abierta (*)");
app.use(cors()); 
// ---------------------------------------------------------------


// --- 4. MIDDLEWARES GLOBALES (SIN CAMBIOS) ---
app.use(express.json());


// --- 5. CONFIGURACIÓN DE SOCKET.IO (SIMPLIFICADA TAMBIÉN) ---
const io = new Server(server, {
  cors: { 
    origin: "*", // Aceptamos cualquier origen para el socket también
    methods: ["GET", "POST"]
  }
});


// --- 6. RUTA RAÍZ DE BIENVENIDA (SIN CAMBIOS) ---
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de Sostenibilidad Social! El servidor está funcionando.');
});


// --- 7. RUTAS DE LA API (SIN CAMBIOS) ---
console.log("==> Registrando rutas de la API de forma monolítica...");
// ... (toda tu sección de rutas sin cambios) ...
console.log("==> Todas las rutas han sido registradas.");


// --- 8. LÓGICA DE SOCKET.IO (SIN CAMBIOS) ---
io.on('connection', (socket) => { /* ... */ });


// --- 9. ARRANQUE DEL SERVIDOR (SIN CAMBIOS) ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor monolítico corriendo en el puerto ${PORT}`);
});