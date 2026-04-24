import { NextRequest, NextResponse } from "next/server";
import { adminSupabase, getUserFromRequest } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const { user, error: userError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: userError || "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("id, role, approved")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({
        courseEnrollments: [],
        trackEnrollments: [],
        courses: [],
        tracks: [],
      });
    }

    if (profile.approved === false) {
      return NextResponse.json(
        { error: "Your account is not approved yet" },
        { status: 403 }
      );
    }

    const { data: courseEnrollments } = await adminSupabase
      .from("course_enrollments")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    const { data: trackEnrollments } = await adminSupabase
      .from("track_enrollments")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    const courseIds = (courseEnrollments || []).map((item) => item.course_id);
    const trackIds = (trackEnrollments || []).map((item) => item.track_id);

    let courses: any[] = [];
    let tracks: any[] = [];

    if (courseIds.length > 0) {
      const { data } = await adminSupabase
        .from("courses")
        .select("*")
        .in("id", courseIds);

      courses = data || [];
    }

    if (trackIds.length > 0) {
      const { data } = await adminSupabase
        .from("tracks")
        .select("*")
        .in("id", trackIds);

      tracks = data || [];
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