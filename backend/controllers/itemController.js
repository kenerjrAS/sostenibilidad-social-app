// backend/controllers/itemController.js

const supabase = require('../config/supabaseClient');

//================================================
// OBTENER ARTÍCULOS (VERSIÓN CON FILTROS AVANZADOS)
//================================================
const getItems = async (req, res) => {
  // 1. Leemos todos los posibles filtros de la URL
  const { type, sortBy, search } = req.query;

  console.log(`==> Petición GET /items. Filtros: tipo=${type || 'ninguno'}, ordenar=${sortBy || 'ninguno'}, buscar='${search || 'ninguno'}'`);
  
  try {
    // 2. Creamos la consulta base
    let query = supabase
      .from('items')
      .select('*, profiles ( username, location )');

    // 3. Aplicamos el filtro de TIPO de oferta
    if (type && type !== 'todos') {
      query = query.eq('offer_type', type);
    }

    // 4. Aplicamos el filtro de BÚSQUEDA por texto
    if (search) {
      // .or() busca el término en la columna 'title' O en la 'description'
      // .ilike() es como 'contains' y es case-insensitive (no distingue mayúsculas/minúsculas)
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 5. Aplicamos el ORDENAMIENTO
    if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      // Por defecto, o si se especifica 'newest', ordenamos por los más nuevos primero
      query = query.order('created_at', { ascending: false });
    }
    
    // 6. Ejecutamos la consulta final ya construida
    const { data, error } = await query;

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//================================================
// CREAR UN NUEVO ARTÍCULO (PROTEGIDO)
//================================================
const createItem = async (req, res) => {
  const { title, description, offer_type } = req.body;
  if (!title || !offer_type) {
    return res.status(400).json({ error: 'El título y el tipo de oferta son obligatorios.' });
  }
  try {
    const { data, error } = await supabase
      .from('items')
      .insert([{ title, description, offer_type, owner_id: req.user.id }])
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