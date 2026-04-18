import Link from "next/link";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  max_grade: number | null;
  due_at: string | null;
  session_id: string | null;
};

async function getAssignment(
  assignmentId: string
): Promise<Assignment | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const res = await fetch(
      `${baseUrl}/api/student/assignments/${assignmentId}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.assignment ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function AssignmentDetailsPage({
  params,
}: {
  params: { assignmentId: string };
}) {
  const assignment = await getAssignment(params.assignmentId);

  return (
    <main className="min-h-screen bg-[var(--memz-page-bg)] px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link
          href="/dashboard/submissions"
          className="inline-flex rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--memz-text)] transition hover:bg-[var(--memz-soft)]"
        >
          ← Back to Submissions
        </Link>

        {!assignment ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Assignment not found.
          </div>
        ) : (
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-4 inline-flex rounded-2xl bg-[var(--memz-soft)] px-3 py-1 text-xs font-semibold text-[var(--memz-primary)]">
              Assignment Details
            </div>

            <h1 className="text-4xl font-bold text-[var(--memz-text)]">
              {assignment.title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-[var(--memz-muted)]">
              {assignment.description || "No description available yet."}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[var(--memz-soft)] px-4 py-4 text-sm text-[var(--memz-text)]">
                <span className="font-semibold">Max Grade:</span>{" "}
                {assignment.max_grade ?? "-"}
              </div>

              <div className="rounded-2xl bg-[var(--memz-soft)] px-4 py-4 text-sm text-[var(--memz-text)]">
                <span className="font-semibold">Due At:</span>{" "}
                {assignment.due_at ?? "-"}
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/dashboard/submissions"
                className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Go Submit Work
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}