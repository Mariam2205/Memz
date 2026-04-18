import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const assignmentId = body.assignment_id;
    const submissionText = body.submission_text ?? null;
    const fileUrl = body.file_url ?? null;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!assignmentId) {
      return NextResponse.json(
        { error: "assignment_id is required." },
        { status: 400 }
      );
    }

    const { data: assignment } = await adminSupabase
      .from("assignments")
      .select("id, session_id")
      .eq("id", assignmentId)
      .single();

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      );
    }

    const { data: session } = await adminSupabase
      .from("sessions")
      .select("id, course_id")
      .eq("id", assignment.session_id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 }
      );
    }

    const { data: enrollment } = await adminSupabase
      .from("course_enrollments")
      .select("id, enrollment_status")
      .eq("course_id", session.course_id)
      .eq("student_id", user.id)
      .maybeSingle();

    if (!enrollment || enrollment.enrollment_status !== "active") {
      return NextResponse.json(
        { error: "You must be actively enrolled to submit assignments." },
        { status: 403 }
      );
    }

    const payload = {
      assignment_id: assignmentId,
      student_id: user.id,
      submission_text: submissionText,
      file_url: fileUrl,
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await adminSupabase
      .from("submissions")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Submission created successfully.",
      submission: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create submission." },
      { status: 500 }
    );
  }
}