import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role, full_name } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "email and role are required." },
        { status: 400 }
      );
    }

    if (!["teacher", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "role must be teacher or admin." },
        { status: 400 }
      );
    }

    // Optional lightweight caller check using current session email.
    // Replace with your stronger role-checking flow later.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { data: callerProfile, error: callerProfileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (callerProfileError || !callerProfile || callerProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can invite users." },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          role,
          full_name: full_name ?? null,
        },
        redirectTo: "http://localhost:3000/login",
      }
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (data.user) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert([
          {
            id: data.user.id,
            email,
            full_name: full_name ?? null,
            role,
          },
        ]);

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "Invite sent successfully.",
      user: data.user,
    });
  } catch (error) {
    console.error("Invite user error:", error);
    return NextResponse.json(
      { error: "Failed to invite user." },
      { status: 500 }
    );
  }
}