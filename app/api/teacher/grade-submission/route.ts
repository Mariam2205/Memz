import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const { error } = await supabase
    .from("submissions")
    .update({
      grade: body.grade,
      feedback: body.feedback || null,
      graded_at: new Date().toISOString(),
    })
    .eq("id", body.submission_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}