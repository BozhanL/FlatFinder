import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const URL =
  process.env["EXPO_PUBLIC_SUPABASE_URL"] ??
  (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_SUPABASE_URL;

const KEY =
  process.env["EXPO_PUBLIC_SUPABASE_ANON_KEY"] ??
  (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  throw new Error(
    `Supabase env missing. URL=${String(URL)} KEY=${KEY ? "****" : "MISSING"}\n` +
      `Check app.config.ts -> extra or your .env.`
  );
}

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});
