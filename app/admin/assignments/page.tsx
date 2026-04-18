import AssignmentForm from "./assignment-form";
import RoleGuard from "@/components/RoleGuard";

type Session = {
  id: string;
  title?: string | null;
  name?: string | null;
};

async function getSessions(): Promise<Session[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/admin/sessions`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch sessions:", res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data.sessions) ? data.sessions : [];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

export default async function AdminAssignmentsPage() {
  const sessions = await getSessions();

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <main className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Assignments
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Create and manage assignments by session.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <AssignmentForm sessions={sessions} />
          </div>
        </div>
      </main>
    </RoleGuard>
  );
}