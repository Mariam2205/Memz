import Link from "next/link";

type Session = {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
};

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  max_grade: number | null;
  due_at: string | null;
  session_id: string;
};

async function getSessionAssignments(sessionId: string): Promise<{
  session: Session | null;
  assignments: Assignment[];
}> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const res = await fetch(
      `${baseUrl}/api/public/sessions/${sessionId}/assignments`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return { session: null, assignments: [] };
    }

    const data = await res.json();

    return {
      session: data.session ?? null,
      assignments: Array.isArray(data.assignments) ? data.assignments : [],
    };
  } catch (error) {
    console.error(error);
    return { session: null, assignments: [] };
  }
}

export default async function SessionAssignmentsPage({
  params,
}: {
  params: { courseId: string; sessionId: string };
}) {
  const { courseId, sessionId } = params;
  const { session, assignments } = await getSessionAssignments(sessionId);

  return (
    <main className="min-h-screen bg-[var(--memz-page-bg)] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--memz-text)] transition hover:bg-[var(--memz-soft)]"
        >
          ← Back to Course
        </Link>

        {!session ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Session not found.
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-2xl bg-[var(--memz-soft)] px-3 py-1 text-xs font-semibold text-[var(--memz-primary)]">
                Session Details
              </div>

              <h1 className="text-4xl font-bold text-[var(--memz-text)]">
                {session.title}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--memz-muted)]">
                {session.description || "No session description available yet."}
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--memz-text)]">
                  Assignments
                </h2>
                <p className="mt-2 text-sm text-[var(--memz-muted)]">
                  Browse all assignments linked to this session.
                </p>
              </div>

              {assignments.length === 0 ? (
                <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
                  No assignments found for this session yet.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm"
                    >
                      <h3 className="text-xl font-semibold text-[var(--memz-text)]">
                        {assignment.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-[var(--memz-muted)]">
                        {assignment.description || "No assignment description available."}
                      </p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-[var(--memz-soft)] px-4 py-3 text-sm text-[var(--memz-text)]">
                          <span className="font-semibold">Max Grade:</span>{" "}
                          {assignment.max_grade ?? "-"}
                        </div>

                        <div className="rounded-2xl bg-[var(--memz-soft)] px-4 py-3 text-sm text-[var(--memz-text)]">
                          <span className="font-semibold">Due At:</span>{" "}
                          {assignment.due_at ?? "-"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}