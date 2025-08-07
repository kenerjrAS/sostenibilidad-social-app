// server.js (VERSIÓN MONOLÍTICA LISTA PARA PRODUCCIÓN)

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const supabase = require('./config/supabaseClient');

// --- 1. IMPORTAMOS TODOS LOS CONTROLADORES Y MIDDLEWARES ---
const authController = require('./controllers/authController');
const itemController = require('./controllers/itemController');
const uploadController = require('./controllers/uploadController');
const profileController = require('./controllers/profileController');
const conversationController = require('./controllers/conversationController');
const { protect } = require('./middleware/authMiddleware');

// --- 2. CONFIGURACIÓN INICIAL ---
dotenv.config();
const app = express();
const server = http.createServer(app);

// --- 3. CONFIGURACIÓN DE CORS PARA PRODUCCIÓN ---
const allowedOrigins = [
  'http://localhost:3000', // Para seguir probando en tu máquina local
  'https://sostenibilidad-social-app.pages.dev/' // ¡TU URL DE FRONTEND EN PRODUCCIÓN!
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin 'origin' (como las de Postman o apps móviles)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  }
};

// --- 4. MIDDLEWARES GLOBALES ---
app.use(cors(corsOptions)); // Usamos la configuración explícita de CORS
app.use(express.json());


// --- 5. CONFIGURACIÓN DE SOCKET.IO ---
const io = new Server(server, {
  cors: { 
    origin: allowedOrigins, // Permitimos conexiones WebSocket de los mismos orígenes
    methods: ["GET", "POST"] 
  }
});


// --- 6. DEFINIMOS TODAS LAS RUTAS AQUÍ MISMO ---
// ... (TODA TU SECCIÓN DE RUTAS SE MANTIENE EXACTAMENTE IGUAL) ...
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/login', authController.loginUser);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.put('/api/profiles/me', protect, profileController.updateMyProfile);
app.get('/api/profiles/:id', profileController.getProfileById);
app.get('/api/profiles/:id/items', profileController.getItemsByUserId);
app.post('/api/conversations', protect, conversationController.getOrCreateConversation);
app.get('/api/conversations/:conversationId/messages', protect, conversationController.getMessagesByConversationId);
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.post('/api/upload/item/:itemId', protect, upload.single('image'), uploadController.uploadItemImage);
app.get('/api/items/search/nearby', itemController.searchNearbyItems);
app.post('/api/items', protect, itemController.createItem);
app.get('/api/items', itemController.getItems);
app.get('/api/items/:id', itemController.getItemById);
app.put('/api/items/:id', protect, itemController.updateItem);
app.delete('/api/items/:id', protect, itemController.deleteItem);


// --- 7. LÓGICA DE SOCKET.IO ---
// ... (TODA TU LÓGICA DE SOCKET.IO SE MANTIENE EXACTAMENTE IGUAL) ...
io.on('connection', (socket) => { /* ... */ });


// --- 8. ARRANQUE DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor monolítico corriendo en el puerto ${PORT}`);
});