// backend/controllers/itemController.js

const supabase = require('../config/supabaseClient');

//================================================
// OBTENER TODOS LOS ARTÍCULOS (CON DATOS DEL DUEÑO)
//================================================
const getItems = async (req, res) => {
  console.log("==> Petición para obtener artículos RECIBIDA en el backend.");
  try {
    // Pedimos todas las columnas de 'items' y ahora también 'username' y 'location' del perfil asociado
    const { data, error } = await supabase
      .from('items')
      .select('*, profiles ( username, location )');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) { // <--- LA LLAVE QUE FALTABA ESTABA AQUÍ
    res.status(500).json({ error: error.message });
  }
};

//================================================
// CREAR UN NUEVO ARTÍCULO (PROTEGIDO)
//================================================
const createItem = async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'El título es obligatorio.' });
  }
  try {
    const { data, error } = await supabase
      .from('items')
      .insert([{ title, description, owner_id: req.user.id }])
      .select();
    if (error) {
      console.error("Error de Supabase al insertar:", error);
      throw error;
    }
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//================================================
// OBTENER UN ARTÍCULO POR SU ID (CON DATOS DEL DUEÑO)
//================================================
const getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*, profiles ( username )')
      .eq('id', id)
      .single();
    if (error || !data) {
      return res.status(404).json({ error: 'Artículo no encontrado.' });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//================================================
// ACTUALIZAR UN ARTÍCULO (PROTEGIDO)
//================================================
const updateItem = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const { data: item, error: findError } = await supabase.from('items').select('owner_id').eq('id', id).single();
    if (findError || !item) {
      return res.status(404).json({ error: 'Artículo no encontrado.' });
    }
    if (item.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para editar este artículo.' });
    }
    const { data, error } = await supabase.from('items').update({ title, description }).eq('id', id).select();
    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//================================================
// ELIMINAR UN ARTÍCULO (PROTEGIDO)
//================================================
const deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: item, error: findError } = await supabase.from('items').select('owner_id').eq('id', id).single();
    if (findError || !item) {
      return res.status(404).json({ error: 'Artículo no encontrado.' });
    }
    if (item.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este artículo.' });
    }
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Artículo eliminado exitosamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//================================================
// BÚSQUEDA GEOGRÁFICA
//================================================
const searchNearbyItems = async (req, res) => {
  const { lat, lon, dist } = req.query;
  if (!lat || !lon || !dist) {
    return res.status(400).json({ error: 'Latitud, longitud y distancia son requeridas.' });
  }
  try {
    const { data, error } = await supabase.rpc('buscar_items_cercanos', {
      latitud_usuario: parseFloat(lat),
      longitud_usuario: parseFloat(lon),
      distancia_km: parseFloat(dist)
    });
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//================================================
// EXPORTS
//================================================
module.exports = {
  getItems,
  createItem,
  getItemById,
  updateItem,
  deleteItem,
  searchNearbyItems,
};