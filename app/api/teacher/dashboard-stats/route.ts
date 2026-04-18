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

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("id, role, approved")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.approved === false) {
      return NextResponse.json(
        { error: "Your account is not approved yet" },
        { status: 403 }
      );
    }

    let allowedCourseIds: string[] = [];

    if (profile.role === "admin") {
      const { data: allCourses } = await adminSupabase
        .from("courses")
        .select("id");

      allowedCourseIds = (allCourses || []).map((row) => row.id);
    } else if (profile.role === "teacher") {
      const { data: teacherRows } = await adminSupabase
        .from("course_teachers")
        .select("course_id")
        .eq("teacher_id", user.id);

      allowedCourseIds = (teacherRows || []).map((row) => row.course_id);
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (allowedCourseIds.length === 0) {
      return NextResponse.json({
        totalSubmissions: 0,
        graded: 0,
        pending: 0,
      });
    }

    const { data: sessions } = await adminSupabase
      .from("sessions")
      .select("id, course_id")
      .in("course_id", allowedCourseIds);

    const sessionIds = (sessions || []).map((row) => row.id);

    if (sessionIds.length === 0) {
      return NextResponse.json({
        totalSubmissions: 0,
        graded: 0,
        pending: 0,
      });
    }

    const { data: assignments } = await adminSupabase
      .from("assignments")
      .select("id, session_id")
      .in("session_id", sessionIds);

    const assignmentIds = (assignments || []).map((row) => row.id);

    if (assignmentIds.length === 0) {
      return NextResponse.json({
        totalSubmissions: 0,
        graded: 0,
        pending: 0,
      });
    }

    const { data: submissions, error: submissionsError } = await adminSupabase
      .from("submissions")
      .select("id, grade")
      .in("assignment_id", assignmentIds);

    if (submissionsError) {
      return NextResponse.json(
        { error: submissionsError.message || "Failed to load stats" },
        { status: 500 }
      );
    }

    const totalSubmissions = submissions?.length || 0;
    const graded = (submissions || []).filter(
      (item) => item.grade !== null && item.grade !== undefined
    ).length;
    const pending = totalSubmissions - graded;

    return NextResponse.json({
      totalSubmissions,
      graded,
      pending,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}