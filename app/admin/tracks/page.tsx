"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { slugify } from "@/lib/slugify";

type SubjectItem = {
  id: string;
  name?: string;
  title?: string;
};

type LevelItem = {
  id: string;
  name?: string;
  title?: string;
};

type TrackItem = {
  id: string;
  display_title: string;
  display_description: string;
  subject_name: string;
  level_name: string;
  subject_id?: string | null;
  level_id?: string | null;
  slug?: string;
};

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [levels, setLevels] = useState<LevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");

  const slug = useMemo(() => slugify(title), [title]);

  const plainDescription = useMemo(() => {
    return descriptionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }, [descriptionHtml]);

  const loadTracks = async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tracks?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setTracks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    const [{ data: subjectsData }, { data: levelsData }] = await Promise.all([
      supabase.from("subjects").select("id, name, title").order("name"),
      supabase.from("levels").select("id, name, title").order("name"),
    ]);

    setSubjects(subjectsData || []);
    setLevels(levelsData || []);
  };

  useEffect(() => {
    loadTracks();
    loadMeta();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadTracks(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescriptionHtml("");
    setSubjectId("");
    setLevelId("");
  };

  const handleEdit = (track: TrackItem) => {
    setEditingId(track.id);
    setTitle(track.display_title || "");
    setDescriptionHtml(track.display_description || "");
    setSubjectId(track.subject_id || "");
    setLevelId(track.level_id || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Track title is required.");
      return;
    }

    if (!slug.trim()) {
      alert("Slug could not be generated.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        id: editingId,
        title,
        slug,
        plainDescription,
        descriptionHtml,
        subjectId: subjectId || null,
        levelId: levelId || null,
      };

      const res = await fetch("/api/admin/tracks", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save track");
      }

      resetForm();
      loadTracks(search);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Track save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--memz-primary)]">
          Tracks
        </h1>
        <p className="mt-2 text-sm text-[var(--memz-muted)]">
          Create tracks with rich descriptions and searchable data.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--memz-text)]">
              Track title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter track title"
              className="h-12 w-full rounded-xl border border-[var(--memz-border)] bg-white px-4 outline-none focus:border-[var(--memz-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--memz-text)]">
              Auto slug
            </label>
            <input
              type="text"
              value={slug}
              readOnly
              className="h-12 w-full rounded-xl border border-[var(--memz-border)] bg-[var(--memz-soft)] px-4 text-[var(--memz-muted)] outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--memz-text)]">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="h-12 w-full rounded-xl border border-[var(--memz-border)] bg-white px-4 outline-none focus:border-[var(--memz-primary)]"
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name || subject.title || "Untitled Subject"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--memz-text)]">
              Level
            </label>
            <select
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
              className="h-12 w-full rounded-xl border border-[var(--memz-border)] bg-white px-4 outline-none focus:border-[var(--memz-primary)]"
            >
              <option value="">Select level</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name || level.title || "Untitled Level"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <RichTextEditor
          label="Track description"
          value={descriptionHtml}
          onChange={setDescriptionHtml}
          placeholder="Add a rich description for this track..."
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01] disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Update track" : "Create track"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-[var(--memz-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--memz-text)]"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold text-[var(--memz-secondary)]">
            Existing Tracks
          </h2>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracks by title or slug..."
            className="h-11 w-full rounded-xl border border-[var(--memz-border)] bg-white px-4 outline-none focus:border-[var(--memz-primary)] md:max-w-sm"
          />
        </div>

        {loading ? (
          <p className="text-sm text-[var(--memz-muted)]">Loading tracks...</p>
        ) : tracks.length === 0 ? (
          <p className="text-sm text-[var(--memz-muted)]">No tracks found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--memz-text)]">
                      {track.display_title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--memz-muted)]">
                      {track.subject_name} • {track.level_name}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEdit(track)}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)] shadow-sm"
                  >
                    Edit
                  </button>
                </div>

                <div
                  className="prose prose-sm mt-4 max-w-none text-[var(--memz-text)]"
                  dangerouslySetInnerHTML={{
                    __html:
                      track.display_description || "<p>No description yet.</p>",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}