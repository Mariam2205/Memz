import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("id, role, approved")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.approved === false) {
      return NextResponse.json(
        { error: "Your account is not approved yet" },
        { status: 403 }
      );
    }

    if (profile.role === "admin") {
      const { data: courses, error } = await adminSupabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: error.message || "Failed to load courses" },
          { status: 500 }
        );
      }

      return NextResponse.json({ courses: courses || [] });
    }

    if (profile.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: teacherRows, error: teacherRowsError } = await adminSupabase
      .from("course_teachers")
      .select("course_id")
      .eq("teacher_id", user.id);

    if (teacherRowsError) {
      return NextResponse.json(
        { error: teacherRowsError.message || "Failed to load teacher courses" },
        { status: 500 }
      );
    }

    const courseIds = (teacherRows || []).map((row) => row.course_id);

    if (courseIds.length === 0) {
      return NextResponse.json({ courses: [] });
    }

    const { data: courses, error: coursesError } = await adminSupabase
      .from("courses")
      .select("*")
      .in("id", courseIds)
      .order("created_at", { ascending: false });

    if (coursesError) {
      return NextResponse.json(
        { error: coursesError.message || "Failed to load courses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      courses: courses || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load teacher courses" },
      { status: 500 }
    );
  }
}