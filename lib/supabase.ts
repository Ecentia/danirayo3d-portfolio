import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Definimos el cliente para uso en el navegador
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
};