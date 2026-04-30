"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/enrollments", label: "Enrollment Requests" },
  { href: "/admin/course-videos", label: "Course Videos" },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/assignments", label: "Assignments" },
  { href: "/admin/tracks", label: "Tracks" },
  { href: "/admin/track-courses", label: "Track Courses" },
  { href: "/admin/course-teachers", label: "Course Teachers" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/levels", label: "Levels" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="min-h-screen w-full border-r border-[var(--memz-border)] bg-white p-5 md:w-72">
      <h2 className="text-2xl font-bold text-[var(--memz-text)]">
        Admin Panel
      </h2>

      <p className="mt-1 text-sm text-[var(--memz-muted)]">
        Manage Memz Academy structure
      </p>

      <nav className="mt-6 grid gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isActive(link.href)
                ? "bg-[var(--memz-primary)] text-white"
                : "text-[var(--memz-text)] hover:bg-[var(--memz-soft)]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}