"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/courses", label: "Courses" },
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
    <aside className="w-full rounded-3xl border border-[var(--memz-border)] bg-white p-4 shadow-sm lg:w-72">
      <div className="mb-4 px-2">
        <h2 className="text-lg font-bold text-[var(--memz-text)]">
          Admin Panel
        </h2>
        <p className="text-sm text-[var(--memz-muted)]">
          Manage Memz Academy structure
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
              isActive(link.href)
                ? "bg-[var(--memz-soft)] text-[var(--memz-primary)]"
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