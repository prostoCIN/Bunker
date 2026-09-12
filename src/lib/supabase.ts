import { createClient } from "@supabase/supabase-js";

// Fallback to project credentials so it works seamlessly on Vercel
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://xlqsgbtcsnnvcncxbusb.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_6ooqW_SzfnQBJb6ElXi2sQ_3LYQLpK1";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
