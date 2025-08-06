// backend/controllers/profileController.js
const supabase = require('../config/supabaseClient');

//================================================
// OBTENER UN PERFIL PÚBLICO POR ID
//================================================
const getProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, create_at, reputation_score') 
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Perfil no encontrado.' });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//================================================
// OBTENER LOS ARTÍCULOS DE UN PERFIL
//================================================
const getItemsByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('items').select('*').eq('owner_id', id);
    if (error) {
      throw error;
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//================================================
// ACTUALIZAR MI PROPIO PERFIL (PROTEGIDO)
//================================================
const updateMyProfile = async (req, res) => {
  // El middleware 'protect' nos da el usuario en req.user
  const { id } = req.user;
  
  // Obtenemos los datos que el usuario quiere cambiar del body
  const { username } = req.body;

  // Validación: nos aseguramos de que al menos envíen un username
  if (!username) {
    return res.status(400).json({ error: 'El nombre de usuario es requerido.' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ username: username }) // Actualizamos el campo 'username'
      .eq('id', id) // Solo en la fila que coincida con el ID del usuario logueado
      .select();

    if (error) {
      // Manejar posibles errores, como un username que ya existe
      if (error.code === '23505') { // Código de error de violación de unicidad de PostgreSQL
        return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso.' });
      }
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado para actualizar.' });
    }

    res.status(200).json(data[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//================================================
// EXPORTS
//================================================
module.exports = {
  getProfileById,
  getItemsByUserId,
  updateMyProfile,
};