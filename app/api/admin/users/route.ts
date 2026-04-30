import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json(
        { error: authError.message, users: [] },
        { status: 500 }
      );
    }

    const { data: profiles, error: profilesError } = await adminSupabase
      .from("profiles")
      .select("id, email, full_name, role, approved, created_at");

    if (profilesError) {
      return NextResponse.json(
        { error: profilesError.message, users: [] },
        { status: 500 }
      );
    }

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const users = (authData.users || []).map((user) => {
      const profile = profileMap.get(user.id);

      return {
        id: user.id,
        email: profile?.email || user.email,
        full_name:
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email ||
          "Unnamed User",
        role: profile?.role || "student",
        approved: profile?.approved ?? false,
        created_at: profile?.created_at || user.created_at,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET admin users unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to load users.", users: [] },
      { status: 500 }
    );
  }
}