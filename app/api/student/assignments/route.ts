import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
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

    const courseId = req.nextUrl.searchParams.get("courseId");

    const { data: enrollments } = await adminSupabase
      .from("course_enrollments")
      .select("course_id")
      .eq("student_id", user.id);

    let allowedCourseIds = (enrollments || []).map((item) => item.course_id);

    if (profile.role === "admin" && allowedCourseIds.length === 0) {
      const { data: allCourses } = await adminSupabase.from("courses").select("id");
      allowedCourseIds = (allCourses || []).map((item) => item.id);
    }

    if (courseId) {
      allowedCourseIds = allowedCourseIds.filter((id) => id === courseId);
    }

    if (allowedCourseIds.length === 0) {
      return NextResponse.json({ assignments: [] });
    }

    const { data: sessions } = await adminSupabase
      .from("sessions")
      .select("id, title, name, course_id")
      .in("course_id", allowedCourseIds);

    const sessionIds = (sessions || []).map((item) => item.id);

    if (sessionIds.length === 0) {
      return NextResponse.json({ assignments: [] });
    }

    const { data: assignments, error } = await adminSupabase
      .from("assignments")
      .select("*")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load assignments" },
        { status: 500 }
      );
    }

    const sessionMap = new Map((sessions || []).map((item) => [item.id, item]));

    const enriched = (assignments || []).map((assignment) => {
      const session = sessionMap.get(assignment.session_id);

      return {
        ...assignment,
        session_title: session?.title || session?.name || "Untitled Session",
        course_id: session?.course_id || null,
      };
    });

    return NextResponse.json({
      assignments: enriched,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load assignments" },
      { status: 500 }
    );
  }
}