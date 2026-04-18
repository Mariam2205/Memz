"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";

type CourseItem = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  total_assignments?: number;
  submission_count?: number;
  reviewed_count?: number;
  pending_count?: number;
  completion_percent?: number;
};

type TrackItem = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

export default function StudentProgressPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgress();
  }, []);

  async function fetchProgress() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/student/my-courses");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load progress");
        return;
      }

      setCourses(data.courses || []);
      setTracks(data.tracks || []);
    } catch {
      setError("Failed to load progress");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["student", "admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              My Progress
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Follow your course completion and reviewed assignments in one place.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-[var(--memz-muted)]">Loading progress...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--memz-text)]">
                    My Courses
                  </h2>
                  <span className="rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm text-[var(--memz-primary)]">
                    {courses.length}
                  </span>
                </div>

                {courses.length === 0 ? (
                  <p className="text-[var(--memz-muted)]">
                    You are not enrolled in any courses yet.
                  </p>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-[var(--memz-text)]">
                              {course.title || course.name || "Untitled Course"}
                            </h3>
                            <p className="mt-2 text-sm text-[var(--memz-muted)]">
                              {course.description || "No description available."}
                            </p>
                          </div>

                          <Link
                            href={`/courses/${course.id}`}
                            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)]"
                          >
                            Open
                          </Link>
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-[var(--memz-text)]">
                              Completion
                            </span>
                            <span className="text-[var(--memz-muted)]">
                              {course.completion_percent ?? 0}%
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-white">
                            <div
                              className="h-full rounded-full bg-[var(--memz-primary)]"
                              style={{ width: `${course.completion_percent ?? 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-white px-3 py-1">
                            Total Assignments: {course.total_assignments ?? 0}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1">
                            Submitted: {course.submission_count ?? 0}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1">
                            Reviewed: {course.reviewed_count ?? 0}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1">
                            Pending: {course.pending_count ?? 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--memz-text)]">
                    My Tracks
                  </h2>
                  <span className="rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm text-[var(--memz-secondary)]">
                    {tracks.length}
                  </span>
                </div>

                {tracks.length === 0 ? (
                  <p className="text-[var(--memz-muted)]">
                    You are not enrolled in any tracks yet.
                  </p>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-[var(--memz-text)]">
                              {track.title || track.name || "Untitled Track"}
                            </h3>
                            <p className="mt-2 text-sm text-[var(--memz-muted)]">
                              {track.description || "No description available."}
                            </p>
                          </div>

                          <Link
                            href={`/tracks/${track.id}`}
                            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)]"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}