import { ReactNode } from "react";
import RoleGuard from "@/components/RoleGuard";
import TeacherSidebar from "@/components/TeacherSidebar";

export default function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--memz-page-bg)] px-6 py-8">
      <RoleGuard allowedRoles ={["teacher"]}>
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <TeacherSidebar />
          <section>{children}</section>
        </div>
      </RoleGuard>
    </main>
  );
}