"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";

type TrackEnrollment = {
  id: string;
  track_id: string;
  payment_method?: string | null;
  payment_status?: string | null;
  enrollment_status?: string | null;
};

type Track = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

type TrackCourse = {
  id: string;
  track_id: string;
  course_id: string;
};

type Course = {
  id: string;
  title?: string | null;
  name?: string | null;
};

type CourseEnrollment = {
  id: string;
  course_id: string;
  enrollment_status?: string | null;
};

export default function StudentTrackProgressPage() {
  const [trackEnrollments, setTrackEnrollments] = useState<TrackEnrollment[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackCourses, setTrackCourses] = useState<TrackCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrackProgress();
  }, []);

  async function fetchTrackProgress() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/student/track-progress", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load track progress");
        return;
      }

      setTrackEnrollments(data.trackEnrollments || []);
      setTracks(data.tracks || []);
      setTrackCourses(data.trackCourses || []);
      setCourses(data.courses || []);
      setCourseEnrollments(data.courseEnrollments || []);
    } catch {
      setError("Failed to load track progress");
    } finally {
      setLoading(false);
    }
  }

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses]
  );

  const approvedCourseIds = useMemo(
    () =>
      new Set(
        courseEnrollments
          .filter((enrollment) => enrollment.enrollment_status === "approved")
          .map((enrollment) => enrollment.course_id)
      ),
    [courseEnrollments]
  );

  function getTrackCourses(trackId: string) {
    return trackCourses.filter((row) => row.track_id === trackId);
  }

  return (
    <RoleGuard allowedRoles={["student", "admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Track Progress
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Follow your track enrollment status and see which linked courses are approved.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-[var(--memz-muted)]">Loading track progress...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-red-500">{error}</p>
            </div>
          ) : trackEnrollments.length === 0 ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-[var(--memz-muted)]">
                You are not enrolled in any tracks yet.
              </p>

              <Link
                href="/tracks"
                className="mt-4 inline-block rounded-2xl bg-[var(--memz-primary)] px-4 py-2 text-sm font-semibold text-white"
              >
                Browse Tracks
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {trackEnrollments.map((enrollment) => {
                const track = tracks.find((item) => item.id === enrollment.track_id);
                const linkedCourses = getTrackCourses(enrollment.track_id);
                const approvedCount = linkedCourses.filter((row) =>
                  approvedCourseIds.has(row.course_id)
                ).length;
                const totalCount = linkedCourses.length;
                const progressPercent =
                  totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

                return (
                  <div
                    key={enrollment.id}
                    className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-[var(--memz-text)]">
                          {track?.title || track?.name || "Untitled Track"}
                        </h2>
                        <p className="mt-2 text-[var(--memz-muted)]">
                          {track?.description || "No description available."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-[var(--memz-soft)] px-3 py-1">
                            Payment Method: {enrollment.payment_method || "-"}
                          </span>
                          <span className="rounded-full bg-[var(--memz-soft)] px-3 py-1">
                            Payment Status: {enrollment.payment_status || "-"}
                          </span>
                          <span className="rounded-full bg-[var(--memz-soft)] px-3 py-1">
                            Enrollment Status: {enrollment.enrollment_status || "-"}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/tracks/${enrollment.track_id}`}
                        className="rounded-2xl bg-[var(--memz-soft)] px-4 py-2 text-sm font-semibold text-[var(--memz-primary)]"
                      >
                        Open Track
                      </Link>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-[var(--memz-text)]">
                          Approved Course Progress
                        </span>
                        <span className="text-[var(--memz-muted)]">
                          {approvedCount}/{totalCount} courses approved
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-[var(--memz-soft)]">
                        <div
                          className="h-full rounded-full bg-[var(--memz-primary)]"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <p className="mt-2 text-sm text-[var(--memz-secondary)]">
                        {progressPercent}% complete
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {linkedCourses.length === 0 ? (
                        <p className="text-[var(--memz-muted)]">
                          No courses linked to this track yet.
                        </p>
                      ) : (
                        linkedCourses.map((row) => {
                          const course = courseMap.get(row.course_id);
                          const approved = approvedCourseIds.has(row.course_id);

                          return (
                            <div
                              key={row.id}
                              className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold text-[var(--memz-text)]">
                                    {course?.title || course?.name || "Untitled Course"}
                                  </h3>
                                  <p className="mt-1 text-sm text-[var(--memz-muted)]">
                                    {approved ? "Approved" : "Not approved yet"}
                                  </p>
                                </div>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    approved
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {approved ? "Approved" : "Pending"}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
