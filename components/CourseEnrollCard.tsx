"use client";

import { useState } from "react";

type Props = {
  courseId: string;
  courseTitle?: string | null;
  isFree?: boolean | null;
  price?: number | null;
};

export default function CourseEnrollCard({
  courseId,
  courseTitle,
  isFree,
  price,
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState("cash_wallet");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleEnroll() {
    try {
      setLoading(true);
      setSuccess("");
      setError("");

      const res = await fetch("/api/student/enroll-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          paymentMethod,
          paymentReference,
          paymentNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit enrollment");
        return;
      }

      setSuccess(data.message || "Enrollment request submitted successfully");
    } catch {
      setError("Failed to submit enrollment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
      <div className="mb-4 inline-flex rounded-2xl bg-[var(--memz-soft)] px-3 py-1 text-xs font-semibold text-[var(--memz-primary)]">
        Enrollment
      </div>

      <h2 className="text-2xl font-bold text-[var(--memz-text)]">
        Enroll in {courseTitle || "this course"}
      </h2>

      <p className="mt-3 text-sm leading-7 text-[var(--memz-muted)]">
        Submit your payment details to request enrollment. Your request will stay
        pending until it is reviewed.
      </p>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 font-medium">
          {isFree ? "Free" : `$${price ?? 0}`}
        </span>
        <span className="rounded-full bg-yellow-100 px-4 py-2 font-medium text-yellow-800">
          Status: Pending approval after payment submission
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 outline-none"
          >
            <option value="cash_wallet">Cash Wallet</option>
            <option value="instapay">Instapay</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
            Payment Reference
          </label>
          <input
            type="text"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="Transaction ID / reference number"
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
            Payment Notes
          </label>
          <textarea
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Any extra note about your payment"
            rows={4}
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 outline-none"
          />
        </div>

        <button
          onClick={handleEnroll}
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : isFree ? "Enroll Now" : "Pay & Enroll"}
        </button>

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}