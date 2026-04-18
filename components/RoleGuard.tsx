"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Role = "student" | "teacher" | "admin";

type Profile = {
  role?: Role;
  approved?: boolean | null;
};

export default function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAccess();
  }, [allowedRoles.join(",")]);

  async function checkAccess() {
    try {
      setLoading(true);
      setAllowed(false);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You must be logged in to access this page.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, approved")
        .eq("id", user.id)
        .single<Profile>();

      if (!profile) {
        setMessage("Profile not found.");
        return;
      }

      if (profile.approved === false) {
        setMessage("Your account is waiting for admin approval.");
        return;
      }

      const role = profile.role;

      if (!role) {
        setMessage("Your account role is missing.");
        return;
      }

      if (role === "admin") {
        if (
          allowedRoles.includes("admin") ||
          allowedRoles.includes("teacher") ||
          allowedRoles.includes("student")
        ) {
          setAllowed(true);
          return;
        }
      }

      if (allowedRoles.includes(role)) {
        setAllowed(true);
        return;
      }

      setMessage("You do not have permission to access this page.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
          <p className="text-[var(--memz-muted)]">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-[50vh] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[var(--memz-text)]">
            Access Restricted
          </h2>
          <p className="mt-3 text-[var(--memz-muted)]">
            {message || "You do not have access to this page."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}