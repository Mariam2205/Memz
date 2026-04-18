import { supabase } from "@/lib/supabase";

export function createSupabaseServerClient() {
  return supabase;
}