// backend/controllers/itemController.js

const supabase = require('../config/supabaseClient');

//================================================
// OBTENER TODOS LOS ARTÍCULOS (AHORA CON FILTRO)
//================================================
const getItems = async (req, res) => {
  // 1. Leemos el nuevo filtro 'type' de la URL (ej: /api/items?type=donacion)
  const { type } = req.query;

  console.log(`==> Petición para obtener artículos RECIBIDA. Filtro por tipo: ${type || 'ninguno'}`);
  
  try {
    // 2. Creamos la consulta base a Supabase, sigue siendo la misma
    let query = supabase
      .from('items')
      .select('*, profiles ( username, location )');

    // 3. Si nos enviaron un filtro 'type' Y no es 'todos', lo añadimos a la consulta
    if (type && type !== 'todos') {
      query = query.eq('offer_type', type);
    }
    
    // 4. Ejecutamos la consulta (que puede o no tener el filtro .eq())
    const { data, error } = await query;

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//================================================
// CREAR UN NUEVO ARTÍCULO (AHORA CON OFFER_TYPE)
//================================================
const createItem = async (req, res) => {
  // 1. Añadimos 'offer_type' a los datos que esperamos recibir
  const { title, description, offer_type } = req.body;

  // 2. Actualizamos la validación
  if (!title || !offer_type) {
    return res.status(400).json({ error: 'El título y el tipo de oferta son obligatorios.' });
  }

  try {
    const { data, error } = await supabase
      .from('items')
      .insert([
        {
          title,
          description,
          offer_type, // <-- 3. Guardamos el tipo de oferta en la base de datos
          owner_id: req.user.id, 
        },
      ])
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
// OBTENER UN ARTÍCULO POR SU ID (SIN CAMBIOS)
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
// ACTUALIZAR UN ARTÍCULO (SIN CAMBIOS)
//================================================
const updateItem = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body; // NOTA: Podríamos añadir offer_type aquí en el futuro
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
// ELIMINAR UN ARTÍCULO (SIN CAMBIOS)
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
// BÚSQUEDA GEOGRÁFICA (SIN CAMBIOS)
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
// EXPORTS (SIN CAMBIOS)
//================================================
module.exports = {
  getItems,
  createItem,
  getItemById,
  updateItem,
  deleteItem,
  searchNearbyItems,
};