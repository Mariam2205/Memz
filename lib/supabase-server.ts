import { createClient } from "@supabase/supabase-js";

export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing authorization token" };
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return { user: null, error: "Missing authorization token" };
  }

  const {
    data: { user },
    error,
  } = await adminSupabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: error?.message || "Unauthorized" };
  }

  return { user, error: null };
}