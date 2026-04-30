import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getBearerToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth.replace("Bearer ", "");
}

export async function POST(req: NextRequest) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();

    const course_id = body.course_id;
    const payment_method = body.payment_method || "manual";
    const payment_reference = body.payment_reference || null;
    const payment_notes = body.payment_notes || null;

    if (!course_id) {
      return NextResponse.json(
        { error: "Course id is required" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("course_enrollments")
      .select("*")
      .eq("course_id", course_id)
      .eq("student_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        enrollment: existing,
        message: "You already requested enrollment.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("course_enrollments")
      .insert([
        {
          course_id,
          student_id: user.id,
          payment_method,
          payment_reference,
          payment_notes,
          payment_status: "pending",
          enrollment_status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to enroll" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enrollment: data,
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}