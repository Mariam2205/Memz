import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await adminSupabase
    .from("course_videos")
    .select("*, courses(id, title, name)")
    .order("video_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message, videos: [] }, { status: 500 });
  }

  return NextResponse.json({ videos: data || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.course_id || !body.title || !body.youtube_url) {
    return NextResponse.json(
      { error: "Course, title, and YouTube URL are required" },
      { status: 400 }
    );
  }

  const { data, error } = await adminSupabase
    .from("course_videos")
    .insert([
      {
        course_id: body.course_id,
        title: body.title,
        description: body.description || null,
        youtube_url: body.youtube_url,
        video_order: Number(body.video_order || 1),
        is_published: Boolean(body.is_published),
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, video: data });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: "Video id required" }, { status: 400 });
  }

  const { error } = await adminSupabase
    .from("course_videos")
    .delete()
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}