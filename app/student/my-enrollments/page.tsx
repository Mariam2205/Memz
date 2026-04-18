"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/RoleGuard";

type EnrollmentItem = {
  id: string;
  course_id?: string;
  track_id?: string;
  created_at?: string;
  payment_method?: string | null;
  payment_status?: string | null;
  payment_reference?: string | null;
  payment_notes?: string | null;
  enrollment_status?: string | null;
  approved_at?: string | null;
};

type Course = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

type Track = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

export default function MyEnrollmentsPage() {
  const [courseEnrollments, setCourseEnrollments] = useState<EnrollmentItem[]>([]);
  const [trackEnrollments, setTrackEnrollments] = useState<EnrollmentItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/student/my-enrollments");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load enrollments");
        return;
      }

      setCourseEnrollments(data.courseEnrollments || []);
      setTrackEnrollments(data.trackEnrollments || []);
      setCourses(data.courses || []);
      setTracks(data.tracks || []);
    } catch {
      setError("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }

  const courseMap = useMemo(() => {
    return new Map(courses.map((course) => [course.id, course]));
  }, [courses]);

  const trackMap = useMemo(() => {
    return new Map(tracks.map((track) => [track.id, track]));
  }, [tracks]);

  return (
    <RoleGuard allowedRoles={["student", "admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              My Enrollments
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              See all your requested and approved course and track enrollments.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-[var(--memz-muted)]">Loading enrollments...</p>
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
                    Enrolled Courses
                  </h2>
                  <span className="rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm text-[var(--memz-primary)]">
                    {courseEnrollments.length}
                  </span>
                </div>

                {courseEnrollments.length === 0 ? (
                  <p className="text-[var(--memz-muted)]">
                    You have not enrolled in any courses yet.
                  </p>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {courseEnrollments.map((item) => {
                      const course = item.course_id ? courseMap.get(item.course_id) : null;
                      const title =
                        course?.title || course?.name || "Untitled Course";

                      return (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                        >
                          <h3 className="text-xl font-semibold text-[var(--memz-text)]">
                            {title}
                          </h3>

                          <p className="mt-2 text-sm text-[var(--memz-muted)]">
                            {course?.description || "No course description yet."}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-white px-3 py-1">
                              Payment Method: {item.payment_method || "-"}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1">
                              Payment Status: {item.payment_status || "-"}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1">
                              Enrollment Status: {item.enrollment_status || "-"}
                            </span>
                          </div>

                          {item.payment_reference ? (
                            <p className="mt-3 text-xs text-[var(--memz-muted)]">
                              <span className="font-semibold">Reference:</span>{" "}
                              {item.payment_reference}
                            </p>
                          ) : null}

                          {item.payment_notes ? (
                            <p className="mt-1 text-xs text-[var(--memz-muted)]">
                              <span className="font-semibold">Notes:</span>{" "}
                              {item.payment_notes}
                            </p>
                          ) : null}

                          {item.created_at ? (
                            <p className="mt-1 text-xs text-[var(--memz-muted)]">
                              <span className="font-semibold">Requested At:</span>{" "}
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          ) : null}

                          {item.approved_at ? (
                            <p className="mt-1 text-xs text-[var(--memz-muted)]">
                              <span className="font-semibold">Approved At:</span>{" "}
                              {new Date(item.approved_at).toLocaleString()}
                            </p>
                          ) : null}

                          <div className="mt-4 flex gap-3">
                            <Link
                              href={`/courses/${course?.id}`}
                              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)] shadow-sm"
                            >
                              Open Course
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--memz-text)]">
                    Enrolled Tracks
                  </h2>
                  <span className="rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm text-[var(--memz-secondary)]">
                    {trackEnrollments.length}
                  </span>
                </div>

                {trackEnrollments.length === 0 ? (
                  <p className="text-[var(--memz-muted)]">
                    You have not enrolled in any tracks yet.
                  </p>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {trackEnrollments.map((item) => {
                      const track = item.track_id ? trackMap.get(item.track_id) : null;
                      const title =
                        track?.title || track?.name || "Untitled Track";

                      return (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                        >
                          <h3 className="text-xl font-semibold text-[var(--memz-text)]">
                            {title}
                          </h3>

                          <p className="mt-2 text-sm text-[var(--memz-muted)]">
                            {track?.description || "No track description yet."}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-white px-3 py-1">
                              Payment Method: {item.payment_method || "-"}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1">
                              Payment Status: {item.payment_status || "-"}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1">
                              Enrollment Status: {item.enrollment_status || "-"}
                            </span>
                          </div>

                          {item.payment_reference ? (
                            <p className="mt-3 text-xs text-[var(--memz-muted)]">
                              <span className="font-semibold">Reference:</span>{" "}
                              {item.payment_reference}
                            </p>
                          ) : null}

                          {item.payment_notes ? (
                            <p className="mt-1 text-xs text-[var(--memz-muted)]">
                              <span className="font-semibold">Notes:</span>{" "}
                              {item.payment_notes}
                            </p>
                          ) : null}

                          {item.created_at ? (
                            <p className="mt-1 text-xs text-[var(--memz-muted)]">
                              <span className="font-semibold">Requested At:</span>{" "}
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          ) : null}

                          {item.approved_at ? (
                            <p className="mt-1 text-xs text-[var(--memz-muted)]">
                              <span className="font-semibold">Approved At:</span>{" "}
                              {new Date(item.approved_at).toLocaleString()}
                            </p>
                          ) : null}

                          <div className="mt-4 flex gap-3">
                            <Link
                              href={`/tracks/${track?.id}`}
                              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)] shadow-sm"
                            >
                              Open Track
                            </Link>
                          </div>
                        </div>
                      );
                    })}
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