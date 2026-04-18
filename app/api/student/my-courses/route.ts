import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const supabase =  createSupabaseServerClient();

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

    const { data: courseEnrollments, error: courseEnrollmentsError } =
      await adminSupabase
        .from("course_enrollments")
        .select("id, course_id")
        .eq("student_id", user.id);

    if (courseEnrollmentsError) {
      return NextResponse.json(
        { error: courseEnrollmentsError.message || "Failed to load course enrollments" },
        { status: 500 }
      );
    }

    const { data: trackEnrollments, error: trackEnrollmentsError } =
      await adminSupabase
        .from("track_enrollments")
        .select("id, track_id")
        .eq("student_id", user.id);

    if (trackEnrollmentsError) {
      return NextResponse.json(
        { error: trackEnrollmentsError.message || "Failed to load track enrollments" },
        { status: 500 }
      );
    }

    const courseIds = (courseEnrollments || []).map((item) => item.course_id);
    const trackIds = (trackEnrollments || []).map((item) => item.track_id);

    let courses: any[] = [];
    let tracks: any[] = [];

    if (courseIds.length > 0) {
      const { data: coursesData, error: coursesError } = await adminSupabase
        .from("courses")
        .select("*")
        .in("id", courseIds);

      if (coursesError) {
        return NextResponse.json(
          { error: coursesError.message || "Failed to load courses" },
          { status: 500 }
        );
      }

      courses = coursesData || [];
    }

    if (trackIds.length > 0) {
      const { data: tracksData, error: tracksError } = await adminSupabase
        .from("tracks")
        .select("*")
        .in("id", trackIds);

      if (tracksError) {
        return NextResponse.json(
          { error: tracksError.message || "Failed to load tracks" },
          { status: 500 }
        );
      }

      tracks = tracksData || [];
    }

    const { data: sessions } = await adminSupabase
      .from("sessions")
      .select("id, course_id")
      .in(
        "course_id",
        courseIds.length > 0 ? courseIds : ["00000000-0000-0000-0000-000000000000"]
      );

    const sessionIds = (sessions || []).map((item) => item.id);

    let assignments: any[] = [];
    if (sessionIds.length > 0) {
      const { data: assignmentsData } = await adminSupabase
        .from("assignments")
        .select("id, session_id")
        .in("session_id", sessionIds);

      assignments = assignmentsData || [];
    }

    const assignmentIds = assignments.map((item: any) => item.id);

    let submissions: any[] = [];
    if (assignmentIds.length > 0) {
      const { data: submissionsData } = await adminSupabase
        .from("submissions")
        .select("id, assignment_id, grade, student_id")
        .eq("student_id", user.id)
        .in("assignment_id", assignmentIds);

      submissions = submissionsData || [];
    }

    const sessionsByCourse = new Map<string, string[]>();
    for (const session of sessions || []) {
      const list = sessionsByCourse.get(session.course_id) || [];
      list.push(session.id);
      sessionsByCourse.set(session.course_id, list);
    }

    const assignmentsBySession = new Map<string, string[]>();
    for (const assignment of assignments || []) {
      const list = assignmentsBySession.get(assignment.session_id) || [];
      list.push(assignment.id);
      assignmentsBySession.set(assignment.session_id, list);
    }

    const submissionsByAssignment = new Map<string, any[]>();
    for (const submission of submissions || []) {
      const list = submissionsByAssignment.get(submission.assignment_id) || [];
      list.push(submission);
      submissionsByAssignment.set(submission.assignment_id, list);
    }

    const enrichedCourses = (courses || []).map((course) => {
      const sessionIdsForCourse = sessionsByCourse.get(course.id) || [];

      let totalAssignments = 0;
      let submittedCount = 0;
      let reviewedCount = 0;

      for (const sessionId of sessionIdsForCourse) {
        const assignmentIdsForSession = assignmentsBySession.get(sessionId) || [];
        totalAssignments += assignmentIdsForSession.length;

        for (const assignmentId of assignmentIdsForSession) {
          const assignmentSubmissions = submissionsByAssignment.get(assignmentId) || [];
          if (assignmentSubmissions.length > 0) {
            submittedCount += 1;

            if (
              assignmentSubmissions.some(
                (submission) =>
                  submission.grade !== null && submission.grade !== undefined
              )
            ) {
              reviewedCount += 1;
            }
          }
        }
      }

      return {
        ...course,
        total_assignments: totalAssignments,
        submission_count: submittedCount,
        reviewed_count: reviewedCount,
        pending_count: Math.max(submittedCount - reviewedCount, 0),
        completion_percent:
          totalAssignments > 0
            ? Math.round((submittedCount / totalAssignments) * 100)
            : 0,
      };
    });

    return NextResponse.json({
      courses: enrichedCourses,
      tracks: tracks || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load student progress data" },
      { status: 500 }
    );
  }
}