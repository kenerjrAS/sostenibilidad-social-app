// backend/controllers/authController.js

const supabase = require('../config/supabaseClient.js');

//================================================
// FUNCIÓN PARA REGISTRAR UN USUARIO
//================================================
const registerUser = async (req, res) => {
  console.log("==> Petición de registro RECIBIDA en el backend con los datos:", req.body);
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, contraseña y username son requeridos.' });
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: { data: { username: username } }
    });
    if (error) {
      console.error('Error de Supabase al registrar:', error.message);
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ message: 'Usuario registrado exitosamente. Por favor, revisa tu email para la confirmación.', user: data.user });
  } catch (err) {
    console.error('Error inesperado en el servidor al registrar:', err.message);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

//================================================
// FUNCIÓN PARA INICIAR SESIÓN (LOGIN)
//================================================
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.error('Error de Supabase en login:', error.message);
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    res.status(200).json({ message: 'Inicio de sesión exitoso.', user: data.user, session: data.session });
  } catch (error) {
    console.error('Error inesperado en el servidor en login:', error.message);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

//================================================
// NUEVA FUNCIÓN AÑADIDA (OLVIDÉ MI CONTRASEÑA)
//================================================
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El email es requerido.' });
  }

  try {
    // Supabase se encarga de todo: genera un token único y envía el email.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password', // A dónde irá el usuario al hacer clic en el enlace del email
    });

    if (error) {
      console.error('Error de Supabase en forgotPassword:', error.message);
      // No devolvemos el error real por seguridad (para no confirmar si un email existe)
      // Simplemente damos una respuesta genérica.
    }

    // Por seguridad, siempre enviamos la misma respuesta para no revelar si un email está o no en la base de datos.
    res.status(200).json({ message: 'Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.' });

  } catch (err) {
    console.error('Error inesperado en el servidor en forgotPassword:', err.message);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

//================================================
// EXPORTS
//================================================
module.exports = {
  registerUser,
  loginUser,
  forgotPassword, // <-- Exportamos la nueva función
};