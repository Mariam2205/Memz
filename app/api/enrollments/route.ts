import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getBearerToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth.replace("Bearer ", "");
}

export async function POST(req: NextRequest) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();

    const { data, error } = await supabaseAdmin
      .from("course_enrollments")
      .insert([
        {
          course_id: body.course_id,
          student_id: user.id,
          payment_method: body.payment_method || "manual",
          payer_name: body.payer_name || null,
          wallet_number: body.wallet_number || null,
          payment_reference: body.payment_reference || null,
          payment_notes: body.payment_notes || null,
          payment_screenshot_url: body.payment_screenshot_url || null,
          transfer_time: body.transfer_time || null,
          payment_status: "pending",
          enrollment_status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, enrollment: data });
  } catch {
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}