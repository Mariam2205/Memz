import Link from "next/link";
import { adminSupabase } from "@/lib/supabase-server";
import CourseEnrollForm from "@/components/CourseEnrollForm";

export default async function CourseEnrollPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const { data: course } = await adminSupabase
    .from("courses")
    .select("id, title, name, description, short_description, is_free, price")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) {
    return (
      <main className="memz-page bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
        <div className="memz-container">
          <Link href="/courses">← Back to Courses</Link>
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            Course not found.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="memz-page bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
      <div className="memz-container">
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-medium"
        >
          ← Back to Course Details
        </Link>

        <section className="mt-8 rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-primary)]">
            Enroll
          </p>

          <h1 className="text-4xl font-bold">
            {course.title || course.name || "Untitled Course"}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--memz-muted)]">
            {course.description ||
              course.short_description ||
              "No description available yet."}
          </p>

          <div className="mt-5 rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-4">
            Amount: {course.is_free ? "Free" : `$${course.price ?? 0}`}
          </div>
        </section>

        <CourseEnrollForm
          courseId={course.id}
          isFree={course.is_free}
          price={course.price}
        />
      </div>
    </main>
  );
}