"use client";

import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/RoleGuard";

type Track = {
  id: string;
  title?: string | null;
  name?: string | null;
};

type Course = {
  id: string;
  title?: string | null;
  name?: string | null;
};

type Assignment = {
  id: string;
  track_id: string;
  course_id: string;
};

export default function AdminTrackCoursesPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/track-courses");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load data");
        return;
      }

      setTracks(data.tracks || []);
      setCourses(data.courses || []);
      setAssignments(data.assignments || []);
    } catch {
      setMessage("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedTrack || !selectedCourse) {
      setMessage("Please select both a track and a course.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const res = await fetch("/api/admin/track-courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          track_id: selectedTrack,
          course_id: selectedCourse,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to assign course");
        return;
      }

      setMessage(data.message || "Course assigned successfully");
      setSelectedTrack("");
      setSelectedCourse("");
      fetchData();
    } catch {
      setMessage("Failed to assign course");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      setMessage("");

      const res = await fetch("/api/admin/track-courses", {
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

  const trackMap = useMemo(
    () => new Map(tracks.map((track) => [track.id, track])),
    [tracks]
  );

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses]
  );

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Track Course Assignments
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Link courses into learning tracks.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-[var(--memz-text)]">
              Assign Course to Track
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-[var(--memz-text)] outline-none"
              >
                <option value="">Select Track</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.title || track.name || "Untitled Track"}
                  </option>
                ))}
              </select>

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-[var(--memz-text)] outline-none"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title || course.name || "Untitled Course"}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssign}
                disabled={submitting}
                className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
              Current Track-Course Links
            </h2>

            {loading ? (
              <p className="text-[var(--memz-muted)]">Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p className="text-[var(--memz-muted)]">
                No track-course assignments yet.
              </p>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const track = trackMap.get(assignment.track_id);
                  const course = courseMap.get(assignment.course_id);

                  return (
                    <div
                      key={assignment.id}
                      className="flex flex-col gap-4 rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-[var(--memz-text)]">
                          {track?.title || track?.name || "Untitled Track"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          {course?.title || course?.name || "Untitled Course"}
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