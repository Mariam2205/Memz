"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";

type Stats = {
  users?: number;
  approvedStudents?: number;
  courses?: number;
  sessions?: number;
  assignments?: number;
  submissions?: number;
};

const quickLinks = [
  { href: "/admin/users", label: "Manage Users" },
  { href: "/admin/courses", label: "Manage Courses" },
  { href: "/admin/sessions", label: "Manage Sessions" },
  { href: "/admin/assignments", label: "Manage Assignments" },
  { href: "/admin/tracks", label: "Manage Tracks" },
  { href: "/admin/track-courses", label: "Track Courses" },
  { href: "/admin/course-teachers", label: "Course Teachers" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/levels", label: "Levels" },
  { href: "/admin/search", label: "Search Center" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard-stats");
      const data = await res.json();

      if (res.ok) {
        setStats(data || {});
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Control the Memz Academy structure, users, and learning flow.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Users</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loading ? "..." : stats.users ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Approved Students</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loading ? "..." : stats.approvedStudents ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Courses</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loading ? "..." : stats.courses ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Sessions</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loading ? "..." : stats.sessions ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Assignments</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loading ? "..." : stats.assignments ?? 0}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--memz-muted)]">Submissions</p>
              <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                {loading ? "..." : stats.submissions ?? 0}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h2 className="mb-5 text-2xl font-bold text-[var(--memz-text)]">
              Quick Access
            </h2>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5 font-semibold text-[var(--memz-text)] transition hover:shadow-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}