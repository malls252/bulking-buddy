import { createClient } from "@supabase/supabase-js";

// These will be replaced by Vercel's env variables or .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing. App will fallback to localStorage.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
