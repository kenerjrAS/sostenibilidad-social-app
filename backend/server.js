// server.js (VERSIÓN MONOLÍTICA CON CORS FINAL)

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

// --- 3. CONFIGURACIÓN DE CORS PARA PRODUCCIÓN (VERSIÓN FINAL) ---
const allowedOrigins = [
  'http://localhost:3000',
  'https://sostenibilidad-social-app.pages.dev' // URL corregida sin la barra al final
];

const corsOptions = {
  origin: allowedOrigins
};

// --- 4. MIDDLEWARES GLOBALES ---
app.use(cors(corsOptions)); // Usamos la configuración explícita y robusta de CORS
app.use(express.json());


// --- 5. CONFIGURACIÓN DE SOCKET.IO ---
const io = new Server(server, {
  cors: { 
    origin: allowedOrigins,
    methods: ["GET", "POST"] 
  }
});


// --- 6. DEFINIMOS TODAS LAS RUTAS AQUÍ MISMO ---
console.log("==> Registrando rutas de la API de forma monolítica...");

// --- Auth Routes ---
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/login', authController.loginUser);
app.post('/api/auth/forgot-password', authController.forgotPassword);

// --- Profile Routes ---
app.put('/api/profiles/me', protect, profileController.updateMyProfile);
app.get('/api/profiles/:id', profileController.getProfileById);
app.get('/api/profiles/:id/items', profileController.getItemsByUserId);

// --- Conversation Routes ---
app.post('/api/conversations', protect, conversationController.getOrCreateConversation);
app.get('/api/conversations/:conversationId/messages', protect, conversationController.getMessagesByConversationId);

// --- Upload Routes (con configuración de multer) ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.post('/api/upload/item/:itemId', protect, upload.single('image'), uploadController.uploadItemImage);

// --- Item Routes ---
app.get('/api/items/search/nearby', itemController.searchNearbyItems);
app.post('/api/items', protect, itemController.createItem);
app.get('/api/items', itemController.getItems);
app.get('/api/items/:id', itemController.getItemById);
app.put('/api/items/:id', protect, itemController.updateItem);
app.delete('/api/items/:id', protect, itemController.deleteItem);

console.log("==> Todas las rutas han sido registradas.");


// --- 7. LÓGICA DE SOCKET.IO ---
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado vía WebSocket: ${socket.id}`);
  
  socket.on('join_conversation', (conversationId) => {
    console.log(`🔌 Cliente ${socket.id} se unió a la conversación: ${conversationId}`);
    socket.join(conversationId);
  });

  socket.on('send_message', async (data) => {
    const { conversationId, senderId, content } = data;
    try {
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, sender_id: senderId, content: content })
        .select('*, profiles ( username )')
        .single();
      if (error) throw error;
      io.to(conversationId).emit('receive_message', newMessage);
    } catch (error) {
      console.error('Error al procesar mensaje de socket:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});


// --- 8. ARRANQUE DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor monolítico corriendo en el puerto ${PORT}`);
});