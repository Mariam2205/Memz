"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";

type Submission = {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  file_url: string | null;
  grade: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
};

export default function GradeForm({
  submissions = [],
}: {
  submissions?: Submission[];
}) {
  const safeSubmissions = useMemo(
    () => (Array.isArray(submissions) ? submissions : []),
    [submissions]
  );

  const [items, setItems] = useState<Submission[]>(safeSubmissions);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredItems = useMemo(() => {
    let next = [...items];

    if (statusFilter === "graded") {
      next = next.filter(
        (item) => item.grade !== null || Boolean(item.feedback)
      );
    }

    if (statusFilter === "pending") {
      next = next.filter(
        (item) => item.grade === null && !item.feedback
      );
    }

    const term = search.trim().toLowerCase();

    if (!term) return next;

    return next.filter((item) => {
      const text = [
        item.id ?? "",
        item.assignment_id ?? "",
        item.student_id ?? "",
        item.submission_text ?? "",
        item.feedback ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(term);
    });
  }, [items, search, statusFilter]);

  async function handleGrade(
    submissionId: string,
    grade: string,
    feedback: string
  ) {
    setLoadingId(submissionId);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/teacher/submissions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_id: submissionId,
          grade,
          feedback,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save grade.");
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === submissionId ? data.submission : item
        )
      );

      setMessage("Grade updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving the grade.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by submission, student id, assignment id..."
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
        >
          <option value="all">All</option>
          <option value="graded">Graded</option>
          <option value="pending">Pending</option>
        </select>
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

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          No matching submissions found.
        </div>
      ) : (
        filteredItems.map((submission) => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
            loading={loadingId === submission.id}
            onSave={handleGrade}
          />
        ))
      )}
    </div>
  );
}

function SubmissionCard({
  submission,
  loading,
  onSave,
}: {
  submission: Submission;
  loading: boolean;
  onSave: (submissionId: string, grade: string, feedback: string) => void;
}) {
  const [grade, setGrade] = useState(
    submission.grade !== null && submission.grade !== undefined
      ? String(submission.grade)
      : ""
  );
  const [feedback, setFeedback] = useState(submission.feedback ?? "");

  return (
    <div className="rounded-3xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-[var(--memz-text)]">
              Submission #{submission.id}
            </h3>
            <p className="mt-1 text-sm text-[var(--memz-muted)]">
              Assignment ID: {submission.assignment_id}
            </p>
            <p className="text-sm text-[var(--memz-muted)]">
              Student ID: {submission.student_id}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--memz-text)]">
              Submission Text
            </p>
            <p className="mt-1 rounded-2xl bg-white p-3 text-sm text-[var(--memz-muted)]">
              {submission.submission_text || "No text submission"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--memz-text)]">
              File URL
            </p>
            <p className="mt-1 break-all rounded-2xl bg-white p-3 text-sm text-[var(--memz-muted)]">
              {submission.file_url || "No file attached"}
            </p>
          </div>

          <div className="text-xs text-[var(--memz-muted)]">
            <div>Submitted: {submission.submitted_at || "-"}</div>
            <div>Graded: {submission.graded_at || "-"}</div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl bg-white p-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
              Grade
            </label>
            <input
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Enter numeric grade"
              className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write feedback for the student"
              rows={6}
              className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
            />
          </div>

          <button
            onClick={() => onSave(submission.id, grade, feedback)}
            disabled={loading}
            className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Grade"}
          </button>
        </div>
      </div>
    </div>
  );
}