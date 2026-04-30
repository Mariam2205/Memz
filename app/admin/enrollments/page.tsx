"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";

type Enrollment = {
  id: string;
  course_id: string;
  student_id: string;

  payment_method: string | null;
  payment_status: string | null;
  payment_reference: string | null;
  payment_notes: string | null;

  payer_name: string | null;
  wallet_number: string | null;
  payment_screenshot_url: string | null;
  transfer_time: string | null;

  enrollment_status: string | null;
  created_at: string;

  courses?: {
    title?: string | null;
    name?: string | null;
  } | null;

  profiles?: {
    email?: string | null;
    full_name?: string | null;
  } | null;
};

export default function AdminEnrollmentsPage() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadEnrollments() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/enrollments");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load enrollments");
        return;
      }

      setItems(data.enrollments || []);
    } catch {
      setMessage("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }

  async function updateEnrollment(
    id: string,
    status: "approved" | "rejected"
  ) {
    try {
      setMessage("");

      const res = await fetch("/api/admin/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          enrollment_status: status,
          payment_status: status === "approved" ? "paid" : "rejected",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update enrollment");
        return;
      }

      setMessage("Enrollment updated successfully.");
      loadEnrollments();
    } catch {
      setMessage("Failed to update enrollment");
    }
  }

  useEffect(() => {
    loadEnrollments();
  }, []);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Enrollment Requests
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Review student payments and approve access to course videos.
            </p>
          </div>

          {message ? (
            <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-[var(--memz-primary)]">
              {message}
            </p>
          ) : null}

          {loading ? (
            <p className="text-[var(--memz-muted)]">Loading enrollments...</p>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
              <p className="text-[var(--memz-muted)]">
                No enrollment requests yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-[var(--memz-text)]">
                        {item.courses?.title ||
                          item.courses?.name ||
                          "Untitled Course"}
                      </h2>

                      <p className="mt-2 text-sm text-[var(--memz-muted)]">
                        Student:{" "}
                        {item.profiles?.full_name ||
                          item.profiles?.email ||
                          item.student_id}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[var(--memz-soft)] px-4 py-2 text-sm font-semibold">
                      {item.enrollment_status || "pending"}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-[var(--memz-text)] md:grid-cols-2">
                    <p>
                      <strong>Payment Status:</strong>{" "}
                      {item.payment_status || "pending"}
                    </p>

                    <p>
                      <strong>Payment Method:</strong>{" "}
                      {item.payment_method || "-"}
                    </p>

                    <p>
                      <strong>Payer Name:</strong> {item.payer_name || "-"}
                    </p>

                    <p>
                      <strong>Sender Wallet:</strong>{" "}
                      {item.wallet_number || "-"}
                    </p>

                    <p>
                      <strong>Reference:</strong>{" "}
                      {item.payment_reference || "-"}
                    </p>

                    <p>
                      <strong>Transfer Time:</strong>{" "}
                      {item.transfer_time
                        ? new Date(item.transfer_time).toLocaleString()
                        : "-"}
                    </p>

                    <p className="md:col-span-2">
                      <strong>Notes:</strong> {item.payment_notes || "-"}
                    </p>

                    <div className="md:col-span-2">
                      <strong>Screenshot:</strong>{" "}
                      {item.payment_screenshot_url ? (
                        <a
                          href={item.payment_screenshot_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[var(--memz-primary)]"
                        >
                          View Payment Screenshot
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => updateEnrollment(item.id, "approved")}
                      className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Approve & Mark Paid
                    </button>

                    <button
                      type="button"
                      onClick={() => updateEnrollment(item.id, "rejected")}
                      className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}