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

      setMessage("Enrollment updated");
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
              Review payments and approve students.
            </p>
          </div>

          {message ? (
            <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-[var(--memz-primary)]">
              {message}
            </p>
          ) : null}

          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <p>No enrollment requests yet.</p>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm"
                >
                  {/* Course */}
                  <h2 className="text-xl font-bold">
                    {item.courses?.title ||
                      item.courses?.name ||
                      "Course"}
                  </h2>

                  {/* Student */}
                  <p className="mt-2 text-sm text-[var(--memz-muted)]">
                    Student:{" "}
                    {item.profiles?.full_name ||
                      item.profiles?.email ||
                      item.student_id}
                  </p>

                  {/* Status */}
                  <div className="mt-4 grid gap-2 text-sm">
                    <p>Enrollment: {item.enrollment_status}</p>
                    <p>Payment: {item.payment_status}</p>
                    <p>Method: {item.payment_method || "-"}</p>
                  </div>

                  {/* Payment details */}
                  <div className="mt-4 grid gap-2 text-sm">
                    <p>Payer Name: {item.payer_name || "-"}</p>
                    <p>Sender Wallet: {item.wallet_number || "-"}</p>
                    <p>
                      Reference: {item.payment_reference || "-"}
                    </p>
                    <p>
                      Transfer Time:{" "}
                      {item.transfer_time
                        ? new Date(item.transfer_time).toLocaleString()
                        : "-"}
                    </p>
                    <p>Notes: {item.payment_notes || "-"}</p>

                    {item.payment_screenshot_url ? (
                      <a
                        href={item.payment_screenshot_url}
                        target="_blank"
                        className="font-semibold text-[var(--memz-primary)]"
                      >
                        View Payment Screenshot
                      </a>
                    ) : (
                      <p>No screenshot uploaded</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() =>
                        updateEnrollment(item.id, "approved")
                      }
                      className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateEnrollment(item.id, "rejected")
                      }
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