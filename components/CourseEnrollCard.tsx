"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
  const [method, setMethod] = useState("vodafone_cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function enroll() {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Please login first.");
        return;
      }

      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          course_id: courseId,
          payment_method: method,
          payment_reference: reference,
          payment_notes: notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to enroll.");
        return;
      }

      setMessage("Enrollment request sent. Wait for admin approval.");
      window.location.reload();
    } catch {
      setMessage("Failed to enroll.");
    } finally {
      setLoading(false);
    }
  }

  if (enrollmentStatus === "approved") {
    return (
      <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold">You are enrolled</h3>
        <p className="mt-2 text-[var(--memz-muted)]">
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
      <h3 className="text-xl font-bold">Enroll in this course</h3>

      <p className="mt-2 text-sm text-[var(--memz-muted)]">
        Add your payment details, then admin will approve your enrollment.
      </p>

      <div className="mt-4 space-y-3">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
        >
          <option value="vodafone_cash">Vodafone Cash</option>
          <option value="instapay">InstaPay</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
        </select>

        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Payment reference / phone number"
          className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment notes"
          className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
        />

        <button
          type="button"
          onClick={enroll}
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Sending..." : "Request Enrollment"}
        </button>

        <Link
          href="/login"
          className="block text-center text-sm font-semibold text-[var(--memz-primary)]"
        >
          Login first if you are not signed in
        </Link>

        {message ? (
          <p className="text-sm text-[var(--memz-primary)]">{message}</p>
        ) : null}
      </div>
    </div>
  );
}