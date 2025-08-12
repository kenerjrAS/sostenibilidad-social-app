// middleware/authMiddleware.js (VERSIÓN REAL)

const supabase = require('../config/supabaseClient');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verificamos el token con Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'No autorizado, el token ha fallado.' });
      }

      // Adjuntamos el usuario a la petición
      req.user = user;

      // Continuamos
      next();

    } catch (error) {
      console.error("Error en el middleware 'protect':", error);
      return res.status(401).json({ error: 'No autorizado, token inválido.' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'No autorizado, no se encontró token.' });
  }
};

module.exports = { protect };