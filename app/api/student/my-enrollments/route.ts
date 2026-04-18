import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
const supabase = createSupabaseServerClient();
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

    const { data: courseEnrollments, error: courseEnrollmentsError } =
      await adminSupabase
        .from("course_enrollments")
        .select(`
          id,
          course_id,
          student_id,
          created_at,
          payment_method,
          payment_status,
          payment_reference,
          payment_notes,
          approved_by,
          approved_at,
          enrollment_status
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

    if (courseEnrollmentsError) {
      return NextResponse.json(
        { error: courseEnrollmentsError.message || "Failed to load course enrollments" },
        { status: 500 }
      );
    }

    const { data: trackEnrollments, error: trackEnrollmentsError } =
      await adminSupabase
        .from("track_enrollments")
        .select(`
          id,
          track_id,
          student_id,
          created_at,
          payment_method,
          payment_status,
          payment_reference,
          payment_notes,
          approved_by,
          approved_at,
          enrollment_status
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

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

    return NextResponse.json({
      courseEnrollments: courseEnrollments || [],
      trackEnrollments: trackEnrollments || [],
      courses,
      tracks,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load enrollments" },
      { status: 500 }
    );
  }
}