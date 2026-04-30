"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";

type Enrollment = {
  id: string;
  enrollment_status: string | null;
  payment_status: string | null;
  courses: {
    id: string;
    title?: string | null;
    name?: string | null;
    description?: string | null;
  } | null;
};

export default function MyCoursesPage() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMyCourses() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const { data, error } = await supabase
        .from("course_enrollments")
        .select(
          `
          id,
          enrollment_status,
          payment_status,
          courses(id, title, name, description)
        `
        )
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setItems((data || []) as Enrollment[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyCourses();
  }, []);

  return (
    <RoleGuard allowedRoles={["student", "teacher", "admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              View your approved and pending enrollments.
            </p>
          </div>

          {message ? <p>{message}</p> : null}

          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <p>No courses yet.</p>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold">
                    {item.courses?.title || item.courses?.name || "Course"}
                  </h2>

                  <p className="mt-2 text-sm text-[var(--memz-muted)]">
                    Enrollment: {item.enrollment_status} | Payment:{" "}
                    {item.payment_status}
                  </p>

                  {item.enrollment_status === "approved" ? (
                    <Link
                      href={`/courses/${item.courses?.id}`}
                      className="mt-4 inline-block rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white"
                    >
                      Open Course
                    </Link>
                  ) : (
                    <p className="mt-4 text-sm text-yellow-700">
                      Waiting for admin approval.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}