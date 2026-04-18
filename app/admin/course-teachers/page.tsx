"use client";

import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/RoleGuard";

type Course = {
  id: string;
  title?: string | null;
  name?: string | null;
};

type Teacher = {
  id: string;
  full_name?: string | null;
  email?: string | null;
};

type Assignment = {
  id: string;
  course_id: string;
  teacher_id: string;
};

export default function CourseTeachersPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchData() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/course-teachers");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load data");
        return;
      }

      setCourses(data.courses || []);
      setTeachers(data.teachers || []);
      setAssignments(data.assignments || []);
    } catch {
      setMessage("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleAssign() {
    if (!selectedCourse || !selectedTeacher) {
      setMessage("Please select both a course and a teacher.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const res = await fetch("/api/admin/course-teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: selectedCourse,
          teacher_id: selectedTeacher,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to assign teacher");
        return;
      }

      setMessage(data.message || "Teacher assigned successfully");
      setSelectedCourse("");
      setSelectedTeacher("");
      fetchData();
    } catch {
      setMessage("Failed to assign teacher");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      setMessage("");

      const res = await fetch("/api/admin/course-teachers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to remove assignment");
        return;
      }

      setMessage(data.message || "Assignment removed successfully");
      fetchData();
    } catch {
      setMessage("Failed to remove assignment");
    }
  }

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses]
  );

  const teacherMap = useMemo(
    () => new Map(teachers.map((teacher) => [teacher.id, teacher])),
    [teachers]
  );

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Course Teacher Assignments
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Assign teachers to courses and manage current links.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-[var(--memz-text)]">
              Assign Teacher
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <select
                className="rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 outline-none"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title || course.name || "Untitled Course"}
                  </option>
                ))}
              </select>

              <select
                className="rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 outline-none"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name || teacher.email || "Unnamed Teacher"}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssign}
                disabled={submitting}
                className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Assigning..." : "Assign"}
              </button>
            </div>

            {message ? (
              <p className="mt-4 text-sm font-medium text-[var(--memz-primary)]">
                {message}
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-[var(--memz-text)]">
              Current Assignments
            </h2>

            {loading ? (
              <p className="text-[var(--memz-muted)]">Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p className="text-[var(--memz-muted)]">No assignments yet.</p>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const course = courseMap.get(assignment.course_id);
                  const teacher = teacherMap.get(assignment.teacher_id);

                  return (
                    <div
                      key={assignment.id}
                      className="flex flex-col gap-4 rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-[var(--memz-text)]">
                          {course?.title || course?.name || "Untitled Course"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          {teacher?.full_name || teacher?.email || "Unknown Teacher"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(assignment.id)}
                        className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
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