import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const { data: session, error: sessionError } = await adminSupabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: sessionError?.message || "Session not found" },
        { status: 404 }
      );
    }

    const { data: assignments, error: assignmentsError } = await adminSupabase
      .from("assignments")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (assignmentsError) {
      return NextResponse.json(
        { error: assignmentsError.message || "Failed to load assignments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session,
      assignments: assignments || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load session details" },
      { status: 500 }
    );
  }
}