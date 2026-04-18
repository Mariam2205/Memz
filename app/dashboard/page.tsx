"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";

type DashboardStats = {
  totalAssignments?: number;
  mySubmissions?: number;
  reviewed?: number;
  pendingReview?: number;
};

type SubmissionItem = {
  id: string;
  feedback?: string | null;
  grade?: number | null;
  assignment_title?: string;
  course_title?: string;
};

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchSubmissions();
  }, []);

  async function fetchStats() {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/student/dashboard-stats");
      const data = await res.json();

      if (res.ok) {
        setStats(data || {});
      }
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchSubmissions() {
    try {
      setLoadingSubmissions(true);
      const res = await fetch("/api/student/my-submissions");
      const data = await res.json();

      if (res.ok) {
        setSubmissions(data.submissions || []);
      }
    } finally {
      setLoadingSubmissions(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["student", "admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Student Dashboard
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Follow your assignments, submissions, and reviewed work from one place.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Total Assignments</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loadingStats ? "..." : stats.totalAssignments ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">My Submissions</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loadingStats ? "..." : stats.mySubmissions ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Reviewed</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loadingStats ? "..." : stats.reviewed ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Pending Review</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loadingStats ? "..." : stats.pendingReview ?? 0}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Link
              href="/dashboard/submissions"
              className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-[var(--memz-text)]">
                Submit Work
              </h2>
              <p className="mt-2 text-sm text-[var(--memz-muted)]">
                Upload files or text answers for your assignments.
              </p>
            </Link>

            <Link
              href="/dashboard/progress"
              className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-[var(--memz-text)]">
                My Progress
              </h2>
              <p className="mt-2 text-sm text-[var(--memz-muted)]">
                View assignment completion and reviewed work by course.
              </p>
            </Link>

            <Link
              href="/dashboard/track-progress"
              className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-[var(--memz-text)]">
                Track Progress
              </h2>
              <p className="mt-2 text-sm text-[var(--memz-muted)]">
                Follow your track progress and linked course journey.
              </p>
            </Link>
          </div>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--memz-text)]">
                Latest Feedback
              </h2>
            </div>

            {loadingSubmissions ? (
              <p className="text-[var(--memz-muted)]">Loading feedback...</p>
            ) : submissions.length === 0 ? (
              <p className="text-[var(--memz-muted)]">
                No submissions yet.
              </p>
            ) : (
              <div className="grid gap-4">
                {submissions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                  >
                    <h3 className="font-semibold text-[var(--memz-text)]">
                      {item.assignment_title || "Untitled Assignment"}
                    </h3>

                    <p className="mt-1 text-sm text-[var(--memz-muted)]">
                      {item.course_title || "Untitled Course"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-white px-3 py-1">
                        Grade: {item.grade ?? "Pending"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-[var(--memz-muted)]">
                      {item.feedback || "No feedback yet."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}