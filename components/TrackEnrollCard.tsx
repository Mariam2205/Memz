"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

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

  async function handleEnroll() {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Please login first");
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/student/enroll-track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          trackId,
          paymentMethod,
          paymentReference: paymentReference || null,
          paymentNotes: paymentNotes || null,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to enroll in track");
        return;
      }

      alert(data.message || "Track enrollment submitted successfully");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
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
        Submit your payment details to join this track.
      </p>

      <div className="mt-4">
        <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 text-sm font-medium">
          ${price ?? 0}
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="rounded-2xl border border-[var(--memz-border)] px-4 py-3"
        >
          <option value="cash_wallet">Cash Wallet</option>
          <option value="instapay">Instapay</option>
        </select>

        <input
          type="text"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="Payment reference"
          className="rounded-2xl border border-[var(--memz-border)] px-4 py-3"
        />

        <textarea
          value={paymentNotes}
          onChange={(e) => setPaymentNotes(e.target.value)}
          placeholder="Payment notes"
          rows={4}
          className="rounded-2xl border border-[var(--memz-border)] px-4 py-3"
        />

        <button
          onClick={handleEnroll}
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Pay & Enroll"}
        </button>
      </div>
    </div>
  );
}