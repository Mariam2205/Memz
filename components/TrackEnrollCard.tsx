"use client";

import { useState } from "react";

type Props = {
  trackId: string;
  trackTitle?: string | null;
  price?: number | null;
};

export default function TrackEnrollCard({
  trackId,
  trackTitle,
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

      const res = await fetch("/api/student/enroll-track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          track_id: trackId,
          paymentMethod,
          paymentReference,
          paymentNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit track enrollment");
        return;
      }

      setSuccess(data.message || "Track enrollment request submitted");
    } catch {
      setError("Failed to submit track enrollment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm">
      <div className="mb-4 inline-flex rounded-2xl bg-[var(--memz-soft)] px-3 py-1 text-xs font-semibold text-[var(--memz-secondary)]">
        Track Enrollment
      </div>

      <h2 className="text-2xl font-bold text-[var(--memz-text)]">
        Enroll in {trackTitle || "this track"}
      </h2>

      <p className="mt-3 text-sm leading-7 text-[var(--memz-muted)]">
        Submit payment details to join this track and follow all included courses.
      </p>

      <div className="mt-5">
        <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 text-sm font-medium">
          ${price ?? 0}
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
          {loading ? "Submitting..." : "Pay & Enroll"}
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