import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CourseEnrollCard from "@/components/CourseEnrollCard";

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    let id = "";

    if (parsed.hostname.includes("youtu.be")) {
      id = parsed.pathname.replace("/", "");
    }

    if (parsed.hostname.includes("youtube.com")) {
      id = parsed.searchParams.get("v") || "";
    }

    if (!id) return null;

    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return null;
  }
}

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) {
    return (
      <main className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-10">
        <Link href="/courses">← Back to Courses</Link>
        <p className="mt-6">Course not found.</p>
      </main>
    );
  }

  let enrollment: any = null;

  if (user) {
    const { data } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("course_id", courseId)
      .eq("student_id", user.id)
      .maybeSingle();

    enrollment = data;
  }

  const isApproved = enrollment?.enrollment_status === "approved";

  const { data: videos } = isApproved
    ? await supabase
        .from("course_videos")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("video_order", { ascending: true })
    : { data: [] };

  return (
    <main className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/courses" className="font-semibold text-[var(--memz-primary)]">
          ← Back to Courses
        </Link>

        <section className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-[var(--memz-primary)]">
            Course Details
          </p>

          <h1 className="mt-3 text-4xl font-bold text-[var(--memz-text)]">
            {course.title || course.name || "Untitled Course"}
          </h1>

          <div
            className="prose mt-4 max-w-none text-[var(--memz-muted)]"
            dangerouslySetInnerHTML={{
              __html:
                course.description_html ||
                course.description ||
                "<p>No description available yet.</p>",
            }}
          />

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 font-semibold">
              {course.is_free ? "Free" : `$${course.price ?? 0}`}
            </span>

            {course.age_category ? (
              <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 font-semibold">
                Age: {course.age_category}
              </span>
            ) : null}

            {course.starting_date ? (
              <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 font-semibold">
                Starts: {new Date(course.starting_date).toLocaleDateString()}
              </span>
            ) : null}
          </div>
        </section>

        <CourseEnrollCard
          courseId={courseId}
          enrollmentStatus={enrollment?.enrollment_status || null}
          paymentStatus={enrollment?.payment_status || null}
        />

        {!user ? (
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-6 shadow-sm">
            <p className="font-semibold">Login to enroll and view videos.</p>
          </div>
        ) : null}

        {isApproved ? (
          <section className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">Course Videos</h2>

            {!videos || videos.length === 0 ? (
              <p className="mt-4 text-[var(--memz-muted)]">
                No videos added yet.
              </p>
            ) : (
              <div className="mt-6 space-y-6">
                {videos.map((video: any) => {
                  const embedUrl = getYouTubeEmbedUrl(video.youtube_url);

                  return (
                    <div
                      key={video.id}
                      className="rounded-3xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                    >
                      <h3 className="text-xl font-bold">{video.title}</h3>
                      {video.description ? (
                        <p className="mt-2 text-sm text-[var(--memz-muted)]">
                          {video.description}
                        </p>
                      ) : null}

                      {embedUrl ? (
                        <iframe
                          className="mt-4 aspect-video w-full rounded-2xl"
                          src={embedUrl}
                          title={video.title}
                          allowFullScreen
                        />
                      ) : (
                        <a
                          href={video.youtube_url}
                          target="_blank"
                          className="mt-4 inline-block font-semibold text-[var(--memz-primary)]"
                        >
                          Open Video
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">Course Videos</h2>
            <p className="mt-3 text-[var(--memz-muted)]">
              Videos are locked until your enrollment is approved.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}