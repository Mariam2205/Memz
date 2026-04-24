import Link from "next/link";
import { adminSupabase } from "@/lib/supabase-server";

type Track = {
  id: string;
  title: string | null;
  name?: string | null;
  description?: string | null;
  short_description?: string | null;
  price?: number | null;
};

export default async function TracksPage() {
  const { data: tracks, error } = await adminSupabase
    .from("tracks")
    .select("id, title, name, description, short_description, price")
    .order("created_at", { ascending: false });

  return (
    <main className="memz-page bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
      <div className="memz-container">
        <p className="mb-4 inline-flex rounded-2xl bg-[var(--memz-soft)] px-3 py-1 text-xs font-semibold text-[var(--memz-primary)]">
          Explore Memz
        </p>

        <h1 className="text-4xl font-bold sm:text-5xl">Tracks</h1>

        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--memz-muted)]">
          Browse full learning tracks and choose the path that fits your goals.
        </p>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            Failed to load tracks: {error.message}
          </div>
        ) : tracks && tracks.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track: Track) => (
              <div
                key={track.id}
                className="rounded-[28px] border border-[var(--memz-border)] bg-white p-6 shadow-sm"
              >
                <h2 className="text-2xl font-bold">
                  {track.title || track.name || "Untitled Track"}
                </h2>

                <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--memz-muted)]">
                  {track.description ||
                    track.short_description ||
                    "No description yet."}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[var(--memz-soft)] px-4 py-2 text-sm font-semibold">
                    ${track.price ?? 0}
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href={`/tracks/${track.id}`}
                      className="rounded-2xl border border-[var(--memz-border)] bg-white px-4 py-2 text-sm font-semibold"
                    >
                      View
                    </Link>

                    <Link
                      href={`/tracks/${track.id}?enroll=true`}
                      className="rounded-2xl bg-gradient-to-r from-[var(--memz-primary)] to-[var(--memz-secondary)] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Enroll
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[var(--memz-border)] bg-white p-5 text-[var(--memz-muted)]">
            No tracks yet. Add tracks in Supabase.
          </div>
        )}
      </div>
    </main>
  );
}