import { NextRequest, NextResponse } from "next/server";
import { adminSupabase, getUserFromRequest } from "@/lib/supabase-server";

const ALLOWED_PAYMENT_METHODS = ["cash_wallet", "instapay"];

export async function POST(req: NextRequest) {
  try {
    const { user, error: userError } = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: userError || "You must be logged in to enroll" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const trackId = body.trackId;
    const paymentMethod = body.paymentMethod;
    const paymentReference = body.paymentReference ?? null;
    const paymentNotes = body.paymentNotes ?? null;

    if (!trackId) {
      return NextResponse.json({ error: "trackId is required" }, { status: 400 });
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "paymentMethod must be cash_wallet or instapay" },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("id, role, approved")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.role !== "student" && profile.role !== "admin") {
      return NextResponse.json(
        { error: "Only students can enroll in tracks" },
        { status: 403 }
      );
    }

    if (profile.approved === false) {
      return NextResponse.json(
        { error: "Your account is not approved yet" },
        { status: 403 }
      );
    }

    const { data: track } = await adminSupabase
      .from("tracks")
      .select("id, title, name, price")
      .eq("id", trackId)
      .single();

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const { data: existing } = await adminSupabase
      .from("track_enrollments")
      .select("id, enrollment_status, payment_status")
      .eq("track_id", trackId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Enrollment request already exists",
        enrollment: existing,
      });
    }

    const { data, error } = await adminSupabase
      .from("track_enrollments")
      .insert([
        {
          track_id: trackId,
          student_id: user.id,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          payment_notes: paymentNotes,
          payment_status: "submitted",
          enrollment_status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create track enrollment request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Track enrollment request submitted successfully",
      enrollment: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create track enrollment request" },
      { status: 500 }
    );
  }
}