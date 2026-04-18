import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load subjects" },
        { status: 500 }
      );
    }

    return NextResponse.json({ subjects: data || [] });
  } catch {
    return NextResponse.json(
      { error: "Failed to load subjects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const title = body.title?.trim();
    const name = body.name?.trim() || title;
    const description = body.plainDescription?.trim() || body.description?.trim() || null;
    const description_html = body.descriptionHtml || null;

    if (!title && !name) {
      return NextResponse.json(
        { error: "Subject title is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase.from("subjects").insert([
      {
        title: title || name,
        name: name || title,
        description,
        description_html,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create subject" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const id = body.id?.trim();
    const title = body.title?.trim();
    const name = body.name?.trim() || title;
    const description = body.plainDescription?.trim() || body.description?.trim() || null;
    const description_html = body.descriptionHtml || null;

    if (!id || (!title && !name)) {
      return NextResponse.json(
        { error: "id and title are required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("subjects")
      .update({
        title: title || name,
        name: name || title,
        description,
        description_html,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update subject" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update subject" },
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
        { error: "Subject id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("subjects")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete subject" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}