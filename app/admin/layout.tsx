"use client";

import RoleGuard from "@/components/RoleGuard";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
      <RoleGuard allowedRoles={["admin"]}>
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <section>{children}</section>
        </div>
      </RoleGuard>
    </main>
  );
}