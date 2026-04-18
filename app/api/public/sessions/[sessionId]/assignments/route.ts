import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message, session: null, assignments: [] },
        { status: 500 }
      );
    }

    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from("assignments")
      .select("*")
      .eq("session_id", sessionId);

    if (assignmentsError) {
      return NextResponse.json(
        { error: assignmentsError.message, session: null, assignments: [] },
        { status: 500 }
      );
    }

    const session = sessionData
      ? {
          id: sessionData.id,
          title: sessionData.title ?? sessionData.name ?? `Session ${sessionData.id}`,
          description: sessionData.description ?? null,
          course_id: sessionData.course_id ?? null,
        }
      : null;

    const assignments = Array.isArray(assignmentsData)
      ? assignmentsData.map((assignment: any) => ({
          id: assignment.id,
          title: assignment.title ?? `Assignment ${assignment.id}`,
          description: assignment.description ?? null,
          max_grade: assignment.max_grade ?? null,
          due_at: assignment.due_at ?? null,
          session_id: assignment.session_id,
        }))
      : [];

    return NextResponse.json({ session, assignments });
  } catch (error) {
    console.error("GET session assignments unexpected error:", error);
    return NextResponse.json(
      {
        error: "Failed to load session assignments.",
        session: null,
        assignments: [],
      },
      { status: 500 }
    );
  }
}