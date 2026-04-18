import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: sessions, error } = await adminSupabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load sessions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessions: sessions || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const title = body.title?.trim();
    const description = body.description?.trim() || null;
    const course_id = body.course_id || null;

    if (!title) {
      return NextResponse.json(
        { error: "Session title is required" },
        { status: 400 }
      );
    }

    const { data, error } = await adminSupabase
      .from("sessions")
      .insert([
        {
          title,
          description,
          course_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const id = body.id?.trim();
    const title = body.title?.trim();
    const description = body.description?.trim() || null;
    const course_id = body.course_id || null;

    if (!id || !title) {
      return NextResponse.json(
        { error: "id and title are required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("sessions")
      .update({
        title,
        description,
        course_id,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "Session id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase.from("sessions").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}