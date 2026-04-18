import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: courses, error: coursesError } = await adminSupabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: tracks, error: tracksError } = await adminSupabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false });

    if (coursesError || tracksError) {
      return NextResponse.json(
        { error: "Failed to load catalog" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      courses: (courses || []).map((course) => ({
        ...course,
        enrollment: null,
      })),
      tracks: (tracks || []).map((track) => ({
        ...track,
        enrollment: null,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load catalog" },
      { status: 500 }
    );
  }
}