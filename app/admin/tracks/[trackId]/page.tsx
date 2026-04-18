"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";

type Track = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

type LinkedCourseRow = {
  id: string;
  track_id: string;
  course_id: string;
};

type Course = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

type Enrollment = {
  id: string;
  student_id: string;
};

type Student = {
  id: string;
  full_name?: string | null;
  email?: string | null;
};

export default function AdminTrackDetailsPage() {
  const params = useParams();
  const trackId = params.trackId as string;

  const [track, setTrack] = useState<Track | null>(null);
  const [linkedCoursesRows, setLinkedCoursesRows] = useState<LinkedCourseRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrackDetails();
  }, [trackId]);

  async function fetchTrackDetails() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/tracks/${trackId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load track details");
        return;
      }

      setTrack(data.track || null);
      setLinkedCoursesRows(data.linkedCoursesRows || []);
      setCourses(data.courses || []);
      setEnrollments(data.enrollments || []);
      setStudents(data.students || []);
    } catch {
      setError("Failed to load track details");
    } finally {
      setLoading(false);
    }
  }

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses]
  );

  const studentMap = useMemo(
    () => new Map(students.map((student) => [student.id, student])),
    [students]
  );

  const trackTitle = track?.title || track?.name || "Untitled Track";

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-3 inline-flex rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm text-[var(--memz-secondary)]">
              Admin Track View
            </div>

            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              {trackTitle}
            </h1>

            <p className="mt-3 text-[var(--memz-muted)]">
              {track?.description || "No track description available yet."}
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-[var(--memz-muted)]">Loading track details...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
                  <p className="text-sm text-[var(--memz-muted)]">Linked Courses</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                    {linkedCoursesRows.length}
                  </p>
                </div>

                <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
                  <p className="text-sm text-[var(--memz-muted)]">Enrollments</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                    {enrollments.length}
                  </p>
                </div>

                <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
                  <p className="text-sm text-[var(--memz-muted)]">Track Status</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--memz-primary)]">
                    Active
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
                <h2 className="mb-5 text-2xl font-bold text-[var(--memz-text)]">
                  Linked Courses
                </h2>

                {linkedCoursesRows.length === 0 ? (
                  <p className="text-[var(--memz-muted)]">
                    No courses linked to this track yet.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {linkedCoursesRows.map((row) => {
                      const course = courseMap.get(row.course_id);

                      return (
                        <div
                          key={row.id}
                          className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                        >
                          <h3 className="text-lg font-semibold text-[var(--memz-text)]">
                            {course?.title || course?.name || "Untitled Course"}
                          </h3>
                          <p className="mt-2 text-sm text-[var(--memz-muted)]">
                            {course?.description || "No description available."}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
                <h2 className="mb-5 text-2xl font-bold text-[var(--memz-text)]">
                  Enrolled Students
                </h2>

                {enrollments.length === 0 ? (
                  <p className="text-[var(--memz-muted)]">
                    No students enrolled in this track yet.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {enrollments.map((enrollment) => {
                      const student = studentMap.get(enrollment.student_id);

                      return (
                        <div
                          key={enrollment.id}
                          className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                        >
                          <h3 className="text-lg font-semibold text-[var(--memz-text)]">
                            {student?.full_name || "Unnamed Student"}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--memz-muted)]">
                            {student?.email || enrollment.student_id}
                          </p>
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