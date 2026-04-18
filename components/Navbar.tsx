"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserRole = "student" | "teacher" | "admin" | null;

type Profile = {
  role?: UserRole;
  approved?: boolean | null;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function loadUser() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user || null);

      if (!user) {
        setRole(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, approved")
        .eq("id", user.id)
        .single<Profile>();

      setRole(profile?.role || null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function linkClass(href: string) {
    return `rounded-2xl px-4 py-3 text-sm font-medium transition ${
      isActive(href)
        ? "bg-[var(--memz-soft)] text-[var(--memz-primary)]"
        : "text-[var(--memz-text)] hover:bg-[var(--memz-soft)]"
    }`;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--memz-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-[80px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Memz.png"
              alt="Memz Academy"
              width={46}
              height={46}
              className="rounded-2xl object-cover"
            />
            <div>
              <p className="text-lg font-bold text-[var(--memz-text)]">
                Memz Academy
              </p>
              <p className="text-xs text-[var(--memz-muted)]">
                Learn the Memz way
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            <Link href="/" className={linkClass("/")}>Home</Link>
            <Link href="/courses" className={linkClass("/courses")}>Courses</Link>
            <Link href="/tracks" className={linkClass("/tracks")}>Tracks</Link>
            <Link href="/about" className={linkClass("/about")}>About</Link>
            <Link href="/contact" className={linkClass("/contact")}>Contact</Link>

            {!loading && !user ? (
              <>
                <Link href="/login" className={linkClass("/login")}>Login</Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-[var(--memz-primary)] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Get Started
                </Link>
              </>
            ) : null}

            {!loading && user && role === "student" ? (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
                <Link href="/dashboard/enrollments" className={linkClass("/dashboard/enrollments")}>
                  My Enrollments
                </Link>
                <Link href="/dashboard/track-progress" className={linkClass("/dashboard/track-progress")}>
                  Track Progress
                </Link>
              </>
            ) : null}

            {!loading && user && role === "teacher" ? (
              <Link href="/teacher" className={linkClass("/teacher")}>Dashboard</Link>
            ) : null}

            {!loading && user && role === "admin" ? (
              <>
                <Link href="/admin" className={linkClass("/admin")}>Dashboard</Link>
                <Link href="/teacher" className={linkClass("/teacher")}>Teacher View</Link>
                <Link href="/dashboard" className={linkClass("/dashboard")}>Student View</Link>
              </>
            ) : null}

            {!loading && user ? (
              <button
                onClick={handleLogout}
                className="rounded-full border border-[var(--memz-border)] px-4 py-2 text-sm font-semibold text-[var(--memz-text)] transition hover:bg-[var(--memz-soft)]"
              >
                Logout
              </button>
            ) : null}
          </nav>

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex rounded-2xl border border-[var(--memz-border)] px-4 py-2 text-sm font-semibold text-[var(--memz-text)] lg:hidden"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-[var(--memz-border)] py-4 lg:hidden">
            <div className="flex flex-col gap-2">
              <Link href="/" className={linkClass("/")}>Home</Link>
              <Link href="/courses" className={linkClass("/courses")}>Courses</Link>
              <Link href="/tracks" className={linkClass("/tracks")}>Tracks</Link>
              <Link href="/about" className={linkClass("/about")}>About</Link>
              <Link href="/contact" className={linkClass("/contact")}>Contact</Link>

              {!loading && !user ? (
                <>
                  <Link href="/login" className={linkClass("/login")}>Login</Link>
                  <Link
                    href="/signup"
                    className="rounded-2xl bg-[var(--memz-primary)] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Get Started
                  </Link>
                </>
              ) : null}

              {!loading && user && role === "student" ? (
                <>
                  <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
                  <Link href="/dashboard/enrollments" className={linkClass("/dashboard/enrollments")}>
                    My Enrollments
                  </Link>
                  <Link href="/dashboard/track-progress" className={linkClass("/dashboard/track-progress")}>
                    Track Progress
                  </Link>
                </>
              ) : null}

              {!loading && user && role === "teacher" ? (
                <Link href="/teacher" className={linkClass("/teacher")}>Dashboard</Link>
              ) : null}

              {!loading && user && role === "admin" ? (
                <>
                  <Link href="/admin" className={linkClass("/admin")}>Dashboard</Link>
                  <Link href="/teacher" className={linkClass("/teacher")}>Teacher View</Link>
                  <Link href="/dashboard" className={linkClass("/dashboard")}>Student View</Link>
                </>
              ) : null}

              {!loading && user ? (
                <button
                  onClick={handleLogout}
                  className="rounded-2xl border border-[var(--memz-border)] px-4 py-3 text-left text-sm font-semibold text-[var(--memz-text)]"
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}