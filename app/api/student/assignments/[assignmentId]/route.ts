import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params;

    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", assignmentId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message, assignment: null },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ assignment: null });
    }

    const assignment = {
      id: data.id,
      title: data.title ?? `Assignment ${data.id}`,
      description: data.description ?? null,
      max_grade: data.max_grade ?? null,
      due_at: data.due_at ?? null,
      session_id: data.session_id ?? null,
    };

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("GET student assignment detail error:", error);
    return NextResponse.json(
      { error: "Failed to load assignment.", assignment: null },
      { status: 500 }
    );
  }
}