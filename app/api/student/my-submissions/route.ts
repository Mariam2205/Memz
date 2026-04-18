import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
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

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.role !== "student" && profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (profile.approved === false) {
      return NextResponse.json(
        { error: "Your account is not approved yet" },
        { status: 403 }
      );
    }

    const { data: submissions, error: submissionsError } = await adminSupabase
      .from("submissions")
      .select("*")
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(10);

    if (submissionsError) {
      return NextResponse.json(
        { error: submissionsError.message || "Failed to load submissions" },
        { status: 500 }
      );
    }

    const assignmentIds = (submissions || []).map((item) => item.assignment_id);

    let assignments: any[] = [];
    if (assignmentIds.length > 0) {
      const { data: assignmentRows } = await adminSupabase
        .from("assignments")
        .select("id, title, session_id")
        .in("id", assignmentIds);

      assignments = assignmentRows || [];
    }

    const sessionIds = assignments.map((item) => item.session_id);

    let sessions: any[] = [];
    if (sessionIds.length > 0) {
      const { data: sessionRows } = await adminSupabase
        .from("sessions")
        .select("id, title, name, course_id")
        .in("id", sessionIds);

      sessions = sessionRows || [];
    }

    const courseIds = sessions.map((item) => item.course_id);

    let courses: any[] = [];
    if (courseIds.length > 0) {
      const { data: courseRows } = await adminSupabase
        .from("courses")
        .select("id, title, name")
        .in("id", courseIds);

      courses = courseRows || [];
    }

    const assignmentMap = new Map(assignments.map((item) => [item.id, item]));
    const sessionMap = new Map(sessions.map((item) => [item.id, item]));
    const courseMap = new Map(courses.map((item) => [item.id, item]));

    const enriched = (submissions || []).map((submission) => {
      const assignment = assignmentMap.get(submission.assignment_id);
      const session = assignment ? sessionMap.get(assignment.session_id) : null;
      const course = session ? courseMap.get(session.course_id) : null;

      return {
        ...submission,
        assignment_title: assignment?.title || "Untitled Assignment",
        session_title: session?.title || session?.name || "Untitled Session",
        course_title: course?.title || course?.name || "Untitled Course",
      };
    });

    return NextResponse.json({
      submissions: enriched,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load submissions" },
      { status: 500 }
    );
  }
}