import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      *,
      subjects(title,name),
      levels(title,name),
      sessions(*)
    `)
    .eq("id", params.courseId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ course: data });
}