const supabase = require('../config/supabaseClient');

const getOrCreateConversation = async (req, res) => {
  // ... (toda la lógica de la función)
};

const getMessagesByConversationId = async (req, res) => {
  // ... (toda la lógica de la función)
};

// --- LA EXPORTACIÓN DEBE SER ASÍ ---
module.exports = {
    getOrCreateConversation,
    getMessagesByConversationId,
};