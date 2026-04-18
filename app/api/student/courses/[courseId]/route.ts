import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { data: course } = await adminSupabase
      .from("courses")
      .select("*")
      .eq("id", params.courseId)
      .single();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { data: sessions } = await adminSupabase
      .from("sessions")
      .select("id, title, name, description, course_id, created_at")
      .eq("course_id", params.courseId)
      .order("created_at", { ascending: true });

    const sessionIds = (sessions || []).map((s) => s.id);

    let assignments: any[] = [];
    if (sessionIds.length > 0) {
      const { data } = await adminSupabase
        .from("assignments")
        .select("id, title, description, due_at, max_grade, session_id")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: true });

      assignments = data || [];
    }

    const assignmentsBySession = new Map<string, any[]>();

    for (const assignment of assignments) {
      const list = assignmentsBySession.get(assignment.session_id) || [];
      list.push({
        ...assignment,
        locked: true,
      });
      assignmentsBySession.set(assignment.session_id, list);
    }

    const enrichedSessions = (sessions || []).map((session: any) => ({
      ...session,
      locked: true,
      assignments: assignmentsBySession.get(session.id) || [],
    }));

    return NextResponse.json({
      course,
      enrollment: null,
      is_locked: true,
      sessions: enrichedSessions,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load course details" },
      { status: 500 }
    );
  }
}