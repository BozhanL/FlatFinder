import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

type ExpoExtra = {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
};

const extra = Constants.expoConfig?.extra as ExpoExtra | undefined;

const URL =
  process.env["EXPO_PUBLIC_SUPABASE_URL"] ?? extra?.EXPO_PUBLIC_SUPABASE_URL;

const KEY =
  process.env["EXPO_PUBLIC_SUPABASE_ANON_KEY"] ??
  extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  throw new Error(
    `Supabase env missing. URL=${String(URL)} KEY=${KEY ? "****" : "MISSING"}\n` +
      `Check app.config.ts -> extra or your .env.`,
  );
}

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: false },
});
