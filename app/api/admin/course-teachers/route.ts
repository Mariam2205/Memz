import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET → fetch courses, teachers, assignments
export async function GET() {
  try {
    const { data: courses } = await supabase.from("courses").select("id, title, name");
    const { data: teachers } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "teacher");

    const { data: assignments } = await supabase
      .from("course_teachers")
      .select("id, course_id, teacher_id");

    return NextResponse.json({ courses, teachers, assignments });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

// POST → assign teacher to course
export async function POST(req: Request) {
  try {
    const { course_id, teacher_id } = await req.json();

    const { error } = await supabase.from("course_teachers").insert([
      {
        course_id,
        teacher_id,
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to assign teacher" }, { status: 500 });
  }
}

// DELETE → remove assignment
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const { error } = await supabase
      .from("course_teachers")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to remove assignment" }, { status: 500 });
  }
}