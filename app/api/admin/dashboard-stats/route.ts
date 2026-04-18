import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { count: users } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: students } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student");

    const { count: courses } = await supabaseAdmin
      .from("courses")
      .select("*", { count: "exact", head: true });

    const { count: sessions } = await supabaseAdmin
      .from("sessions")
      .select("*", { count: "exact", head: true });

    const { count: assignments } = await supabaseAdmin
      .from("assignments")
      .select("*", { count: "exact", head: true });

    const { count: submissions } = await supabaseAdmin
      .from("submissions")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      users: users || 0,
      students: students || 0,
      courses: courses || 0,
      sessions: sessions || 0,
      assignments: assignments || 0,
      submissions: submissions || 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}