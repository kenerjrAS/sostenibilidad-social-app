// controllers/conversationController.js
const supabase = require('../config/supabaseClient');

const getOrCreateConversation = async (req, res) => {
    const { otherUserId, itemId } = req.body;
    const currentUserId = req.user.id;
    if (!otherUserId || !itemId) {
        return res.status(400).json({ error: 'Falta el ID del otro usuario o del artículo.' });
    }
    try {
        const { data: existingConversation, error: findError } = await supabase.rpc('get_conversation_by_participants', {
            p_item_id: itemId, p_user_id1: currentUserId, p_user_id2: otherUserId
        });
        if (findError) throw findError;
        if (existingConversation && existingConversation.length > 0) {
            return res.status(200).json(existingConversation[0]);
        }
        const { data: newConversation, error: createError } = await supabase.rpc('create_conversation', {
            p_item_id: itemId, p_participants: [currentUserId, otherUserId]
        });
        if (createError) throw createError;
        res.status(201).json(newConversation[0]);
    } catch (error) {
        console.error("Error detallado en getOrCreateConversation:", error);
        res.status(500).json({ error: error.message });
    }
};

const ensureConversationExists = async (req, res) => {
    const { participantIds, itemId } = req.body;
    const currentUserId = req.user.id;
    if (!participantIds || !itemId || !participantIds.includes(currentUserId)) {
        return res.status(400).json({ error: "Datos inválidos o insuficientes." });
    }
    try {
        const { data: existing, error: findError } = await supabase.rpc('get_conversation_by_participants', {
            p_item_id: itemId,
            p_user_id1: participantIds[0],
            p_user_id2: participantIds[1]
        });
        if (findError) throw findError;
        if (existing && existing.length > 0) {
            return res.status(200).json(existing[0]);
        }
        const { data: newConv, error: createError } = await supabase.rpc('create_conversation', {
            p_item_id: itemId,
            p_participants: participantIds
        });
        if (createError) throw createError;
        res.status(201).json(newConv[0]);
    } catch (error) {
        console.error("Error en ensureConversationExists:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- FUNCIÓN MODIFICADA PARA LA PRUEBA ---
const getMessagesByConversationId = async (req, res) => {
  const { conversationId } = req.params;
  const currentUserId = req.user.id;

  try {
    // Verificamos primero que el usuario actual sea participante de la conversación
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('participant_ids')
      .eq('id', conversationId)
      .single();
    
    if (convError || !conversation) {
      return res.status(404).json({ error: "Conversación no encontrada." });
    }
    
    if (!conversation.participant_ids.includes(currentUserId)) {
      return res.status(403).json({ error: "No tienes permiso para ver estos mensajes." });
    }

    // --- CAMBIO REALIZADO AQUÍ ---
    // Hemos simplificado la consulta para no incluir el JOIN a 'profiles'
    const { data, error } = await supabase
      .from('messages')
      .select('*') // ¡Ya no pedimos 'profiles ( username )'!
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    getOrCreateConversation,
    getMessagesByConversationId,
    ensureConversationExists,
};