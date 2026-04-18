import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const { trackId } = await params;

    const { data: track, error: trackError } = await adminSupabase
      .from("tracks")
      .select("*")
      .eq("id", trackId)
      .single();

    if (trackError || !track) {
      return NextResponse.json(
        { error: trackError?.message || "Track not found" },
        { status: 404 }
      );
    }

    const { data: linkedCoursesRows, error: linkedRowsError } =
      await adminSupabase
        .from("track_courses")
        .select("*")
        .eq("track_id", trackId)
        .order("created_at", { ascending: false });

    if (linkedRowsError) {
      return NextResponse.json(
        { error: linkedRowsError.message || "Failed to load track courses" },
        { status: 500 }
      );
    }

    const { data: enrollments, error: enrollmentsError } = await adminSupabase
      .from("track_enrollments")
      .select("*")
      .eq("track_id", trackId)
      .order("created_at", { ascending: false });

    if (enrollmentsError) {
      return NextResponse.json(
        { error: enrollmentsError.message || "Failed to load enrollments" },
        { status: 500 }
      );
    }

    const courseIds = (linkedCoursesRows || []).map((item) => item.course_id);
    const studentIds = (enrollments || []).map((item) => item.student_id);

    let courses: any[] = [];
    let students: any[] = [];

    if (courseIds.length > 0) {
      const { data: courseData, error: courseError } = await adminSupabase
        .from("courses")
        .select("*")
        .in("id", courseIds);

      if (courseError) {
        return NextResponse.json(
          { error: courseError.message || "Failed to load courses" },
          { status: 500 }
        );
      }

      courses = courseData || [];
    }

    if (studentIds.length > 0) {
      const { data: studentData, error: studentError } = await adminSupabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", studentIds);

      if (studentError) {
        return NextResponse.json(
          { error: studentError.message || "Failed to load students" },
          { status: 500 }
        );
      }

      students = studentData || [];
    }

    return NextResponse.json({
      track,
      linkedCoursesRows: linkedCoursesRows || [],
      enrollments: enrollments || [],
      courses,
      students,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load admin track details" },
      { status: 500 }
    );
  }
}