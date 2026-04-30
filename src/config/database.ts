import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Database] SUPABASE_URL ou SUPABASE_KEY não configurados. O banco não funcionará.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);