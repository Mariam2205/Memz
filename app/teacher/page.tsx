"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";

type DashboardStats = {
  totalSubmissions?: number;
  graded?: number;
  pending?: number;
};

type Course = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchCourses();
  }, []);

  async function fetchStats() {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/teacher/dashboard-stats");
      const data = await res.json();

      if (res.ok) {
        setStats(data || {});
      }
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchCourses() {
    try {
      setLoadingCourses(true);
      const res = await fetch("/api/teacher/my-courses");
      const data = await res.json();

      if (res.ok) {
        setCourses(data.courses || data || []);
      }
    } finally {
      setLoadingCourses(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["teacher", "admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Teacher Dashboard
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Manage your teaching flow, review submissions, and follow your assigned courses.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Total Submissions</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loadingStats ? "..." : stats.totalSubmissions ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Graded</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loadingStats ? "..." : stats.graded ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Pending</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loadingStats ? "..." : stats.pending ?? 0}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-[var(--memz-text)]">
                  My Courses
                </h2>
                <p className="mt-1 text-sm text-[var(--memz-muted)]">
                  Open each course to see sessions and enrolled students.
                </p>
              </div>

              <Link
                href="/teacher/submissions"
                className="rounded-2xl bg-[var(--memz-primary)] px-4 py-2 text-sm font-semibold text-white"
              >
                Review Submissions
              </Link>
            </div>

            {loadingCourses ? (
              <p className="text-[var(--memz-muted)]">Loading courses...</p>
            ) : courses.length === 0 ? (
              <p className="text-[var(--memz-muted)]">
                No courses assigned yet.
              </p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => {
                  const title = course.title || course.name || "Untitled Course";

                  return (
                    <div
                      key={course.id}
                      className="rounded-3xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                    >
                      <h3 className="text-xl font-semibold text-[var(--memz-text)]">
                        {title}
                      </h3>

                      <p className="mt-2 text-sm text-[var(--memz-muted)]">
                        {course.description || "No course description yet."}
                      </p>

                      <Link
                        href={`/teacher/courses/${course.id}`}
                        className="mt-4 inline-block rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)] shadow-sm"
                      >
                        Open Course
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}