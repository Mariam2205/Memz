"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CourseEnrollForm({
  courseId,
  isFree,
  price,
}: {
  courseId: string;
  isFree: boolean | null;
  price: number | null;
}) {
  const [paymentMethod, setPaymentMethod] = useState(
    isFree ? "cash_wallet" : "instapay"
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setMessage("");
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
      setError(data.error || "Failed to enroll");
      setLoading(false);
      return;
    }

    setMessage("Enrollment submitted successfully.");
    setLoading(false);

    setTimeout(() => {
      window.location.href = "/student/my-enrollments";
    }, 800);
  }

  return (
    <section className="mt-8 rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold">Payment Details</h2>

      <p className="mt-3 text-sm text-[var(--memz-muted)]">
        Amount: {isFree ? "Free" : `$${price ?? 0}`}
      </p>

      {!isFree && (
        <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Pay using Instapay or Cash Wallet, then add your transaction reference.
        </div>
      )}

      <div className="mt-6 space-y-4">
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3"
        >
          <option value="cash_wallet">Cash Wallet</option>
          <option value="instapay">Instapay</option>
        </select>

        <input
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="Payment reference / transaction ID"
          className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3"
        />

        <textarea
          value={paymentNotes}
          onChange={(e) => setPaymentNotes(e.target.value)}
          placeholder="Payment notes"
          rows={4}
          className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Enrollment"}
        </button>

        {message && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}