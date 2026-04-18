import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, role } = body;

    if (!user_id || !role) {
      return NextResponse.json(
        { error: "user_id and role are required." },
        { status: 400 }
      );
    }

    if (!["student", "teacher", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user_id)
      .select("id, email, full_name, role, created_at")
      .single();

    if (error) {
      console.error("PATCH update role error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Role updated successfully.",
      user: data,
    });
  } catch (error) {
    console.error("PATCH update role unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to update role." },
      { status: 500 }
    );
  }
}