"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  max_grade: number | null;
  due_at: string | null;
  session_id: string;
};

type Submission = {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  file_url: string | null;
  submitted_at: string | null;
};

export default function SubmissionForm({
  assignments = [],
}: {
  assignments?: Assignment[];
}) {
  const safeAssignments = useMemo(
    () => (Array.isArray(assignments) ? assignments : []),
    [assignments]
  );

  const [assignmentId, setAssignmentId] = useState(
    safeAssignments.length > 0 ? safeAssignments[0].id : ""
  );
  const [studentId, setStudentId] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdSubmission, setCreatedSubmission] = useState<Submission | null>(
    null
  );

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error loading user:", error);
          setError("Could not load logged-in user.");
          return;
        }

        if (!user) {
          setError("You must be logged in to submit work.");
          return;
        }

        setStudentId(user.id);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading your account.");
      } finally {
        setAuthLoading(false);
      }
    }

    getUser();
  }, []);

  async function uploadFileIfNeeded(): Promise<string | null> {
    if (!selectedFile || !studentId) return null;

    const fileExt = selectedFile.name.split(".").pop();
    const filePath = `${studentId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("submission-files")
      .upload(filePath, selectedFile, {
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("submission-files")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const uploadedFileUrl = await uploadFileIfNeeded();

      const res = await fetch("/api/student/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          student_id: studentId,
          submission_text: submissionText,
          file_url: uploadedFileUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit work.");
        return;
      }

      setMessage("Submission sent successfully.");
      setSubmissionText("");
      setSelectedFile(null);
      setCreatedSubmission(data.submission ?? null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong while submitting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--memz-text)]">
          Submit Assignment
        </h2>
        <p className="mt-1 text-sm text-[var(--memz-muted)]">
          Choose an assignment, write your answer, and optionally upload a file.
        </p>
      </div>

      {safeAssignments.length === 0 && (
        <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          No assignments found yet.
        </div>
      )}

      {authLoading && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          Loading your account...
        </div>
      )}

      {!authLoading && !studentId && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          You must be logged in to submit work.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
            Assignment
          </label>
          <select
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
            disabled={safeAssignments.length === 0 || loading || authLoading}
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
          >
            {safeAssignments.length === 0 ? (
              <option value="">No assignments available</option>
            ) : (
              safeAssignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
            Submission Text
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Write your answer here"
            rows={6}
            disabled={loading || authLoading || !studentId}
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
            Upload File
          </label>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            disabled={loading || authLoading || !studentId}
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
          />
          {selectedFile && (
            <p className="mt-2 text-xs text-[var(--memz-muted)]">
              Selected: {selectedFile.name}
            </p>
          )}
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
          disabled={
            loading || authLoading || !studentId || safeAssignments.length === 0
          }
          className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Work"}
        </button>
      </form>

      {createdSubmission && (
        <div className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-4">
          <h3 className="font-semibold text-[var(--memz-text)]">
            Latest Submission
          </h3>
          <p className="mt-2 text-sm text-[var(--memz-muted)]">
            Submission saved successfully.
          </p>
          <div className="mt-3 space-y-1 text-sm text-[var(--memz-text)]">
            <div>ID: {createdSubmission.id}</div>
            <div>Assignment: {createdSubmission.assignment_id}</div>
            <div>Student: {createdSubmission.student_id}</div>
            <div>Submitted At: {createdSubmission.submitted_at ?? "-"}</div>
            <div className="break-all">
              File: {createdSubmission.file_url || "No file"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}