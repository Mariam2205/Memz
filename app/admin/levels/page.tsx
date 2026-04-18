"use client";

import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import SearchBar from "@/components/SearchBar";

type Level = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
};

export default function AdminLevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, []);

  async function fetchLevels() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/levels");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load levels");
        return;
      }

      setLevels(data.levels || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to load levels"
      );
    } finally {
      setLoading(false);
    }
  }

  function startEdit(level: Level) {
    setEditingId(level.id);
    setTitle(level.title || level.name || "");
    setDescription(level.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId("");
    setTitle("");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Level title is required");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const method = editingId ? "PATCH" : "POST";
      const body = editingId
        ? {
            id: editingId,
            title: title.trim(),
            name: title.trim(),
            description: description.trim() || null,
          }
        : {
            title: title.trim(),
            name: title.trim(),
            description: description.trim() || null,
          };

      const res = await fetch("/api/admin/levels", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to save level");
        return;
      }

      setMessage(
        editingId ? "Level updated successfully" : "Level created successfully"
      );
      resetForm();
      fetchLevels();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save level"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this level?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/levels", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to delete level");
        return;
      }

      setMessage("Level deleted successfully");
      if (editingId === id) resetForm();
      fetchLevels();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to delete level"
      );
    }
  }

  const filteredLevels = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return levels;

    return levels.filter((level) => {
      const titleText = (level.title || level.name || "").toLowerCase();
      const descText = (level.description || "").toLowerCase();
      return titleText.includes(q) || descText.includes(q);
    });
  }, [levels, search]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">Levels</h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Create, edit, and delete learning levels.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-[var(--memz-text)]">
              {editingId ? "Edit Level" : "Add Level"}
            </h2>

            <input
              type="text"
              placeholder="Level title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
              required
            />

            <textarea
              placeholder="Level description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update Level" : "Create Level"}
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

          <div className="space-y-5 rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-[var(--memz-text)]">
                Existing Levels
              </h2>

              <div className="w-full max-w-sm">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search levels..."
                />
              </div>
            </div>

            {loading ? (
              <p className="text-[var(--memz-muted)]">Loading levels...</p>
            ) : filteredLevels.length === 0 ? (
              <p className="text-[var(--memz-muted)]">No levels found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredLevels.map((level) => (
                  <div
                    key={level.id}
                    className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                  >
                    <h3 className="font-semibold text-[var(--memz-text)]">
                      {level.title || level.name || "Untitled Level"}
                    </h3>

                    <p className="mt-2 text-sm text-[var(--memz-muted)]">
                      {level.description || "No description yet."}
                    </p>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(level)}
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(level.id)}
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