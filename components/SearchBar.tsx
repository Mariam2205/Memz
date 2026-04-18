"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center overflow-hidden rounded-2xl border border-[var(--memz-border)] bg-white">
        <div className="px-4 text-sm text-[var(--memz-muted)]">🔍</div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2 py-3 text-sm text-[var(--memz-text)] outline-none"
        />
      </div>
    </div>
  );
}