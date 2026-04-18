import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type SearchType = "all" | "users" | "courses" | "sessions" | "tracks";

function isUUIDLike(value: string) {
  return /^[0-9a-fA-F-]{8,}$/.test(value);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "all") as SearchType;
    const field = searchParams.get("field") || "smart";
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = [];

    if (type === "all" || type === "users") {
      let query = adminSupabase
        .from("profiles")
        .select("id, full_name, email, role, approved")
        .limit(20);

      if (field === "id" && isUUIDLike(q)) {
        query = query.eq("id", q);
      } else if (field === "email") {
        query = query.ilike("email", `%${q}%`);
      } else if (field === "name") {
        query = query.ilike("full_name", `%${q}%`);
      } else if (field === "role") {
        query = query.ilike("role", `%${q}%`);
      } else {
        query = query.or(
          `full_name.ilike.%${q}%,email.ilike.%${q}%,role.ilike.%${q}%`
        );
      }

      const { data } = await query;
      results.push(
        ...(data || []).map((item) => ({
          ...item,
          result_type: "users",
        }))
      );
    }

    if (type === "all" || type === "courses") {
      let query = adminSupabase
        .from("courses")
        .select(
          `
          id,
          title,
          name,
          slug,
          description,
          subject_id,
          level_id,
          subjects(id, name, title),
          levels(id, name, title)
        `
        )
        .limit(20);

      if (field === "id" && isUUIDLike(q)) {
        query = query.eq("id", q);
      } else if (field === "slug") {
        query = query.ilike("slug", `%${q}%`);
      } else if (field === "title") {
        query = query.ilike("title", `%${q}%`);
      } else if (field === "name") {
        query = query.ilike("name", `%${q}%`);
      } else {
        query = query.or(
          `title.ilike.%${q}%,name.ilike.%${q}%,slug.ilike.%${q}%,description.ilike.%${q}%`
        );
      }

      const { data } = await query;

      const mapped = (data || [])
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          name: item.name,
          slug: item.slug,
          description: item.description,
          subject_name:
            item.subjects?.name || item.subjects?.title || "No subject",
          level_name: item.levels?.name || item.levels?.title || "No level",
          result_type: "courses",
        }))
        .filter((item: any) => {
          if (field === "subject") {
            return item.subject_name?.toLowerCase().includes(q.toLowerCase());
          }
          if (field === "level") {
            return item.level_name?.toLowerCase().includes(q.toLowerCase());
          }
          return true;
        });

      results.push(...mapped);
    }

    if (type === "all" || type === "sessions") {
      let query = adminSupabase
        .from("sessions")
        .select(
          `
          id,
          title,
          name,
          description,
          session_number,
          course_id,
          courses(id, title, name)
        `
        )
        .limit(20);

      if (field === "id" && isUUIDLike(q)) {
        query = query.eq("id", q);
      } else if (field === "number" && !Number.isNaN(Number(q))) {
        query = query.eq("session_number", Number(q));
      } else if (field === "title") {
        query = query.ilike("title", `%${q}%`);
      } else if (field === "name") {
        query = query.ilike("name", `%${q}%`);
      } else {
        query = query.or(
          `title.ilike.%${q}%,name.ilike.%${q}%,description.ilike.%${q}%`
        );
      }

      const { data } = await query;

      const mapped = (data || [])
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          name: item.name,
          description: item.description,
          session_number: item.session_number,
          course_name: item.courses?.title || item.courses?.name || "No course",
          result_type: "sessions",
        }))
        .filter((item: any) => {
          if (field === "course") {
            return item.course_name?.toLowerCase().includes(q.toLowerCase());
          }
          return true;
        });

      results.push(...mapped);
    }

    if (type === "all" || type === "tracks") {
      let query = adminSupabase
        .from("tracks")
        .select(
          `
          id,
          title,
          name,
          slug,
          description,
          subject_id,
          level_id,
          subjects(id, name, title),
          levels(id, name, title)
        `
        )
        .limit(20);

      if (field === "id" && isUUIDLike(q)) {
        query = query.eq("id", q);
      } else if (field === "slug") {
        query = query.ilike("slug", `%${q}%`);
      } else if (field === "title") {
        query = query.ilike("title", `%${q}%`);
      } else if (field === "name") {
        query = query.ilike("name", `%${q}%`);
      } else {
        query = query.or(
          `title.ilike.%${q}%,name.ilike.%${q}%,slug.ilike.%${q}%,description.ilike.%${q}%`
        );
      }

      const { data } = await query;

      const mapped = (data || [])
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          name: item.name,
          slug: item.slug,
          description: item.description,
          subject_name:
            item.subjects?.name || item.subjects?.title || "No subject",
          level_name: item.levels?.name || item.levels?.title || "No level",
          result_type: "tracks",
        }))
        .filter((item: any) => {
          if (field === "subject") {
            return item.subject_name?.toLowerCase().includes(q.toLowerCase());
          }
          if (field === "level") {
            return item.level_name?.toLowerCase().includes(q.toLowerCase());
          }
          return true;
        });

      results.push(...mapped);
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Admin search error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}