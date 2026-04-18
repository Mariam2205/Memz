import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/slugify";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    let query = supabaseAdmin
      .from("tracks")
      .select(
        `
        id,
        title,
        name,
        slug,
        description,
        description_html,
        subject_id,
        level_id,
        created_at,
        subjects(id, name, title),
        levels(id, name, title)
      `
      )
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`title.ilike.%${q}%,name.ilike.%${q}%,slug.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (data || []).map((track: any) => ({
      ...track,
      display_title: track.title || track.name || "Untitled Track",
      display_description: track.description_html || track.description || "",
      subject_name:
        track.subjects?.name || track.subjects?.title || "No subject",
      level_name: track.levels?.name || track.levels?.title || "No level",
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Tracks GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const title = body.title?.trim() || "";
    const slug = body.slug?.trim() || slugify(title);

    if (!title) {
      return NextResponse.json(
        { error: "Track title is required" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Track slug is required" },
        { status: 400 }
      );
    }

    const payload = {
      title,
      slug,
      description: body.plainDescription?.trim() || null,
      description_html: body.descriptionHtml || null,
      subject_id: body.subjectId || null,
      level_id: body.levelId || null,
    };

    const { data, error } = await supabaseAdmin
      .from("tracks")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Tracks POST error:", error);
    return NextResponse.json(
      { error: "Failed to create track" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Track id is required" },
        { status: 400 }
      );
    }

    const title = body.title?.trim() || "";
    const slug = body.slug?.trim() || slugify(title);

    if (!title) {
      return NextResponse.json(
        { error: "Track title is required" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Track slug is required" },
        { status: 400 }
      );
    }

    const payload = {
      title,
      slug,
      description: body.plainDescription?.trim() || null,
      description_html: body.descriptionHtml || null,
      subject_id: body.subjectId || null,
      level_id: body.levelId || null,
    };

    const { data, error } = await supabaseAdmin
      .from("tracks")
      .update(payload)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Tracks PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update track" },
      { status: 500 }
    );
  }
}