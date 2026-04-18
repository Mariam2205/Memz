import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import TrackEnrollCard from "@/components/TrackEnrollCard";

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
  session_id: string;
};

type Session = {
  id: string;
  title: string | null;
  name: string | null;
  description: string | null;
  course_id: string;
  assignments?: Assignment[];
};

type Course = {
  id: string;
  title: string | null;
  name: string | null;
  description: string | null;
  price: number | null;
  sessions?: Session[];
};

export default async function TrackDetailsPage({
  params,
}: {
  params: { trackId: string };
}) {
  const { data: track } = await adminSupabase
    .from("tracks")
    .select("*")
    .eq("id", params.trackId)
    .single();

  if (!track) {
    return (
      <main className="memz-page bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
        <div className="memz-container">
          <div className="mb-8">
            <Link
              href="/tracks"
              className="inline-flex rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-medium"
            >
              ← Back to Tracks
            </Link>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            Track not found.
          </div>
        </div>
      </main>
    );
  }

  const { data: trackCourses } = await adminSupabase
    .from("track_courses")
    .select("course_id")
    .eq("track_id", params.trackId);

  const courseIds = (trackCourses || []).map((item) => item.course_id);

  let courses: Course[] = [];
  let sessions: Session[] = [];
  let assignments: Assignment[] = [];

  if (courseIds.length > 0) {
    const { data: coursesData } = await adminSupabase
      .from("courses")
      .select("*")
      .in("id", courseIds);

    courses = (coursesData || []) as Course[];

    const { data: sessionsData } = await adminSupabase
      .from("sessions")
      .select("id, title, name, description, course_id, created_at")
      .in("course_id", courseIds)
      .order("created_at", { ascending: true });

    sessions = (sessionsData || []) as Session[];

    const sessionIds = sessions.map((item) => item.id);

    if (sessionIds.length > 0) {
      const { data: assignmentsData } = await adminSupabase
        .from("assignments")
        .select("id, title, description, due_at, max_grade, session_id, created_at")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: true });

      assignments = (assignmentsData || []) as Assignment[];
    }
  }

  const assignmentsBySession = new Map<string, Assignment[]>();
  for (const assignment of assignments) {
    const list = assignmentsBySession.get(assignment.session_id) || [];
    list.push(assignment);
    assignmentsBySession.set(assignment.session_id, list);
  }

  const sessionsByCourse = new Map<string, Session[]>();
  for (const session of sessions) {
    const list = sessionsByCourse.get(session.course_id) || [];
    list.push({
      ...session,
      assignments: assignmentsBySession.get(session.id) || [],
    });
    sessionsByCourse.set(session.course_id, list);
  }

  const enrichedCourses: Course[] = courses.map((course) => ({
    ...course,
    sessions: sessionsByCourse.get(course.id) || [],
  }));

  return (
    <main className="memz-page bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
      <div className="memz-container">
        <div className="mb-8">
          <Link
            href="/tracks"
            className="inline-flex rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-medium"
          >
            ← Back to Tracks
          </Link>
        </div>

        <div className="space-y-8">
          <div className="rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--memz-soft)] px-3 py-1 text-xs font-semibold text-[var(--memz-secondary)]">
              Track Preview
            </div>

            <h1 className="text-4xl font-bold sm:text-5xl">
              {track.title || track.name || "Untitled Track"}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--memz-muted)]">
              {track.description || track.short_description || "No description available yet."}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 text-sm font-medium">
                ${track.price ?? 0}
              </span>

              <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
                Preview Available
              </span>
            </div>
          </div>

          <TrackEnrollCard
            trackId={params.trackId}
            trackTitle={track.title || track.name}
            price={track.price}
          />

          <div className="rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Track Courses</h2>
              <span className="rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm font-medium text-[var(--memz-primary)]">
                {enrichedCourses.length}
              </span>
            </div>

            {enrichedCourses.length === 0 ? (
              <p className="text-[var(--memz-muted)]">
                No courses found for this track yet.
              </p>
            ) : (
              <div className="space-y-6">
                {enrichedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-3xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-[var(--memz-text)]">
                          {course.title || course.name || "Untitled Course"}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--memz-muted)]">
                          {course.description || "No course description available."}
                        </p>
                      </div>

                      <Link
                        href={`/courses/${course.id}`}
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)] shadow-sm"
                      >
                        View Course
                      </Link>
                    </div>

                    <div className="mt-6 space-y-4">
                      {(course.sessions || []).length === 0 ? (
                        <p className="text-sm text-[var(--memz-muted)]">
                          No sessions in this course yet.
                        </p>
                      ) : (
                        course.sessions?.map((session) => (
                          <div
                            key={session.id}
                            className="rounded-2xl border border-[var(--memz-border)] bg-white p-4"
                          >
                            <h4 className="text-lg font-semibold">
                              {session.title || session.name || "Untitled Session"}
                            </h4>
                            <p className="mt-2 text-sm text-[var(--memz-muted)]">
                              {session.description || "No session description yet."}
                            </p>

                            <div className="mt-4">
                              <h5 className="text-sm font-semibold uppercase tracking-wide text-[var(--memz-primary)]">
                                Assignments
                              </h5>

                              {(session.assignments || []).length === 0 ? (
                                <p className="mt-2 text-sm text-[var(--memz-muted)]">
                                  No assignments in this session.
                                </p>
                              ) : (
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                  {session.assignments?.map((assignment) => (
                                    <div
                                      key={assignment.id}
                                      className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-4"
                                    >
                                      <h6 className="font-semibold">
                                        {assignment.title || "Untitled Assignment"}
                                      </h6>
                                      <p className="mt-2 text-sm text-[var(--memz-muted)]">
                                        {assignment.description || "No assignment description yet."}
                                      </p>

                                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full bg-white px-3 py-1">
                                          Max Grade: {assignment.max_grade ?? "-"}
                                        </span>
                                        <span className="rounded-full bg-white px-3 py-1">
                                          Due: {assignment.due_at ?? "-"}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
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