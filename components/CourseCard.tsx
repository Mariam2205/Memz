"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Course = {
  id: string;
  title: string | null;
  name?: string | null;
  description: string | null;
  short_description?: string | null;
  is_free: boolean | null;
  price: number | null;
};

export default function CourseCard({ course }: { course: Course }) {
  async function handleEnroll() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Please login first");
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/student/enroll-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          courseId: course.id,
          paymentMethod: course.is_free ? "cash_wallet" : "instapay",
          paymentReference: null,
          paymentNotes: null,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to enroll");
        return;
      }

      alert(data.message || "Enrollment request submitted successfully");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  return (
    <div className="group rounded-[28px] border border-[var(--memz-border)] bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
      <div className="mb-4 h-40 w-full rounded-2xl bg-[var(--memz-soft)]" />

      <h2 className="text-xl font-semibold">
        {course.title || course.name || "Untitled Course"}
      </h2>

      <p className="mt-3 text-sm text-[var(--memz-muted)]">
        {course.description || course.short_description || "No description yet."}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            course.is_free
              ? "bg-green-100 text-green-600"
              : "bg-[var(--memz-soft)] text-[var(--memz-text)]"
          }`}
        >
          {course.is_free ? "Free" : `$${course.price ?? 0}`}
        </span>
      </div>

      <div className="mt-5 flex gap-3">
        <Link
          href={`/courses/${course.id}`}
          className="rounded-xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          View
        </Link>

        <button
          onClick={handleEnroll}
          className="rounded-xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)] transition hover:bg-[var(--memz-soft)]"
        >
          Enroll
        </button>
      </div>
    </div>
  );
}