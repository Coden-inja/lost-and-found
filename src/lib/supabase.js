import { createClient } from '@supabase/supabase-js';

// NOTE: Fake UI role toggle used instead of real auth for 2-hour hackathon speed.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
