export default function TeacherDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[var(--memz-text)]">
          Teacher Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[var(--memz-muted)]">
          Review student submissions, add grades, and leave feedback from one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <a
          href="/teacher/submissions"
          className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-[var(--memz-soft)] px-3 py-1 text-xs font-semibold text-[var(--memz-primary)]">
            Teacher
          </div>
          <h2 className="text-xl font-semibold text-[var(--memz-text)]">
            Review Submissions
          </h2>
          <p className="mt-3 text-sm text-[var(--memz-muted)]">
            Open the full grading page to check work, assign grades, and send feedback.
          </p>
        </a>

        <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
          <div className="mb-4 inline-flex rounded-2xl bg-[var(--memz-soft)] px-3 py-1 text-xs font-semibold text-[var(--memz-primary)]">
            Info
          </div>
          <h2 className="text-xl font-semibold text-[var(--memz-text)]">
            Quick Reminder
          </h2>
          <p className="mt-3 text-sm text-[var(--memz-muted)]">
            As teachers submit grades and feedback, students will be able to review
            that feedback from their dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}