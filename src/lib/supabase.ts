"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy, null-safe client. Returns null if env is not configured, so the UI can
// degrade gracefully instead of crashing the build.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key);
  return client;
}

export type Comment = {
  id: string;
  name: string | null;
  body: string;
  created_at: string;
};
