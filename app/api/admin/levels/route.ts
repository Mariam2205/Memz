import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from("levels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load levels" },
        { status: 500 }
      );
    }

    return NextResponse.json({ levels: data || [] });
  } catch {
    return NextResponse.json(
      { error: "Failed to load levels" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const title = body.title?.trim() || "";
    const name = body.name?.trim() || title;
    const description = body.description?.trim() || null;

    if (!title && !name) {
      return NextResponse.json(
        { error: "Level title is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase.from("levels").insert([
      {
        title: title || name,
        name: name || title,
        description,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create level" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to create level" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const id = body.id?.trim();
    const title = body.title?.trim() || "";
    const name = body.name?.trim() || title;
    const description = body.description?.trim() || null;

    if (!id || (!title && !name)) {
      return NextResponse.json(
        { error: "id and title are required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("levels")
      .update({
        title: title || name,
        name: name || title,
        description,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update level" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update level" },
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
        { error: "Level id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase.from("levels").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete level" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete level" },
      { status: 500 }
    );
  }
}