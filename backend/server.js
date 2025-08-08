// server.js (VERSIÓN MONOLÍTICA CON LA RUTA DE UPLOAD DESACTIVADA PARA DEPURAR)

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

// --- 3. CONFIGURACIÓN DE CORS FINAL Y A PRUEBA DE FALLOS ---
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

// --- 4. MIDDLEWARES GLOBALES ---
app.use(express.json());


// --- 5. CONFIGURACIÓN DE SOCKET.IO ---
const io = new Server(server, {
  cors: { 
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});


// --- 6. RUTA RAÍZ DE BIENVENIDA ---
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de Sostenibilidad Social! El servidor está funcionando.');
});


// --- 7. DEFINIMOS TODAS LAS RUTAS DE LA API ---
console.log("==> Registrando rutas de la API de forma monolítica...");

// Auth Routes
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/login', authController.loginUser);
app.post('/api/auth/forgot-password', authController.forgotPassword);

// Profile Routes
app.put('/api/profiles/me', protect, profileController.updateMyProfile);
app.get('/api/profiles/:id', profileController.getProfileById);
app.get('/api/profiles/:id/items', profileController.getItemsByUserId);

// Conversation Routes
app.post('/api/conversations', protect, conversationController.getOrCreateConversation);
app.get('/api/conversations/:conversationId/messages', protect, conversationController.getMessagesByConversationId);

// --- CAMBIO REALIZADO AQUÍ ---
// Upload Routes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Se comenta la siguiente línea porque está causando un error fatal en el despliegue.
// Esto desactivará temporalmente la subida de imágenes, pero permitirá que el resto de la API funcione.
// app.post('/api/upload/item/:itemId', protect, upload.single('image'), uploadController.uploadItemImage);

// Item Routes
app.get('/api/items/search/nearby', itemController.searchNearbyItems);
app.post('/api/items', protect, itemController.createItem);
app.get('/api/items', itemController.getItems);
app.get('/api/items/:id', itemController.getItemById);
app.put('/api/items/:id', protect, itemController.updateItem);
app.delete('/api/items/:id', protect, itemController.deleteItem);

console.log("==> Todas las rutas han sido registradas.");


// --- 8. LÓGICA DE SOCKET.IO ---
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


// --- 9. ARRANQUE DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor monolítico corriendo en el puerto ${PORT}`);
});