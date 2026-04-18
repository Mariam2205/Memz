import Image from "next/image";
import Link from "next/link";

const bubbleCards = [
  {
    title: "Learn by Doing",
    description:
      "No boring lectures. At Memz, you build real projects, create, and experiment — because real learning happens in action.",
    emoji: "🔥",
  },
  {
    title: "Future Skills Only",
    description:
      "We don’t teach outdated stuff. From programming to AI, you learn skills that actually matter in the real world.",
    emoji: "💡",
  },
  {
    title: "Fun + Smart Experience",
    description:
      "Learning shouldn’t feel like school. Memz mixes fun, creativity, and challenges to keep you excited every step.",
    emoji: "🎨",
  },
];

const features = [
  {
    title: "Real-World Projects",
    description: "Build apps, games, and ideas you can actually show off.",
    emoji: "🚀",
  },
  {
    title: "Expert Mentors",
    description: "Learn from people who actually work in the field.",
    emoji: "🧠",
  },
  {
    title: "Modern Learning Approach",
    description:
      "Interactive, engaging, and far from traditional boring methods.",
    emoji: "🌍",
  },
  {
    title: "Track Your Progress",
    description: "Clear path, achievements, and visible growth.",
    emoji: "📈",
  },
  {
    title: "Supportive Community",
    description: "You’re not alone — collaborate, share, and grow with others.",
    emoji: "🤝",
  },
  {
    title: "Career-Oriented",
    description:
      "Everything you learn is designed to help you in the future.",
    emoji: "🎯",
  },
];

export default function Home() {
  return (
    <main className="bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
      <section className="relative overflow-hidden">
        <div className="memz-shape memz-shape-1" />
        <div className="memz-shape memz-shape-2" />
        <div className="memz-shape memz-shape-3" />

        <div className="memz-container py-20 text-center">
          <span className="mb-6 inline-block rounded-full border border-[var(--memz-border)] bg-white px-5 py-2 text-sm font-medium text-[var(--memz-muted)] shadow-sm">
            Learn Smarter with Memz
          </span>

          <h1 className="max-w-4xl mx-auto text-4xl font-extrabold leading-tight sm:text-5xl lg:text-7xl">
            Welcome Back <br />
            <span className="bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] bg-clip-text text-transparent">
              Memz Academy
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--memz-muted)] sm:text-lg">
            A smart, modern learning platform designed to simplify education
            through engaging content, interactive tools, and a smooth user
            experience tailored for both students and instructors.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="rounded-2xl bg-[var(--memz-primary)] px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Explore Courses
            </Link>

            <Link
              href="/tracks"
              className="rounded-2xl border border-[var(--memz-border)] bg-white px-6 py-3 font-semibold text-[var(--memz-text)] transition hover:bg-[var(--memz-soft)]"
            >
              Explore Tracks
            </Link>
          </div>

          <div className="mt-16">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-[var(--memz-border)] bg-white p-4 shadow-lg">
              <div className="relative h-[260px] w-full overflow-hidden rounded-[28px] sm:h-[380px] lg:h-[480px]">
                <Image
                  src="/images/cover-diffire.png"
                  alt="Hello"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="memz-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-primary)]">
              Why Memz is Different?
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
              Learning here feels alive
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {bubbleCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[32px] border border-[var(--memz-border)] bg-white p-7 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--memz-soft)] text-2xl">
                  {card.emoji}
                </div>
                <h3 className="text-2xl font-bold">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--memz-muted)]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-lg font-medium text-[var(--memz-muted)]">
            Memz isn’t just learning… it’s an experience.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="memz-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-secondary)]">
              Why Choose Memz?
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
              Built for growth, creativity, and the future
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[28px] border border-[var(--memz-border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 text-3xl">{feature.emoji}</div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--memz-muted)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="memz-container">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-[var(--memz-border)] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-semibold">Interactive Courses</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--memz-muted)]">
                High-quality, easy-to-follow lessons designed to keep you
                engaged and help you learn with confidence.
              </p>
            </div>

            <div className="rounded-[28px] border border-[var(--memz-border)] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-semibold">Assignments & Quizzes</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--memz-muted)]">
                Practice what you learn with structured assignments and quizzes
                that reinforce your understanding and track your performance.
              </p>
            </div>

            <div className="rounded-[28px] border border-[var(--memz-border)] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <h2 className="text-xl font-semibold">Track Your Progress Easily</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--memz-muted)]">
                Stay on top of your learning journey with a clear dashboard
                showing your progress, results, and achievements in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="memz-container">
          <div className="rounded-[36px] border border-[var(--memz-border)] bg-gradient-to-r from-[var(--memz-soft)] to-white p-10 shadow-sm md:p-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--memz-primary)]">
              What Makes Memz Special?
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
              Memz isn’t just a place to learn…
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--memz-muted)]">
              It’s where students discover their passion, build confidence, and
              prepare for the future.
            </p>

            <div className="mt-10">
              <Link
                href="/signup"
                className="inline-flex rounded-2xl bg-[var(--memz-secondary)] px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Start Your Journey
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}