import Link from "next/link";
import SubmissionForm from "./submission-form";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  max_grade: number | null;
  due_at: string | null;
  session_id: string;
};

async function getAssignments(): Promise<Assignment[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/student/assignments`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch assignments:", res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data.assignments) ? data.assignments : [];
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }
}

export default async function DashboardSubmissionsPage() {
  const assignments = await getAssignments();

  return (
    <main className="min-h-screen bg-[var(--memz-page-bg)] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--memz-text)]">
            Submit Assignment
          </h1>
          <p className="mt-2 text-sm text-[var(--memz-muted)]">
            Open assignment details or submit work directly from here.
          </p>
        </div>

        {assignments.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/dashboard/assignments/${assignment.id}`}
                className="rounded-3xl border border-[var(--memz-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h2 className="text-lg font-semibold text-[var(--memz-text)]">
                  {assignment.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-[var(--memz-muted)]">
                  {assignment.description || "No description available."}
                </p>
                <div className="mt-4 text-sm font-medium text-[var(--memz-primary)]">
                  View Details →
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
          <SubmissionForm assignments={assignments} />
        </div>
      </div>
    </main>
  );
}