"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/submissions", label: "Submissions" },
];

export default function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-3xl border border-[var(--memz-border)] bg-white p-4 shadow-sm lg:sticky lg:top-6">
      <div className="mb-4 px-2">
        <h2 className="text-lg font-bold text-[var(--memz-text)]">Memz Teacher</h2>
        <p className="mt-1 text-xs text-[var(--memz-muted)]">
          Review and manage student work
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-[var(--memz-primary)] text-white"
                  : "text-[var(--memz-text)] hover:bg-[var(--memz-soft)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}