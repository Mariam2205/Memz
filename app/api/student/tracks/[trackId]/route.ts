import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: { trackId: string } }
) {
  try {
    const { data: track } = await adminSupabase
      .from("tracks")
      .select("*")
      .eq("id", params.trackId)
      .single();

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const { data: trackCourses } = await adminSupabase
      .from("track_courses")
      .select("course_id")
      .eq("track_id", params.trackId);

    const courseIds = (trackCourses || []).map((item) => item.course_id);

    let courses: any[] = [];
    let sessions: any[] = [];
    let assignments: any[] = [];

    if (courseIds.length > 0) {
      const { data: coursesData } = await adminSupabase
        .from("courses")
        .select("*")
        .in("id", courseIds);

      courses = coursesData || [];

      const { data: sessionsData } = await adminSupabase
        .from("sessions")
        .select("id, title, name, description, course_id, created_at")
        .in("course_id", courseIds)
        .order("created_at", { ascending: true });

      sessions = sessionsData || [];

      const sessionIds = sessions.map((item) => item.id);

      if (sessionIds.length > 0) {
        const { data: assignmentsData } = await adminSupabase
          .from("assignments")
          .select("id, title, description, due_at, max_grade, session_id, created_at")
          .in("session_id", sessionIds)
          .order("created_at", { ascending: true });

        assignments = assignmentsData || [];
      }
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

    const sessionsByCourse = new Map<string, any[]>();
    for (const session of sessions) {
      const list = sessionsByCourse.get(session.course_id) || [];
      list.push({
        ...session,
        locked: true,
        assignments: assignmentsBySession.get(session.id) || [],
      });
      sessionsByCourse.set(session.course_id, list);
    }

    const enrichedCourses = courses.map((course) => ({
      ...course,
      locked: true,
      sessions: sessionsByCourse.get(course.id) || [],
    }));

    return NextResponse.json({
      track,
      enrollment: null,
      is_locked: true,
      courses: enrichedCourses,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load track details" },
      { status: 500 }
    );
  }
}