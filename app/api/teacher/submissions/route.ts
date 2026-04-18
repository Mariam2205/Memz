import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("id, role, approved")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.approved === false) {
      return NextResponse.json(
        { error: "Your account is not approved yet" },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const status = searchParams.get("status") || "all";

    let allowedCourseIds: string[] = [];

    if (profile.role === "admin") {
      const { data: allCourses } = await adminSupabase.from("courses").select("id");
      allowedCourseIds = (allCourses || []).map((row) => row.id);
    } else if (profile.role === "teacher") {
      const { data: teacherRows } = await adminSupabase
        .from("course_teachers")
        .select("course_id")
        .eq("teacher_id", user.id);

      allowedCourseIds = (teacherRows || []).map((row) => row.course_id);
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (allowedCourseIds.length === 0) {
      return NextResponse.json({ submissions: [] });
    }

    const { data: sessions } = await adminSupabase
      .from("sessions")
      .select("id, course_id, title, name")
      .in("course_id", allowedCourseIds);

    const sessionIds = (sessions || []).map((row) => row.id);

    if (sessionIds.length === 0) {
      return NextResponse.json({ submissions: [] });
    }

    const { data: assignments } = await adminSupabase
      .from("assignments")
      .select("id, session_id, title, description, due_at")
      .in("session_id", sessionIds);

    const assignmentIds = (assignments || []).map((row) => row.id);

    if (assignmentIds.length === 0) {
      return NextResponse.json({ submissions: [] });
    }

    const { data: submissions, error: submissionsError } = await adminSupabase
      .from("submissions")
      .select("*")
      .in("assignment_id", assignmentIds)
      .order("submitted_at", { ascending: false });

    if (submissionsError) {
      return NextResponse.json(
        { error: submissionsError.message || "Failed to load submissions" },
        { status: 500 }
      );
    }

    const studentIds = [...new Set((submissions || []).map((row) => row.student_id))];

    let students: any[] = [];
    if (studentIds.length > 0) {
      const { data: studentRows } = await adminSupabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", studentIds);

      students = studentRows || [];
    }

    const assignmentMap = new Map((assignments || []).map((a) => [a.id, a]));
    const sessionMap = new Map((sessions || []).map((s) => [s.id, s]));
    const studentMap = new Map((students || []).map((s) => [s.id, s]));

    const enriched = (submissions || []).map((submission) => {
      const assignment = assignmentMap.get(submission.assignment_id);
      const session = assignment ? sessionMap.get(assignment.session_id) : null;
      const student = studentMap.get(submission.student_id);

      return {
        ...submission,
        assignment,
        session,
        student,
      };
    });

    const filtered = enriched.filter((item) => {
      const studentName = item.student?.full_name?.toLowerCase() || "";
      const studentEmail = item.student?.email?.toLowerCase() || "";
      const assignmentTitle = item.assignment?.title?.toLowerCase() || "";
      const submissionText = item.submission_text?.toLowerCase() || "";
      const studentId = item.student_id?.toLowerCase?.() || "";
      const assignmentId = item.assignment_id?.toLowerCase?.() || "";

      const matchesSearch =
        !search ||
        studentName.includes(search) ||
        studentEmail.includes(search) ||
        assignmentTitle.includes(search) ||
        submissionText.includes(search) ||
        studentId.includes(search) ||
        assignmentId.includes(search);

      const isGraded = item.grade !== null && item.grade !== undefined;

      const matchesStatus =
        status === "all" ||
        (status === "graded" && isGraded) ||
        (status === "pending" && !isGraded);

      return matchesSearch && matchesStatus;
    });

    return NextResponse.json({
      submissions: filtered,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load submissions" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("id, role, approved")
      .eq("id", user.id)
      .single();

    if (!profile || profile.approved === false) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (profile.role !== "teacher" && profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, grade, feedback } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Submission id is required" },
        { status: 400 }
      );
    }

    if (profile.role === "teacher") {
      const { data: submission } = await adminSupabase
        .from("submissions")
        .select("id, assignment_id")
        .eq("id", id)
        .single();

      if (!submission) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      const { data: assignment } = await adminSupabase
        .from("assignments")
        .select("id, session_id")
        .eq("id", submission.assignment_id)
        .single();

      if (!assignment) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
      }

      const { data: session } = await adminSupabase
        .from("sessions")
        .select("id, course_id")
        .eq("id", assignment.session_id)
        .single();

      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      const { data: allowed } = await adminSupabase
        .from("course_teachers")
        .select("id")
        .eq("course_id", session.course_id)
        .eq("teacher_id", user.id)
        .maybeSingle();

      if (!allowed) {
        return NextResponse.json(
          { error: "You are not assigned to this course" },
          { status: 403 }
        );
      }
    }

    const { error } = await adminSupabase
      .from("submissions")
      .update({
        grade: grade ?? null,
        feedback: feedback ?? null,
        graded_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}