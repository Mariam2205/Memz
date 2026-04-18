import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*");

    if (error) {
      console.error("GET assignments API / sessions error:", error);
      return NextResponse.json(
        { error: error.message, sessions: [] },
        { status: 500 }
      );
    }

    const sessions = Array.isArray(data)
      ? data.map((session: any) => ({
          id: session.id,
          title:
            session.title ??
            session.name ??
            session.session_title ??
            `Session ${session.id}`,
        }))
      : [];

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("GET assignments API unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to load sessions.", sessions: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = {
      session_id: body.session_id,
      title: body.title,
      description: body.description ?? null,
      max_grade:
        body.max_grade === "" || body.max_grade === undefined
          ? null
          : Number(body.max_grade),
      due_at: body.due_at || null,
    };

    if (!payload.session_id || !payload.title) {
      return NextResponse.json(
        { error: "session_id and title are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("assignments")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("POST assignments API insert error:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Assignment created successfully.",
      assignment: data,
    });
  } catch (error) {
    console.error("POST assignments API unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to create assignment." },
      { status: 500 }
    );
  }
}