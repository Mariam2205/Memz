import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("id, role, approved")
      .eq("id", user.id)
      .single();

    if (!profile || profile.approved === false) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (profile.role !== "teacher" && profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: session, error: sessionError } = await adminSupabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (profile.role === "teacher") {
      const { data: allowed } = await adminSupabase
        .from("course_teachers")
        .select("id")
        .eq("course_id", session.course_id)
        .eq("teacher_id", user.id)
        .maybeSingle();

      if (!allowed) {
        return NextResponse.json(
          { error: "You are not assigned to this course" },
          { status: 403 }
        );
      }
    }

    const { data: assignments, error: assignmentsError } = await adminSupabase
      .from("assignments")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (assignmentsError) {
      return NextResponse.json(
        { error: assignmentsError.message || "Failed to load assignments" },
        { status: 500 }
      );
    }

    const assignmentIds = (assignments || []).map((a) => a.id);

    let submissions: any[] = [];
    if (assignmentIds.length > 0) {
      const { data: submissionRows } = await adminSupabase
        .from("submissions")
        .select("id, assignment_id, grade")
        .in("assignment_id", assignmentIds);

      submissions = submissionRows || [];
    }

    return NextResponse.json({
      session,
      assignments: assignments || [],
      submissions,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load teacher session details" },
      { status: 500 }
    );
  }
}