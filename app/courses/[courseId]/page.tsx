import Link from "next/link";
import { adminSupabase } from "@/lib/supabase-server";
import CourseEnrollCard from "@/components/CourseEnrollCard";

type Assignment = {
  id: string;
  title: string | null;
  description: string | null;
  due_at: string | null;
  max_grade: number | null;
  session_id: string;
};

type Session = {
  id: string;
  title: string | null;
  name: string | null;
  description: string | null;
  course_id: string;
  assignments: Assignment[];
};

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const { data: course } = await adminSupabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) {
    return (
      <main className="memz-page bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
        <div className="memz-container">
          <Link
            href="/courses"
            className="inline-flex rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-medium"
          >
            ← Back to Courses
          </Link>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            Course not found.
          </div>
        </div>
      </main>
    );
  }

  const { data: sessionsData } = await adminSupabase
    .from("sessions")
    .select("id, title, name, description, course_id, created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: true });

  const sessionIds = (sessionsData || []).map((session) => session.id);

  let assignments: Assignment[] = [];

  if (sessionIds.length > 0) {
    const { data: assignmentData } = await adminSupabase
      .from("assignments")
      .select("id, title, description, due_at, max_grade, session_id, created_at")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: true });

    assignments = (assignmentData || []) as Assignment[];
  }

  const assignmentsBySession = new Map<string, Assignment[]>();

  assignments.forEach((assignment) => {
    const list = assignmentsBySession.get(assignment.session_id) || [];
    list.push(assignment);
    assignmentsBySession.set(assignment.session_id, list);
  });

  const sessions: Session[] = (sessionsData || []).map((session) => ({
    ...session,
    assignments: assignmentsBySession.get(session.id) || [],
  }));

  return (
    <main className="memz-page bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
      <div className="memz-container">
        <Link
          href="/courses"
          className="inline-flex rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-medium"
        >
          ← Back to Courses
        </Link>

        <section className="mt-8 rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
          <p className="mb-4 inline-flex rounded-2xl bg-[var(--memz-soft)] px-3 py-1 text-xs font-semibold text-[var(--memz-primary)]">
            Course Details
          </p>

          <h1 className="text-4xl font-bold sm:text-5xl">
            {course.title || course.name || "Untitled Course"}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--memz-muted)]">
            {course.description ||
              course.short_description ||
              "No description available yet."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 text-sm font-medium">
              {course.is_free ? "Free" : `$${course.price ?? 0}`}
              <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
  <p>
    <strong>Payment Way:</strong>{" "}
    {course.pricing_type === "level"
      ? "By Level"
      : course.pricing_type === "month"
      ? "Monthly"
      : "By Course"}
  </p>

  <p>
    <strong>Age Category:</strong> {course.age_category || "Not added yet"}
  </p>

  <p>
    <strong>Starting Date:</strong>{" "}
    {course.starting_date
      ? new Date(course.starting_date).toLocaleDateString()
      : "Not added yet"}
  </p>

  <div>
    <strong>Level Description:</strong>
    <p>{course.level_description || "Not added yet"}</p>
  </div>

  <div>
    <strong>Course Objectives:</strong>
    <p>{course.course_objectives || "Not added yet"}</p>
  </div>
</div>
            </span>

            <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
              Videos locked until enrollment approval
            </span>
          </div>
        </section>

        <CourseEnrollCard
          courseId={courseId}
          courseTitle={course.title || course.name}
          isFree={course.is_free}
          price={course.price}
        />

        <section className="mt-8 rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Sessions</h2>
            <span className="rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm font-medium text-[var(--memz-primary)]">
              {sessions.length}
            </span>
          </div>

          {sessions.length === 0 ? (
            <p className="text-[var(--memz-muted)]">
              No sessions found for this course yet.
            </p>
          ) : (
            <div className="space-y-5">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-3xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold">
                      {session.title || session.name || "Untitled Session"}
                    </h3>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      Preview only
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-[var(--memz-muted)]">
                    {session.description || "No session description yet."}
                  </p>

                  <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    Session video is locked until your enrollment is approved.
                  </div>

                  <div className="mt-5">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--memz-primary)]">
                      Assignments
                    </h4>

                    {session.assignments.length > 0 ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {session.assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="rounded-2xl border border-[var(--memz-border)] bg-white p-4"
                          >
                            <h5 className="font-semibold">
                              {assignment.title || "Untitled Assignment"}
                            </h5>

                            <p className="mt-2 text-sm text-[var(--memz-muted)]">
                              {assignment.description ||
                                "No assignment description yet."}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-[var(--memz-soft)] px-3 py-1">
                                Max Grade: {assignment.max_grade ?? "-"}
                              </span>

                              <span className="rounded-full bg-[var(--memz-soft)] px-3 py-1">
                                Due:{" "}
                                {assignment.due_at
                                  ? new Date(assignment.due_at).toLocaleString()
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[var(--memz-muted)]">
                        No assignments in this session.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}