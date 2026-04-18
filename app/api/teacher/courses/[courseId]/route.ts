import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

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

    if (profile.role !== "teacher" && profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (profile.approved === false) {
      return NextResponse.json(
        { error: "Your account is not approved yet" },
        { status: 403 }
      );
    }

    if (profile.role === "teacher") {
      const { data: assignment } = await adminSupabase
        .from("course_teachers")
        .select("id")
        .eq("course_id", courseId)
        .eq("teacher_id", user.id)
        .maybeSingle();

      if (!assignment) {
        return NextResponse.json(
          { error: "You are not assigned to this course" },
          { status: 403 }
        );
      }
    }

    const { data: course, error: courseError } = await adminSupabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const { data: sessions, error: sessionsError } = await adminSupabase
      .from("sessions")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true });

    if (sessionsError) {
      return NextResponse.json(
        { error: sessionsError.message || "Failed to load sessions" },
        { status: 500 }
      );
    }

    const { data: enrollments, error: enrollmentsError } = await adminSupabase
      .from("course_enrollments")
      .select("id, student_id, created_at")
      .eq("course_id", courseId);

    if (enrollmentsError) {
      return NextResponse.json(
        { error: enrollmentsError.message || "Failed to load enrollments" },
        { status: 500 }
      );
    }

    const studentIds = (enrollments || []).map((item) => item.student_id);

    let students: any[] = [];

    if (studentIds.length > 0) {
      const { data: studentsData, error: studentsError } = await adminSupabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", studentIds);

      if (studentsError) {
        return NextResponse.json(
          { error: studentsError.message || "Failed to load students" },
          { status: 500 }
        );
      }

      students = studentsData || [];
    }

    return NextResponse.json({
      course,
      sessions: sessions || [],
      enrollments: enrollments || [],
      students,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load teacher course details" },
      { status: 500 }
    );
  }
}