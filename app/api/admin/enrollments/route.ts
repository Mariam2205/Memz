import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from("course_enrollments")
      .select(
        `
        *,
        courses(id, title, name),
        profiles(id, email, full_name)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message, enrollments: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({ enrollments: data || [] });
  } catch {
    return NextResponse.json(
      { error: "Failed to load enrollments", enrollments: [] },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Enrollment id required" }, { status: 400 });
    }

    const updateData = {
      enrollment_status: body.enrollment_status,
      payment_status: body.payment_status,
      approved_at: body.enrollment_status === "approved" ? new Date().toISOString() : null,
    };

    const { error } = await adminSupabase
      .from("course_enrollments")
      .update(updateData)
      .eq("id", body.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update enrollment" },
      { status: 500 }
    );
  }
}