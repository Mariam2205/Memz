"use client";

import { FormEvent, useMemo, useState } from "react";

type Session = {
  id: string;
  title: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  max_grade: number | null;
  due_at: string | null;
  session_id: string;
};

export default function AssignmentForm({
  sessions = [],
}: {
  sessions?: Session[];
}) {
  const safeSessions = useMemo(
    () => (Array.isArray(sessions) ? sessions : []),
    [sessions]
  );

  const [sessionId, setSessionId] = useState(
    safeSessions.length > 0 ? safeSessions[0].id : ""
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxGrade, setMaxGrade] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdAssignments, setCreatedAssignments] = useState<Assignment[]>([]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          title,
          description,
          max_grade: maxGrade ? Number(maxGrade) : null,
          due_at: dueAt || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create assignment.");
        return;
      }

      setMessage("Assignment created successfully.");
      setTitle("");
      setDescription("");
      setMaxGrade("");
      setDueAt("");

      if (data.assignment) {
        setCreatedAssignments((prev) => [data.assignment, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while creating the assignment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--memz-text)]">
          Create Assignment
        </h2>
        <p className="mt-1 text-sm text-[var(--memz-muted)]">
          Link each assignment to a session and store the deadline in{" "}
          <code>due_at</code>.
        </p>
      </div>

      {safeSessions.length === 0 && (
        <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          No sessions found. Create sessions first before adding assignments.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
            Session
          </label>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            disabled={safeSessions.length === 0 || loading}
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
          >
            {safeSessions.length === 0 ? (
              <option value="">No sessions available</option>
            ) : (
              safeSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
            Assignment Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter assignment title"
            required
            disabled={loading}
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write assignment details"
            rows={5}
            disabled={loading}
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
              Max Grade
            </label>
            <input
              type="number"
              value={maxGrade}
              onChange={(e) => setMaxGrade(e.target.value)}
              placeholder="100"
              min="0"
              disabled={loading}
              className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
              Due At
            </label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || safeSessions.length === 0}
          className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Assignment"}
        </button>
      </form>

      {createdAssignments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--memz-text)]">
            Newly Created
          </h3>

          {createdAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-[var(--memz-text)]">
                    {assignment.title}
                  </h4>
                  <p className="mt-1 text-sm text-[var(--memz-muted)]">
                    {assignment.description || "No description"}
                  </p>
                </div>
                <div className="text-right text-xs text-[var(--memz-muted)]">
                  <div>Max: {assignment.max_grade ?? "-"}</div>
                  <div>Due: {assignment.due_at ?? "-"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}