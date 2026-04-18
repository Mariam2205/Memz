"use client";

import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/RoleGuard";

type SearchType = "all" | "users" | "courses" | "sessions" | "tracks";

type UserItem = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  approved?: boolean | null;
  result_type?: "users";
};

type CourseItem = {
  id: string;
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  subject_name?: string | null;
  level_name?: string | null;
  description?: string | null;
  result_type?: "courses";
};

type SessionItem = {
  id: string;
  title?: string | null;
  name?: string | null;
  session_number?: number | null;
  course_name?: string | null;
  description?: string | null;
  result_type?: "sessions";
};

type TrackItem = {
  id: string;
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  subject_name?: string | null;
  level_name?: string | null;
  description?: string | null;
  result_type?: "tracks";
};

type ResultItem = UserItem | CourseItem | SessionItem | TrackItem;

const searchFieldsByType: Record<SearchType, { value: string; label: string }[]> = {
  all: [
    { value: "smart", label: "Smart search" },
    { value: "id", label: "ID" },
    { value: "keyword", label: "Keyword" },
  ],
  users: [
    { value: "smart", label: "Smart search" },
    { value: "id", label: "User ID" },
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "role", label: "Role" },
    { value: "keyword", label: "Keyword" },
  ],
  courses: [
    { value: "smart", label: "Smart search" },
    { value: "id", label: "Course ID" },
    { value: "title", label: "Title" },
    { value: "name", label: "Name" },
    { value: "slug", label: "Slug" },
    { value: "subject", label: "Subject" },
    { value: "level", label: "Level" },
    { value: "keyword", label: "Keyword" },
  ],
  sessions: [
    { value: "smart", label: "Smart search" },
    { value: "id", label: "Session ID" },
    { value: "title", label: "Title" },
    { value: "name", label: "Name" },
    { value: "number", label: "Session Number" },
    { value: "course", label: "Course" },
    { value: "keyword", label: "Keyword" },
  ],
  tracks: [
    { value: "smart", label: "Smart search" },
    { value: "id", label: "Track ID" },
    { value: "title", label: "Title" },
    { value: "name", label: "Name" },
    { value: "slug", label: "Slug" },
    { value: "subject", label: "Subject" },
    { value: "level", label: "Level" },
    { value: "keyword", label: "Keyword" },
  ],
};

function getPlaceholder(type: SearchType, field: string) {
  if (type === "all") {
    if (field === "id") return "Search by exact ID across all sections...";
    return "Search users, courses, sessions, tracks...";
  }

  if (type === "users") {
    if (field === "email") return "Search users by email...";
    if (field === "role") return "Search users by role...";
    if (field === "id") return "Search users by exact ID...";
    if (field === "name") return "Search users by full name...";
    return "Search users by name, email, role...";
  }

  if (type === "courses") {
    if (field === "slug") return "Search courses by slug...";
    if (field === "subject") return "Search courses by subject...";
    if (field === "level") return "Search courses by level...";
    if (field === "id") return "Search courses by exact ID...";
    return "Search courses by title, slug, subject, level...";
  }

  if (type === "sessions") {
    if (field === "number") return "Search sessions by session number...";
    if (field === "course") return "Search sessions by course...";
    if (field === "id") return "Search sessions by exact ID...";
    return "Search sessions by title, number, course...";
  }

  if (type === "tracks") {
    if (field === "slug") return "Search tracks by slug...";
    if (field === "subject") return "Search tracks by subject...";
    if (field === "level") return "Search tracks by level...";
    if (field === "id") return "Search tracks by exact ID...";
    return "Search tracks by title, slug, subject, level...";
  }

  return "Search...";
}

function getResultTypeLabel(type?: string) {
  switch (type) {
    case "users":
      return "User";
    case "courses":
      return "Course";
    case "sessions":
      return "Session";
    case "tracks":
      return "Track";
    default:
      return "Result";
  }
}

