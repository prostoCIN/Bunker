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

// Custom fetch that proxies browser REST calls through Next.js /api/supabase rewrite.
// This completely bypasses CORS restrictions, browser ad-blockers (Brave/uBlock), and firewall issues.
const customFetch: typeof fetch = (input, init) => {
  if (typeof window !== "undefined") {
    if (typeof input === "string" && input.startsWith(supabaseUrl)) {
      const proxiedUrl = input.replace(supabaseUrl, "/api/supabase");
      return fetch(proxiedUrl, init);
    }
    if (input instanceof URL && input.href.startsWith(supabaseUrl)) {
      const proxiedUrl = input.href.replace(supabaseUrl, "/api/supabase");
      return fetch(proxiedUrl, init);
    }
    if (input instanceof Request && input.url.startsWith(supabaseUrl)) {
      const proxiedUrl = input.url.replace(supabaseUrl, "/api/supabase");
      return fetch(new Request(proxiedUrl, input), init);
    }
  }
  return fetch(input, init);
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: customFetch,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
