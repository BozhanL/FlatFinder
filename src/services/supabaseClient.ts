import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://umkqmotlfupohzavbumf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVta3Ftb3RsZnVwb2h6YXZidW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzEzNzcsImV4cCI6MjA3NTk0NzM3N30._mcxpbhrVCEdIw2DdiEpgrPTgKGdWJSDcVD4eu4dD0U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);