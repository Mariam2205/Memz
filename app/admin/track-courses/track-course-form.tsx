"use client";

import { useState } from "react";

type Track = {
  id: string;
  title: string;
};

type Course = {
  id: string;
  title: string;
  slug: string;
};

type Props = {
  tracks: Track[];
  courses: Course[];
};

export default function TrackCourseForm({ tracks, courses }: Props) {
  const [trackId, setTrackId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [sortOrder, setSortOrder] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/track-courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          track_id: trackId,
          course_id: courseId,
          sort_order: Number(sortOrder),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to add course to track.");
      }

      setMessage("Course added to track successfully.");
      setTrackId("");
      setCourseId("");
      setSortOrder("1");

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
          Track
        </label>
        <select
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          required
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--memz-primary)]"
        >
          <option value="">Select track</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          Course
        </label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--memz-primary)]"
        >
          <option value="">Select course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title} ({course.slug})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          Sort Order
        </label>
        <input
          type="number"
          min="1"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          required
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--memz-primary)]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Add to Track"}
      </button>

      {message ? <p className="text-sm text-white/80">{message}</p> : null}
    </form>
  );
}