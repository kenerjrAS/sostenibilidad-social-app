// controllers/uploadController.js
const supabase = require('../config/supabaseClient');

const uploadItemImage = async (req, res) => {
  // 1. Verificamos que se haya subido un archivo
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' });
  }

  // El middleware 'protect' ya nos dio req.user
  // Obtenemos el ID del artículo de los parámetros de la URL
  const { itemId } = req.params;

  try {
    // 2. Verificamos que el usuario sea el dueño del artículo
    const { data: item, error: findError } = await supabase
      .from('items')
      .select('owner_id')
      .eq('id', itemId)
      .single();

    if (findError || !item) {
      return res.status(404).json({ error: 'Artículo no encontrado.' });
    }
    if (item.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para subir imágenes a este artículo.' });
    }

    // 3. Subimos el archivo al Storage de Supabase
    const fileName = `${req.user.id}/${itemId}-${Date.now()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('item-images') // El nombre del bucket que creamos
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 4. Obtenemos la URL pública de la imagen recién subida
    const { data: { publicUrl } } = supabase.storage
      .from('item-images')
      .getPublicUrl(fileName);

    // 5. Actualizamos la tabla 'items' con la nueva URL de la imagen
    // Aquí guardaremos un array con una sola imagen, pero está preparado para más
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update({ images: [publicUrl] })
      .eq('id', itemId)
      .select();
    
    if (updateError) {
      throw updateError;
    }

    res.status(200).json(updatedItem[0]);

  } catch (error) {
    console.error('Error en la subida de imagen:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadItemImage,
};