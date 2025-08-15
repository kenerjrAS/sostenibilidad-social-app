// controllers/conversationController.js
const supabase = require('../config/supabaseClient');

const getOrCreateConversation = async (req, res) => {
    // Esta función la mantendremos por si la necesitamos en el futuro, pero no la usaremos ahora
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

const getMessagesByConversationId = async (req, res) => {
    // ... tu lógica existente para obtener mensajes
};

// --- NUEVA FUNCIÓN PARA EL FLUJO ASÍNCRONO ---
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

module.exports = {
    getOrCreateConversation,
    getMessagesByConversationId,
    ensureConversationExists // <-- La exportamos
};