export default function AdminSearchPage() {
  const [type, setType] = useState<SearchType>("all");
  const [field, setField] = useState("smart");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const availableFields = useMemo(() => {
    return searchFieldsByType[type];
  }, [type]);

  useEffect(() => {
    const firstField = searchFieldsByType[type][0]?.value || "smart";
    setField(firstField);
  }, [type]);

  useEffect(() => {
    const runSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setMessage("");
        return;
      }

      setLoading(true);
      setMessage("");

      try {
        const res = await fetch(
          `/api/admin/search?type=${type}&field=${field}&q=${encodeURIComponent(
            query
          )}`
        );

        const data = await res.json();

        if (!res.ok) {
          setResults([]);
          setMessage(data.error || "Search failed");
          return;
        }

        setResults(Array.isArray(data.results) ? data.results : []);
        setMessage("");
      } catch (error) {
        console.error(error);
        setResults([]);
        setMessage("Search failed");
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(runSearch, 300);
    return () => clearTimeout(timeout);
  }, [type, field, query]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Search Center
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Search users, courses, sessions, and tracks in one flexible admin
              search tool.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[180px_220px_1fr]">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SearchType)}
                className="h-12 rounded-xl border border-[var(--memz-border)] bg-[var(--memz-soft)] px-4 text-sm text-[var(--memz-text)] outline-none"
              >
                <option value="all">All</option>
                <option value="users">Users</option>
                <option value="courses">Courses</option>
                <option value="sessions">Sessions</option>
                <option value="tracks">Tracks</option>
              </select>

              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="h-12 rounded-xl border border-[var(--memz-border)] bg-[var(--memz-soft)] px-4 text-sm text-[var(--memz-text)] outline-none"
              >
                {availableFields.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={getPlaceholder(type, field)}
                className="h-12 rounded-xl border border-[var(--memz-border)] bg-white px-4 text-sm text-[var(--memz-text)] outline-none focus:border-[var(--memz-primary)]"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["student", "teacher", "design", "beginner", "1", "slug"].map(
                (chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setQuery(chip)}
                    className="rounded-full border border-[var(--memz-border)] bg-[var(--memz-soft)] px-3 py-1 text-xs text-[var(--memz-muted)]"
                  >
                    {chip}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
            {loading ? (
              <p className="text-sm text-[var(--memz-muted)]">Searching...</p>
            ) : message ? (
              <p className="text-sm text-red-500">{message}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-[var(--memz-muted)]">
                Start typing above to search everything in a more customized
                way.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.map((item) => (
                  <div
                    key={`${item.result_type}-${item.id}`}
                    className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--memz-primary)]">
                        {getResultTypeLabel(item.result_type)}
                      </span>
                      <span className="text-xs text-[var(--memz-muted)]">
                        ID: {item.id}
                      </span>
                    </div>

                    {item.result_type === "users" && (
                      <>
                        <h3 className="font-semibold text-[var(--memz-text)]">
                          {item.full_name || "Unnamed user"}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          {item.email || "No email"}
                        </p>
                        <p className="mt-2 text-xs text-[var(--memz-muted)]">
                          Role: {item.role || "No role"} •{" "}
                          {item.approved ? "Approved" : "Blocked"}
                        </p>
                      </>
                    )}

                    {item.result_type === "courses" && (
                      <>
                        <h3 className="font-semibold text-[var(--memz-text)]">
                          {item.title || item.name || "Untitled Course"}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          Slug: {item.slug || "No slug"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          Subject: {item.subject_name || "No subject"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          Level: {item.level_name || "No level"}
                        </p>
                      </>
                    )}

                    {item.result_type === "sessions" && (
                      <>
                        <h3 className="font-semibold text-[var(--memz-text)]">
                          {item.title || item.name || "Untitled Session"}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          Course: {item.course_name || "No course"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          Session Number: {item.session_number ?? "-"}
                        </p>
                      </>
                    )}

                    {item.result_type === "tracks" && (
                      <>
                        <h3 className="font-semibold text-[var(--memz-text)]">
                          {item.title || item.name || "Untitled Track"}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          Slug: {item.slug || "No slug"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          Subject: {item.subject_name || "No subject"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--memz-muted)]">
                          Level: {item.level_name || "No level"}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}