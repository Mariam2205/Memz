import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CourseEnrollCard from "@/components/CourseEnrollCard";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Assignment = {
  id: string;
  title: string | null;
  description: string | null;
  due_at: string | null;
  max_grade: number | null;
  locked?: boolean;
  session_id: string;
};

type Session = {
  id: string;
  title: string | null;
  name: string | null;
  description: string | null;
  course_id: string;
  locked?: boolean;
  assignments?: Assignment[];
};

export default async function CourseDetailsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { data: course } = await adminSupabase
    .from("courses")
    .select("*")
    .eq("id", params.courseId)
    .single();

  if (!course) {
    return (
      <main className="memz-page bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
        <div className="memz-container">
          <div className="mb-8">
            <Link
              href="/courses"
              className="inline-flex rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--memz-text)] transition hover:bg-[var(--memz-soft)]"
            >
              ← Back to Courses
            </Link>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            Course not found.
          </div>
        </div>
      </main>
    );
  }

  const { data: sessions } = await adminSupabase
    .from("sessions")
    .select("id, title, name, description, course_id, created_at")
    .eq("course_id", params.courseId)
    .order("created_at", { ascending: true });

  const sessionIds = (sessions || []).map((s) => s.id);

  let assignments: Assignment[] = [];
  if (sessionIds.length > 0) {
    const { data } = await adminSupabase
      .from("assignments")
      .select("id, title, description, due_at, max_grade, session_id")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: true });

    assignments = (data || []) as Assignment[];
  }

  const assignmentsBySession = new Map<string, Assignment[]>();

  for (const assignment of assignments) {
    const list = assignmentsBySession.get(assignment.session_id) || [];
    list.push({
      ...assignment,
      locked: true,
    });
    assignmentsBySession.set(assignment.session_id, list);
  }

  const enrichedSessions: Session[] = (sessions || []).map((session: any) => ({
    ...session,
    locked: true,
    assignments: assignmentsBySession.get(session.id) || [],
  }));

  return (
    <main className="memz-page bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
      <div className="memz-container">
        <div className="mb-8">
          <Link
            href="/courses"
            className="inline-flex rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--memz-text)] transition hover:bg-[var(--memz-soft)]"
          >
            ← Back to Courses
          </Link>
        </div>

        <div className="space-y-8">
          <div className="rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--memz-soft)] px-3 py-1 text-xs font-semibold text-[var(--memz-primary)]">
              Course Preview
            </div>

            <h1 className="text-4xl font-bold sm:text-5xl">
              {course.title || course.name || "Untitled Course"}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--memz-muted)]">
              {course.description || course.short_description || "No description available yet."}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 text-sm font-medium">
                {course.is_free ? "Free" : `$${course.price ?? 0}`}
              </span>

              <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
                Preview Available
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              Students can preview this course, sessions, and assignments before enrollment.
            </div>
          </div>

          <CourseEnrollCard
            courseId={params.courseId}
            courseTitle={course.title || course.name}
            isFree={course.is_free}
            price={course.price}
          />

          <div className="rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Sessions</h2>
              <span className="rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm font-medium text-[var(--memz-primary)]">
                {enrichedSessions.length}
              </span>
            </div>

            {enrichedSessions.length === 0 ? (
              <p className="text-[var(--memz-muted)]">
                No sessions found for this course yet.
              </p>
            ) : (
              <div className="space-y-5">
                {enrichedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-3xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold">
                        {session.title || session.name || "Untitled Session"}
                      </h3>

                      {session.locked && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          Preview
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm leading-7 text-[var(--memz-muted)]">
                      {session.description || "No session description yet."}
                    </p>

                    <div className="mt-5">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--memz-primary)]">
                        Assignments
                      </h4>

                      {session.assignments && session.assignments.length > 0 ? (
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {session.assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="rounded-2xl border border-[var(--memz-border)] bg-white p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h5 className="font-semibold">
                                  {assignment.title || "Untitled Assignment"}
                                </h5>

                                <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
                                  Preview
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-[var(--memz-muted)]">
                                {assignment.description || "No assignment description yet."}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-[var(--memz-soft)] px-3 py-1">
                                  Max Grade: {assignment.max_grade ?? "-"}
                                </span>
                                <span className="rounded-full bg-[var(--memz-soft)] px-3 py-1">
                                  Due: {assignment.due_at ?? "-"}
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
          </div>
        </div>
      </div>
    </main>
  );
}