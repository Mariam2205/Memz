"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";

type Session = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

type Assignment = {
  id: string;
  title?: string | null;
  description?: string | null;
  max_grade?: number | null;
  due_at?: string | null;
};

export default function AdminSessionDetailsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  async function fetchSessionDetails() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/sessions/${sessionId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load session");
        return;
      }

      setSession(data.session || null);
      setAssignments(data.assignments || []);
    } catch {
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-3 inline-flex rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm text-[var(--memz-secondary)]">
              Admin Session View
            </div>

            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              {session?.title || session?.name || "Untitled Session"}
            </h1>

            <p className="mt-2 text-[var(--memz-muted)]">
              {session?.description || "No session description available."}
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-[var(--memz-muted)]">Loading session details...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--memz-text)]">
                  Assignments
                </h2>
                <span className="rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm text-[var(--memz-primary)]">
                  {assignments.length}
                </span>
              </div>

              {assignments.length === 0 ? (
                <p className="text-[var(--memz-muted)]">
                  No assignments found for this session.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                    >
                      <h3 className="font-semibold text-[var(--memz-text)]">
                        {assignment.title || "Untitled Assignment"}
                      </h3>

                      <p className="mt-2 text-sm text-[var(--memz-muted)]">
                        {assignment.description || "No description provided."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white px-3 py-1">
                          Max Grade: {assignment.max_grade ?? 0}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          Due: {assignment.due_at ? new Date(assignment.due_at).toLocaleString() : "No due date"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}