"use client";

type SearchType = "users" | "tracks" | "sessions";

type TypeSearchProps = {
  value: string;
  onChange: (value: string) => void;
  type: SearchType;
  onTypeChange: (value: SearchType) => void;
  placeholder?: string;
};

export default function TypeSearch({
  value,
  onChange,
  type,
  onTypeChange,
  placeholder = "Search...",
}: TypeSearchProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--memz-border)] bg-white p-4 shadow-sm md:flex-row md:items-center">
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value as SearchType)}
        className="h-11 rounded-xl border border-[var(--memz-border)] bg-[var(--memz-soft)] px-4 text-sm outline-none"
      >
        <option value="users">Users</option>
        <option value="tracks">Tracks</option>
        <option value="sessions">Sessions</option>
      </select>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 flex-1 rounded-xl border border-[var(--memz-border)] bg-white px-4 text-sm text-[var(--memz-text)] outline-none focus:border-[var(--memz-primary)]"
      />

      <div className="rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white">
        Search by type
      </div>
    </div>
  );
}