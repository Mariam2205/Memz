"use client";

import { useState } from "react";

export default function LevelForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/levels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add level");
      }

      setName("");
      setDescription("");
      setMessage("Level added successfully");
      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Error adding level"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Level name"
        required
        className="w-full rounded-xl bg-black/30 p-3"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full rounded-xl bg-black/30 p-3"
        rows={4}
      />

      {message ? (
        <p className="text-sm text-[var(--memz-primary)]">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--memz-primary)] p-3 text-white disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add Level"}
      </button>
    </form>
  );
}