import { createClient } from "@supabase/supabase-js";

// These will be replaced by Vercel's env variables or .env file
// Use placeholders if env vars are missing to prevent crash, though calls will fail
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials missing. App will fallback to localStorage.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
