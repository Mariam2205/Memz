"use client";

import { useState } from "react";

type Course = {
  id: string;
  title: string;
  slug: string;
};

type Props = {
  courses: Course[];
};

export default function SessionForm({ courses }: Props) {
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [sessionNumber, setSessionNumber] = useState("1");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [liveSessionUrl, setLiveSessionUrl] = useState("");
  const [quizEnabled, setQuizEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
          title,
          session_number: Number(sessionNumber),
          description,
          video_url: videoUrl,
          text_content: textContent,
          file_url: fileUrl,
          live_session_url: liveSessionUrl,
          quiz_enabled: quizEnabled,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create session.");
      }

      setMessage("Session added successfully.");
      setCourseId("");
      setTitle("");
      setSessionNumber("1");
      setDescription("");
      setVideoUrl("");
      setTextContent("");
      setFileUrl("");
      setLiveSessionUrl("");
      setQuizEnabled(false);

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
          Session Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Introduction to Magic Blocks"
          required
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[var(--memz-primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          Session Number
        </label>
        <input
          type="number"
          min="1"
          value={sessionNumber}
          onChange={(e) => setSessionNumber(e.target.value)}
          required
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[var(--memz-primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Session summary"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[var(--memz-primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          Video URL
        </label>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[var(--memz-primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          Text Content
        </label>
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          rows={4}
          placeholder="Learning text content"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[var(--memz-primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          File URL
        </label>
        <input
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[var(--memz-primary)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/85">
          Live Session URL
        </label>
        <input
          value={liveSessionUrl}
          onChange={(e) => setLiveSessionUrl(e.target.value)}
          placeholder="https://meet..."
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[var(--memz-primary)]"
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <input
          type="checkbox"
          checked={quizEnabled}
          onChange={(e) => setQuizEnabled(e.target.checked)}
        />
        <span className="text-sm text-white/85">Enable quiz for this session</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Add Session"}
      </button>

      {message ? <p className="text-sm text-white/80">{message}</p> : null}
    </form>
  );
}