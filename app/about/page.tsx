import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="bg-[var(--memz-page-bg)] py-20 text-[var(--memz-text)]">
      <div className="memz-container space-y-24">
        <section className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-primary)]">
            About Memz
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
            About Memz Academy
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--memz-muted)]">
            Memz Academy is a modern learning platform built to simplify
            education and make it more engaging, practical, and accessible for
            everyone. We focus on delivering real value through structured
            content and smart learning tools.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--memz-soft)] text-2xl">
              🎯
            </div>
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="mt-4 leading-8 text-[var(--memz-muted)]">
              To help students learn faster and better by combining technology
              with high-quality educational content in a simple and effective
              way.
            </p>
          </div>

          <div className="rounded-[32px] border border-[var(--memz-border)] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--memz-soft)] text-2xl">
              🌍
            </div>
            <h2 className="text-2xl font-semibold">Our Vision</h2>
            <p className="mt-4 leading-8 text-[var(--memz-muted)]">
              To become a leading digital learning platform that transforms how
              people learn and grow in the modern world.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-secondary)]">
              Why Memz?
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
              What Makes Us Different
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[28px] border border-[var(--memz-border)] bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 text-3xl">🚀</div>
              <h3 className="text-xl font-semibold">Simple Learning Experience</h3>
              <p className="mt-3 leading-7 text-[var(--memz-muted)]">
                We remove complexity and focus on clarity, making it easy for
                anyone to start and continue learning.
              </p>
            </div>

            <div className="rounded-[28px] border border-[var(--memz-border)] bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 text-3xl">🎯</div>
              <h3 className="text-xl font-semibold">Practical & Focused Content</h3>
              <p className="mt-3 leading-7 text-[var(--memz-muted)]">
                Our courses are designed to deliver real results, not just
                information.
              </p>
            </div>

            <div className="rounded-[28px] border border-[var(--memz-border)] bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 text-3xl">💡</div>
              <h3 className="text-xl font-semibold">Smart Learning Tools</h3>
              <p className="mt-3 leading-7 text-[var(--memz-muted)]">
                From progress tracking to interactive content, everything is
                built to improve your learning journey.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-[var(--memz-border)] bg-gradient-to-r from-[var(--memz-soft)] to-white p-10 shadow-sm md:p-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-primary)]">
            Who Can Benefit
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Built for learners who want more
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--memz-muted)]">
            Memz Academy is designed for students, learners, and anyone who
            wants to improve their skills in a structured, modern, and exciting
            way.
          </p>
        </section>

        <section className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-secondary)]">
            Start with Memz
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
            Start Your Journey
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--memz-muted)]">
            Join Memz Academy today and take the next step toward achieving your
            learning goals.
          </p>

          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex rounded-2xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-7 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}