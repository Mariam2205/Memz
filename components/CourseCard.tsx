"use client";

import Link from "next/link";

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
  return (
    <div className="rounded-[28px] border border-[var(--memz-border)] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">
        {course.title || course.name || "Untitled Course"}
      </h2>

      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--memz-muted)]">
        {course.description || course.short_description || "No description yet."}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 text-sm font-semibold">
          {course.is_free ? "Free" : `$${course.price ?? 0}`}
        </span>

        <div className="flex gap-2">
          <Link
            href={`/courses/${course.id}`}
            className="rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-semibold"
          >
            View
          </Link>

          <Link
            href={`/courses/${course.id}/enroll`}
            className="rounded-2xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Enroll
          </Link>
        </div>
      </div>
    </div>
  );
}