"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const user = data.user;

      if (!user) {
        setError("Login failed.");
        return;
      }

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("role, approved")
        .eq("id", user.id)
        .maybeSingle();

      const role = existingProfile?.role ?? "student";
      const approved =
        typeof existingProfile?.approved === "boolean"
          ? existingProfile.approved
          : true;

      const { error: profileError } = await supabase.from("profiles").upsert([
        {
          id: user.id,
          email: user.email ?? email,
          full_name: user.user_metadata?.full_name ?? null,
          role,
          approved,
        },
      ]);

      if (profileError) {
        setError(profileError.message);
        return;
      }

      if (!approved) {
        setError("Your account is waiting for admin approval.");
        await supabase.auth.signOut();
        return;
      }

      setMessage("Login successful.");

      if (role === "admin") {
        router.push("/admin");
        return;
      }

      if (role === "teacher") {
        router.push("/teacher/submissions");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong during login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--memz-page-bg)] px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Login
            </h1>
            <p className="mt-2 text-sm text-[var(--memz-muted)]">
              Welcome back to Memz Academy.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--memz-text)]">
                Password
              </label>
              <div className="flex overflow-hidden rounded-2xl border border-[var(--memz-border)] bg-white">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="border-l border-[var(--memz-border)] px-4 text-sm font-medium text-[var(--memz-primary)] transition hover:bg-[var(--memz-soft)]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[var(--memz-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--memz-muted)]">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[var(--memz-primary)]"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}