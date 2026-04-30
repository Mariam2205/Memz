"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PAYMENT_NUMBER = "01274408307";

export default function CourseEnrollPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [paymentMethod, setPaymentMethod] = useState("vodafone_cash");
  const [payerName, setPayerName] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [transferTime, setTransferTime] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function uploadScreenshot(userId: string) {
    if (!screenshot) return null;

    const fileExt = screenshot.name.split(".").pop();
    const fileName = `${userId}-${courseId}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("payment-screenshots")
      .upload(fileName, screenshot);

    if (error) throw new Error(error.message);

    const { data } = supabase.storage
      .from("payment-screenshots")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setMessage("Please login first.");
        return;
      }

      if (!payerName.trim()) {
        setMessage("Please write payer name.");
        return;
      }

      if (!transferTime) {
        setMessage("Please add transfer time.");
        return;
      }

      if (!screenshot) {
        setMessage("Please upload payment screenshot.");
        return;
      }

      const screenshotUrl = await uploadScreenshot(session.user.id);

      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          course_id: courseId,
          payment_method: paymentMethod,
          payer_name: payerName,
          wallet_number: walletNumber,
          payment_reference: paymentReference,
          transfer_time: transferTime,
          payment_notes: paymentNotes,
          payment_screenshot_url: screenshotUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to send enrollment request.");
        return;
      }

      setMessage("Enrollment request sent successfully. Wait for admin approval.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Something went wrong.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href={`/courses/${courseId}`}
          className="font-semibold text-[var(--memz-primary)]"
        >
          ← Back to course details
        </Link>

        <section className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-[var(--memz-text)]">
            Course Enrollment
          </h1>

          <div className="mt-5 rounded-2xl bg-[var(--memz-soft)] p-5">
            <p className="font-bold">Payment Details</p>
            <p className="mt-2 text-sm">
              Vodafone Cash / Wallet Number:
              <span className="ml-2 font-bold">{PAYMENT_NUMBER}</span>
            </p>
            <p className="mt-1 text-sm text-[var(--memz-muted)]">
              You can pay using Vodafone Cash, InstaPay, or any wallet transfer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            >
              <option value="vodafone_cash">Vodafone Cash</option>
              <option value="instapay">InstaPay</option>
              <option value="wallet">Other Wallet</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>

            <input
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              placeholder="Name of payer"
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            />

            <input
              value={walletNumber}
              onChange={(e) => setWalletNumber(e.target.value)}
              placeholder="Sender wallet / phone number"
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            />

            <input
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Payment reference / transaction ID"
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Transfer Time
              </label>
              <input
                type="datetime-local"
                value={transferTime}
                onChange={(e) => setTransferTime(e.target.value)}
                className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Payment Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
              />
            </div>

            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Extra payment notes"
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Sending..." : "Submit Enrollment Request"}
            </button>

            {message ? (
              <p className="text-sm font-semibold text-[var(--memz-primary)]">
                {message}
              </p>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
}