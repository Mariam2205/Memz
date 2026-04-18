"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";

type Assignment = {
  id: string;
  title?: string;
  description?: string;
  due_at?: string;
};

export default function TeacherSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [sessionId]);

  async function fetchAssignments() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/public/sessions/${sessionId}/assignments`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load assignments");
        return;
      }

      setAssignments(data.assignments || []);
    } catch {
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["teacher", "admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-[var(--memz-text)]">
              Session Assignments
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Review assignments inside this session.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6">
              <p className="text-[var(--memz-muted)]">Loading assignments...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6">
              <p className="text-red-500">{error}</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6">
              <p className="text-[var(--memz-muted)]">
                No assignments found for this session.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                >
                  <h3 className="text-lg font-semibold text-[var(--memz-text)]">
                    {assignment.title || "Untitled Assignment"}
                  </h3>

                  <p className="mt-2 text-sm text-[var(--memz-muted)]">
                    {assignment.description || "No description provided."}
                  </p>

                  {assignment.due_at && (
                    <p className="mt-3 text-xs text-[var(--memz-muted)]">
                      Due: {new Date(assignment.due_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}