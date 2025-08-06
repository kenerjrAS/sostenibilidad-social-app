// server.js (VERSIÓN MONOLÍTICA)

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
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

// --- 3. MIDDLEWARES GLOBALES ---
app.use(cors());
app.use(express.json());

// --- 4. DEFINIMOS TODAS LAS RUTAS AQUÍ MISMO ---
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
// ¡OJO! Las rutas más específicas como '/search/nearby' deben ir ANTES que las rutas con parámetros como '/:id'
app.get('/api/items/search/nearby', itemController.searchNearbyItems);
app.post('/api/items', protect, itemController.createItem);
app.get('/api/items', itemController.getItems);
app.get('/api/items/:id', itemController.getItemById);
app.put('/api/items/:id', protect, itemController.updateItem);
app.delete('/api/items/:id', protect, itemController.deleteItem);

console.log("==> Todas las rutas han sido registradas.");

// --- 5. LÓGICA DE SOCKET.IO ---
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

// --- 6. ARRANQUE DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor monolítico corriendo en el puerto ${PORT}`);
});