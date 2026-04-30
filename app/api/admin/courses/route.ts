import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/slugify";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: courses, error } = await adminSupabase
      .from("courses")
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

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load courses" },
        { status: 500 }
      );
    }

    const mapped = (courses || []).map((course: any) => ({
      ...course,
      display_title: course.title || course.name || "Untitled Course",
      display_description: course.description_html || course.description || "",
      subject_name:
        course.subjects?.name || course.subjects?.title || "No subject",
      level_name: course.levels?.name || course.levels?.title || "No level",
    }));

    return NextResponse.json({
      courses: mapped,
    });
  } catch (error) {
    console.error("Courses GET error:", error);
    return NextResponse.json(
      { error: "Failed to load courses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const title = body.title?.trim() || "";
    const name = body.name?.trim() || title;
    const slug = body.slug?.trim() || slugify(title || name);
    const description =
      body.plainDescription?.trim() || body.description?.trim() || null;
    const description_html = body.descriptionHtml || null;
    const subject_id = body.subject_id || null;
    const level_id = body.level_id || null;
    const price = Number(body.price || 0);
const is_free = Boolean(body.is_free);
const pricing_type = body.pricing_type || "course";
const level_description = body.level_description || null;
const age_category = body.age_category || null;
const course_objectives = body.course_objectives || null;
const starting_date = body.starting_date || null;

    if (!title && !name) {
      return NextResponse.json(
        { error: "Course title is required" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Course slug is required" },
        { status: 400 }
      );
    }

    const { data, error } = await adminSupabase
      .from("courses")
.insert([
  {
    title: title || name,
    name: name || title,
    slug,
    description,
    description_html,
    subject_id,
    level_id,

    price,
    is_free,
    pricing_type,
    level_description,
    age_category,
    course_objectives,
    starting_date,
  },
])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create course" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      course: data,
    });
  } catch (error) {
    console.error("Courses POST error:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
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
    const slug = body.slug?.trim() || slugify(title || name);
    const description =
      body.plainDescription?.trim() || body.description?.trim() || null;
    const description_html = body.descriptionHtml || null;
    const subject_id = body.subject_id || null;
    const level_id = body.level_id || null;

    if (!id || (!title && !name)) {
      return NextResponse.json(
        { error: "id and title are required" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Course slug is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("courses")
      .update({
        title: title || name,
        name: name || title,
        slug,
        description,
        description_html,
        subject_id,
        level_id,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update course" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Courses PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
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
        { error: "Course id is required" },
        { status: 400 }
      );
    }

    const { error } = await adminSupabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete course" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Courses DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}