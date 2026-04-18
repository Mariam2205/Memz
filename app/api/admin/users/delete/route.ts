import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId?.trim();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // delete app-facing profile first
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message || "Failed to delete profile" },
        { status: 500 }
      );
    }

    // delete auth account from Supabase Auth
    const { error: authDeleteError } =
      await adminSupabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      return NextResponse.json(
        { error: authDeleteError.message || "Failed to delete auth user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted from the system successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}