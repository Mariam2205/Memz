"use client";

import Link from "next/link";

type Props = {
  courseId: string;
  enrollmentStatus?: string | null;
  paymentStatus?: string | null;
};

export default function CourseEnrollCard({
  courseId,
  enrollmentStatus,
  paymentStatus,
}: Props) {
  if (enrollmentStatus === "approved") {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-green-800">You are enrolled</h3>
        <p className="mt-2 text-green-700">
          You can now view the course videos.
        </p>
      </div>
    );
  }

  if (enrollmentStatus === "pending") {
    return (
      <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-yellow-800">
          Enrollment pending
        </h3>
        <p className="mt-2 text-yellow-700">
          Payment: {paymentStatus || "pending"}. Wait for admin approval.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold">Want to join this course?</h3>
      <p className="mt-2 text-[var(--memz-muted)]">
        Open the enrollment page and submit your payment proof.
      </p>

      <Link
        href={`/courses/${courseId}/enroll`}
        className="mt-5 inline-block rounded-2xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-5 py-3 font-semibold text-white"
      >
        Enroll Now
      </Link>
    </div>
  );
}