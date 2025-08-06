// config/supabaseClient.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Carga las variables de entorno

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Error Crítico: La URL o la Service Key de Supabase no se encuentran en el archivo .env");
}

// --- LA SOLUCIÓN DEFINITIVA ESTÁ AQUÍ ---
// Creamos el cliente de Supabase con opciones explícitas para un entorno de servidor.
// Esto previene que el cliente intente manejar sesiones, lo que puede causar bloqueos.
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});
// ------------------------------------

module.exports = supabase;