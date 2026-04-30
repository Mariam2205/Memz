"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";

type Course = {
  id: string;
  title?: string | null;
  name?: string | null;
};

type Video = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  video_order: number | null;
  is_published: boolean | null;
  courses?: Course | null;
};

export default function AdminCourseVideosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [videoOrder, setVideoOrder] = useState("1");
  const [isPublished, setIsPublished] = useState(true);
  const [message, setMessage] = useState("");

  async function loadData() {
    const [coursesRes, videosRes] = await Promise.all([
      fetch("/api/admin/courses"),
      fetch("/api/admin/course-videos"),
    ]);

    const coursesData = await coursesRes.json();
    const videosData = await videosRes.json();

    if (coursesRes.ok) setCourses(coursesData.courses || []);
    if (videosRes.ok) setVideos(videosData.videos || []);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/admin/course-videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: courseId,
        title,
        description,
        youtube_url: youtubeUrl,
        video_order: Number(videoOrder || 1),
        is_published: isPublished,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to save video");
      return;
    }

    setMessage("Video added");
    setCourseId("");
    setTitle("");
    setYoutubeUrl("");
    setDescription("");
    setVideoOrder("1");
    setIsPublished(true);
    loadData();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this video?")) return;

    const res = await fetch("/api/admin/course-videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setMessage("Video deleted");
      loadData();
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold">Course Videos</h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Add YouTube unlisted videos to courses.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="space-y-4 rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm"
          >
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title || course.name || "Untitled Course"}
                </option>
              ))}
            </select>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Video title"
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3"
            />

            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
              placeholder="YouTube URL"
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3"
            />

            <input
              type="number"
              value={videoOrder}
              onChange={(e) => setVideoOrder(e.target.value)}
              placeholder="Order"
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video description"
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3"
            />

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Published
            </label>

            <button className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white">
              Add Video
            </button>

            {message ? <p>{message}</p> : null}
          </form>

          <div className="grid gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="rounded-3xl border border-[var(--memz-border)] bg-white p-6"
              >
                <h2 className="font-bold">{video.title}</h2>
                <p className="text-sm text-[var(--memz-muted)]">
                  Course: {video.courses?.title || video.courses?.name}
                </p>
                <p className="text-sm">Order: {video.video_order}</p>
                <button
                  onClick={() => remove(video.id)}
                  className="mt-3 rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}