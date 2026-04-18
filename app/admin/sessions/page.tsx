"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import SearchBar from "@/components/SearchBar";

type SessionItem = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  course_id?: string | null;
};

type CourseItem = {
  id: string;
  title?: string | null;
  name?: string | null;
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchCourses();
  }, []);

  async function fetchSessions() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/sessions");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load sessions");
        return;
      }

      setSessions(data.sessions || []);
    } catch {
      setMessage("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourses() {
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();

      if (res.ok) {
        setCourses(data.courses || []);
      }
    } catch {}
  }

  function startEdit(session: SessionItem) {
    setEditingId(session.id);
    setTitle(session.title || session.name || "");
    setDescription(session.description || "");
    setCourseId(session.course_id || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId("");
    setTitle("");
    setDescription("");
    setCourseId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const method = editingId ? "PATCH" : "POST";
      const body = editingId
        ? {
            id: editingId,
            title,
            name: title,
            description,
            course_id: courseId || null,
          }
        : {
            title,
            name: title,
            description,
            course_id: courseId || null,
          };

      const res = await fetch("/api/admin/sessions", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to save session");
        return;
      }

      setMessage(editingId ? "Session updated successfully" : "Session created successfully");
      resetForm();
      fetchSessions();
    } catch {
      setMessage("Failed to save session");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this session?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to delete session");
        return;
      }

      setMessage("Session deleted successfully");
      if (editingId === id) resetForm();
      fetchSessions();
    } catch {
      setMessage("Failed to delete session");
    }
  }

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses]
  );

  const filteredSessions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sessions;

    return sessions.filter((session) => {
      const titleText = (session.title || session.name || "").toLowerCase();
      const descText = (session.description || "").toLowerCase();
      const courseTitle = session.course_id
        ? (
            courseMap.get(session.course_id)?.title ||
            courseMap.get(session.course_id)?.name ||
            ""
          ).toLowerCase()
        : "";

      return (
        titleText.includes(q) ||
        descText.includes(q) ||
        courseTitle.includes(q)
      );
    });
  }, [sessions, search, courseMap]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">Sessions</h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Create, edit, and delete sessions.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-[var(--memz-text)]">
              {editingId ? "Edit Session" : "Add Session"}
            </h2>

            <input
              type="text"
              placeholder="Session title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            />

            <textarea
              placeholder="Session description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            />

            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title || course.name || "Untitled Course"}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white"
              >
                {saving ? "Saving..." : editingId ? "Update Session" : "Create Session"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-[var(--memz-border)] px-5 py-3 font-semibold text-[var(--memz-text)]"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>

            {message ? (
              <p className="text-sm font-medium text-[var(--memz-primary)]">{message}</p>
            ) : null}
          </form>

          <div className="space-y-5 rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-[var(--memz-text)]">Existing Sessions</h2>

              <div className="w-full max-w-sm">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search sessions..."
                />
              </div>
            </div>

            {loading ? (
              <p className="text-[var(--memz-muted)]">Loading sessions...</p>
            ) : filteredSessions.length === 0 ? (
              <p className="text-[var(--memz-muted)]">No sessions found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSessions.map((session) => {
                  const course = session.course_id ? courseMap.get(session.course_id) : null;

                  return (
                    <div
                      key={session.id}
                      className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                    >
                      <Link href={`/admin/sessions/${session.id}`}>
                        <h3 className="font-semibold text-[var(--memz-text)]">
                          {session.title || session.name || "Untitled Session"}
                        </h3>
                      </Link>

                      <p className="mt-2 text-sm text-[var(--memz-muted)]">
                        {session.description || "No description yet."}
                      </p>

                      <div className="mt-4 text-xs">
                        <span className="rounded-full bg-white px-3 py-1">
                          {course?.title || course?.name || "No Course"}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => startEdit(session)}
                          className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(session.id)}
                          className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </div>
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