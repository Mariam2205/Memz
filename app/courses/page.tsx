import { createClient } from "@supabase/supabase-js";
import CourseCard from "@/components/CourseCard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Course = {
  id: string;
  title: string | null;
  name?: string | null;
  description: string | null;
  short_description?: string | null;
  is_free: boolean | null;
  price: number | null;
};

export default async function CoursesPage() {
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, name, description, short_description, is_free, price")
    .order("created_at", { ascending: false });

  return (
    <main className="memz-page bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
      <div className="memz-container">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-primary)]">
            Explore Memz
          </p>

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Courses</h1>

          <p className="mt-4 text-lg leading-8 text-[var(--memz-muted)]">
            Browse all available courses at Memz Academy and start your journey.
          </p>
        </div>

        {error ? (
          <div className="mt-10 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-600">
            Failed to load courses: {error.message}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: Course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-[var(--memz-border)] bg-white p-6 text-[var(--memz-muted)]">
            No courses yet. Add courses in Supabase.
          </div>
        )}
      </div>
    </main>
  );
}