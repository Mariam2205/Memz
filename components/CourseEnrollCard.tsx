"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

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

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
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
          courseId,
          paymentMethod,
          paymentReference: paymentReference || null,
          paymentNotes: paymentNotes || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit enrollment");
        return;
      }

      setSuccess(
        data.message ||
          "Enrollment request submitted successfully. You can now see it in My Enrollments."
      );
    } catch {
      setError("Failed to submit enrollment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-primary)]">
        Payment Details
      </p>

      <h2 className="text-2xl font-bold">
        Enroll in {courseTitle || "this course"}
      </h2>

      <p className="mt-3 text-sm leading-7 text-[var(--memz-muted)]">
        Submit your payment details here. After submitting, this course will
        appear in your My Enrollments page with pending status until admin
        approval.
      </p>

      <div className="mt-5 rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-4">
        <p className="font-semibold">
          Amount: {isFree ? "Free" : `$${price ?? 0}`}
        </p>
        <p className="mt-2 text-sm text-[var(--memz-muted)]">
          Payment status after submitting: submitted
        </p>
      </div>

      {!isFree ? (
        <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-semibold">Payment instructions</p>
          <p className="mt-2">
            Pay using Cash Wallet or Instapay, then paste the transaction
            reference below.
          </p>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Payment Method
          </span>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 outline-none"
          >
            <option value="cash_wallet">Cash Wallet</option>
            <option value="instapay">Instapay</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Payment Reference
          </span>
          <input
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="Transaction ID / reference number"
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Payment Notes
          </span>
          <textarea
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Any extra note about your payment"
            rows={4}
            className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEnroll}
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : isFree ? "Enroll Now" : "Pay & Enroll"}
          </button>

          <Link
            href="/student/my-enrollments"
            className="rounded-2xl border border-[var(--memz-border)] bg-white px-5 py-3 font-semibold"
          >
            My Enrollments
          </Link>
        </div>

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
    </section>
  );
}