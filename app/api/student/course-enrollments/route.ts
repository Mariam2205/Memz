import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_PAYMENT_METHODS = ["cash_wallet", "instapay"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const courseId = body.courseId;
    const paymentMethod = body.paymentMethod;
    const paymentReference = body.paymentReference ?? null;
    const paymentNotes = body.paymentNotes ?? null;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "paymentMethod must be cash_wallet or instapay" },
        { status: 400 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existing } = await adminSupabase
      .from("course_enrollments")
      .select("id, enrollment_status, payment_status")
      .eq("course_id", courseId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Enrollment request already exists",
        enrollment: existing,
      });
    }

    const { data, error } = await adminSupabase
      .from("course_enrollments")
      .insert([
        {
          course_id: courseId,
          student_id: user.id,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          payment_notes: paymentNotes,
          payment_status: "submitted",
          enrollment_status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create enrollment request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Enrollment request submitted successfully",
      enrollment: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create enrollment request" },
      { status: 500 }
    );
  }
}