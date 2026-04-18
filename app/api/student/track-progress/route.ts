import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: trackEnrollments, error: trackEnrollmentsError } =
      await adminSupabase
        .from("track_enrollments")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

    if (trackEnrollmentsError) {
      return NextResponse.json(
        { error: trackEnrollmentsError.message || "Failed to load track enrollments" },
        { status: 500 }
      );
    }

    const trackIds = (trackEnrollments || []).map((item) => item.track_id);

    let tracks: any[] = [];
    let trackCourses: any[] = [];
    let courseIds: string[] = [];

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

      const { data: trackCoursesData, error: trackCoursesError } =
        await adminSupabase
          .from("track_courses")
          .select("*")
          .in("track_id", trackIds);

      if (trackCoursesError) {
        return NextResponse.json(
          { error: trackCoursesError.message || "Failed to load track courses" },
          { status: 500 }
        );
      }

      trackCourses = trackCoursesData || [];
      courseIds = [...new Set(trackCourses.map((row) => row.course_id))];
    }

    let courses: any[] = [];
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

    let courseEnrollments: any[] = [];
    if (courseIds.length > 0) {
      const { data: courseEnrollmentsData, error: courseEnrollmentsError } =
        await adminSupabase
          .from("course_enrollments")
          .select("*")
          .eq("student_id", user.id)
          .in("course_id", courseIds);

      if (courseEnrollmentsError) {
        return NextResponse.json(
          { error: courseEnrollmentsError.message || "Failed to load course enrollments" },
          { status: 500 }
        );
      }

      courseEnrollments = courseEnrollmentsData || [];
    }

    return NextResponse.json({
      trackEnrollments: trackEnrollments || [],
      tracks,
      trackCourses,
      courses,
      courseEnrollments,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load track progress" },
      { status: 500 }
    );
  }
}