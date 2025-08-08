// middleware/authMiddleware.js (VERSIÓN DE DEPURACIÓN MÁXIMA)

const protect = (req, res, next) => {
  console.log("==> [DEBUG] Entrando al middleware 'protect' simplificado.");
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    console.log("==> [DEBUG] Token detectado.");
    // Simulamos un usuario para que los controladores no fallen
    req.user = { id: '00000000-0000-0000-0000-000000000000' };
    next();
  } else {
    console.log("==> [DEBUG] No se encontró token. Bloqueando.");
    res.status(401).json({ error: 'No autorizado, no se encontró token.' });
  }
};

module.exports = { protect };