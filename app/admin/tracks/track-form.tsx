"use client";

import { useState } from "react";

type Subject = {
  id: string;
  name: string;
};

type Level = {
  id: string;
  name: string;
};

type Props = {
  subjects: Subject[];
  levels: Level[];
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function TrackForm({ subjects, levels }: Props) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("0");
  const [certificateAvailable, setCertificateAvailable] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug: slug || makeSlug(title),
          description,
          subject_id: subjectId || null,
          level_id: levelId || null,
          is_free: isFree,
          price: isFree ? 0 : Number(price || 0),
          certificate_available: certificateAvailable,
          is_published: isPublished,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create track.");
      }

      setMessage("Track added successfully.");
      setTitle("");
      setSlug("");
      setDescription("");
      setSubjectId("");
      setLevelId("");
      setIsFree(true);
      setPrice("0");
      setCertificateAvailable(false);
      setIsPublished(false);

      window.location.reload();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Something went wrong.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          Track Title
        </label>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) setSlug(makeSlug(e.target.value));
          }}
          placeholder="Memverse Builders"
          required
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[var(--memz-primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          Slug
        </label>
        <input
          value={slug}
          onChange={(e) => setSlug(makeSlug(e.target.value))}
          placeholder="memverse-builders"
          required
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[var(--memz-primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Short track description"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[var(--memz-primary)]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/85">
            Subject
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--memz-primary)]"
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/85">
            Level
          </label>
          <select
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--memz-primary)]"
          >
            <option value="">Select level</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
          />
          <span className="text-sm text-white/85">Free track</span>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span className="text-sm text-white/85">Published</span>
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <input
          type="checkbox"
          checked={certificateAvailable}
          onChange={(e) => setCertificateAvailable(e.target.checked)}
        />
        <span className="text-sm text-white/85">Certificate available</span>
      </label>

      {!isFree ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-white/85">
            Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="100"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[var(--memz-primary)]"
          />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Add Track"}
      </button>

      {message ? <p className="text-sm text-white/80">{message}</p> : null}
    </form>
  );
}