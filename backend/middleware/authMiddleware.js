// middleware/authMiddleware.js (VERSIÓN SIMPLIFICADA Y ROBUSTA)

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      
      // Decodificamos la parte del payload del token (base64)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

      // Verificamos que el token no haya expirado (comprobación básica de seguridad)
      const isExpired = Date.now() >= payload.exp * 1000;
      if (isExpired) {
        return res.status(401).json({ error: 'Token expirado.' });
      }

      // 'sub' es el campo estándar para el ID de usuario en JWT de Supabase
      req.user = { id: payload.sub };
      
      next(); // ¡Dejamos pasar!

    } catch (e) {
      res.status(401).json({ error: 'Token inválido o malformado.' });
    }
  } else {
    res.status(401).json({ error: 'No autorizado, no se encontró token.' });
  }
};

module.exports = { protect };