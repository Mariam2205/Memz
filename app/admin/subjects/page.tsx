"use client";

import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import SearchBar from "@/components/SearchBar";
import RichTextEditor from "@/components/editor/RichTextEditor";

type Subject = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  description_html?: string | null;
};

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const plainDescription = useMemo(() => {
    return descriptionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }, [descriptionHtml]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subjects");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load subjects");
        return;
      }

      setSubjects(data.subjects || []);
    } catch {
      setMessage("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(subject: Subject) {
    setEditingId(subject.id);
    setTitle(subject.title || subject.name || "");
    setDescriptionHtml(subject.description_html || subject.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId("");
    setTitle("");
    setDescriptionHtml("");
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
            plainDescription,
            descriptionHtml,
          }
        : {
            title,
            name: title,
            plainDescription,
            descriptionHtml,
          };

      const res = await fetch("/api/admin/subjects", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to save subject");
        return;
      }

      setMessage(
        editingId
          ? "Subject updated successfully"
          : "Subject created successfully"
      );
      resetForm();
      fetchSubjects();
    } catch {
      setMessage("Failed to save subject");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this subject?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/subjects", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to delete subject");
        return;
      }

      setMessage("Subject deleted successfully");
      if (editingId === id) resetForm();
      fetchSubjects();
    } catch {
      setMessage("Failed to delete subject");
    }
  }

  const filteredSubjects = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return subjects;

    return subjects.filter((subject) => {
      const titleText = (subject.title || subject.name || "").toLowerCase();
      const descText = (
        subject.description || subject.description_html || ""
      ).toLowerCase();
      return titleText.includes(q) || descText.includes(q);
    });
  }, [subjects, search]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Subjects
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Create, edit, and delete subject categories.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm space-y-4"
          >
            <h2 className="text-xl font-semibold text-[var(--memz-text)]">
              {editingId ? "Edit Subject" : "Add Subject"}
            </h2>

            <input
              type="text"
              placeholder="Subject title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            />

            <RichTextEditor
              label="Subject description"
              value={descriptionHtml}
              onChange={setDescriptionHtml}
              placeholder="Add a formatted subject description..."
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white"
              >
                {saving ? "Saving..." : editingId ? "Update Subject" : "Create Subject"}
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
              <p className="text-sm font-medium text-[var(--memz-primary)]">
                {message}
              </p>
            ) : null}
          </form>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-[var(--memz-text)]">
                Existing Subjects
              </h2>
              <div className="w-full max-w-sm">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search subjects..."
                />
              </div>
            </div>

            {loading ? (
              <p className="text-[var(--memz-muted)]">Loading subjects...</p>
            ) : filteredSubjects.length === 0 ? (
              <p className="text-[var(--memz-muted)]">No subjects found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                  >
                    <h3 className="font-semibold text-[var(--memz-text)]">
                      {subject.title || subject.name || "Untitled Subject"}
                    </h3>

                    <div
                      className="prose prose-sm mt-3 max-w-none text-[var(--memz-muted)]"
                      dangerouslySetInnerHTML={{
                        __html:
                          subject.description_html ||
                          subject.description ||
                          "<p>No description yet.</p>",
                      }}
                    />

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => startEdit(subject)}
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)]"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                      >
                        Delete
                      </button>
                    </div>
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