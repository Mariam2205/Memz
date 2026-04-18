import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET admin users error:", error);
      return NextResponse.json(
        { error: error.message, users: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: Array.isArray(data) ? data : [],
    });
  } catch (error) {
    console.error("GET admin users unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to load users.", users: [] },
      { status: 500 }
    );
  }
}