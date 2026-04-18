import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase.from("courses").select("*");

    if (error) {
      console.error("GET public courses error:", error);
      return NextResponse.json(
        { error: error.message, courses: [] },
        { status: 500 }
      );
    }

    const courses = Array.isArray(data)
      ? data.map((course: any) => ({
          id: course.id,
          title: course.title ?? course.name ?? `Course ${course.id}`,
          description: course.description ?? null,
          subject_id: course.subject_id ?? null,
          level_id: course.level_id ?? null,
          created_at: course.created_at ?? null,
        }))
      : [];

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("GET public courses unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to load courses.", courses: [] },
      { status: 500 }
    );
  }
}