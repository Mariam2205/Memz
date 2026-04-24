import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/supabase-server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { user, error } = await getUserFromRequest(request);

    if (error || !user) {
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

    const { data: courseEnrollments } = await adminSupabase
      .from("course_enrollments")
      .select("course_id")
      .eq("student_id", user.id);

    const courseIds = (courseEnrollments || []).map((item) => item.course_id);

    if (courseIds.length === 0) {
      return NextResponse.json({
        totalAssignments: 0,
        mySubmissions: 0,
        reviewed: 0,
        pendingReview: 0,
      });
    }

    const { data: sessions } = await adminSupabase
      .from("sessions")
      .select("id")
      .in("course_id", courseIds);

    const sessionIds = (sessions || []).map((item) => item.id);

    let assignments: any[] = [];

    if (sessionIds.length > 0) {
      const { data: assignmentRows } = await adminSupabase
        .from("assignments")
        .select("id")
        .in("session_id", sessionIds);

      assignments = assignmentRows || [];
    }

    const assignmentIds = assignments.map((item) => item.id);

    let submissions: any[] = [];

    if (assignmentIds.length > 0) {
      const { data: submissionRows } = await adminSupabase
        .from("submissions")
        .select("id, grade")
        .eq("student_id", user.id)
        .in("assignment_id", assignmentIds);

      submissions = submissionRows || [];
    }

    const totalAssignments = assignmentIds.length;
    const mySubmissions = submissions.length;
    const reviewed = submissions.filter(
      (item) => item.grade !== null && item.grade !== undefined
    ).length;
    const pendingReview = mySubmissions - reviewed;

    return NextResponse.json({
      totalAssignments,
      mySubmissions,
      reviewed,
      pendingReview,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}