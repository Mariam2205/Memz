"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";

type Course = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

type Session = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

type Enrollment = {
  id: string;
  student_id: string;
  created_at?: string;
};

type Student = {
  id: string;
  full_name?: string | null;
  email?: string | null;
};

export default function TeacherCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  async function fetchCourse() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/teacher/courses/${courseId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load course");
        return;
      }

      setCourse(data.course || null);
      setSessions(data.sessions || []);
      setEnrollments(data.enrollments || []);
      setStudents(data.students || []);
    } catch {
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  }

  const studentMap = useMemo(() => {
    return new Map(students.map((student) => [student.id, student]));
  }, [students]);

  const courseTitle = course?.title || course?.name || "Untitled Course";

  return (
    <RoleGuard allowedRoles={["teacher", "admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="mb-3 inline-flex rounded-full bg-[var(--memz-soft)] px-4 py-1 text-sm text-[var(--memz-secondary)]">
              Teacher Course View
            </div>

            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              {courseTitle}
            </h1>

            <p className="mt-3 text-[var(--memz-muted)]">
              {course?.description || "No course description available yet."}
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-[var(--memz-muted)]">Loading course details...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
                  <p className="text-sm text-[var(--memz-muted)]">Sessions</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                    {sessions.length}
                  </p>
                </div>

                <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
                  <p className="text-sm text-[var(--memz-muted)]">Students</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--memz-text)]">
                    {enrollments.length}
                  </p>
                </div>

                <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
                  <p className="text-sm text-[var(--memz-muted)]">Status</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--memz-primary)]">
                    Active Teaching View
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
                <h2 className="mb-5 text-2xl font-bold text-[var(--memz-text)]">
                  Sessions
                </h2>

                {sessions.length === 0 ? (
                  <p className="text-[var(--memz-muted)]">
                    No sessions found for this course yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                      >
                        <h3 className="text-lg font-semibold text-[var(--memz-text)]">
                          {session.title || session.name || "Untitled Session"}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--memz-muted)]">
                          {session.description || "No session description yet."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
                <h2 className="mb-5 text-2xl font-bold text-[var(--memz-text)]">
                  Enrolled Students
                </h2>

                {enrollments.length === 0 ? (
                  <p className="text-[var(--memz-muted)]">
                    No students are enrolled in this course yet.
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