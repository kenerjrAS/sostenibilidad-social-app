// controllers/uploadController.js
const supabase = require('../config/supabaseClient');

const uploadItemImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' });
  }

  const { itemId } = req.params;
  const { id: userId } = req.user;

  try {
    const { data: item, error: findError } = await supabase
      .from('items')
      .select('owner_id')
      .eq('id', itemId)
      .single();

    if (findError || !item) {
      return res.status(404).json({ error: 'Artículo no encontrado.' });
    }
    if (item.owner_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para subir imágenes a este artículo.' });
    }

    const fileName = `${userId}/${itemId}-${Date.now()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('item-images')
      .getPublicUrl(fileName);

    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update({ images: [publicUrl] })
      .eq('id', itemId)
      .select();
    
    if (updateError) throw updateError;

    res.status(200).json(updatedItem[0]);

  } catch (error) {
    console.error('Error en la subida de imagen:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadItemImage,
};