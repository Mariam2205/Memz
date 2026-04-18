import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: tracks, error: tracksError } = await adminSupabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false });

    if (tracksError) {
      return NextResponse.json(
        { error: tracksError.message || "Failed to load tracks" },
        { status: 500 }
      );
    }

    const { data: courses, error: coursesError } = await adminSupabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (coursesError) {
      return NextResponse.json(
        { error: coursesError.message || "Failed to load courses" },
        { status: 500 }
      );
    }

    const { data: assignments, error: assignmentsError } = await adminSupabase
      .from("track_courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (assignmentsError) {
      return NextResponse.json(
        { error: assignmentsError.message || "Failed to load assignments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tracks: tracks || [],
      courses: courses || [],
      assignments: assignments || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load track-course data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { track_id, course_id } = body;

    if (!track_id || !course_id) {
      return NextResponse.json(
        { error: "track_id and course_id are required" },
        { status: 400 }
      );
    }

    const { data: existing } = await adminSupabase
      .from("track_courses")
      .select("id")
      .eq("track_id", track_id)
      .eq("course_id", course_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Course already linked to this track",
      });
    }

    const { error } = await adminSupabase.from("track_courses").insert([
      {
        track_id,
        course_id,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to assign course to track" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course linked to track successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to assign course to track" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Assignment id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("track_courses")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to remove assignment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Assignment removed successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove assignment" },
      { status: 500 }
    );
  }
}