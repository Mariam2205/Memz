"use client";

import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import SearchBar from "@/components/SearchBar";

type UserItem = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
  approved?: boolean | null;
  created_at?: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [passwordUserId, setPasswordUserId] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load users");
        return;
      }

      setUsers(data.users || []);
    } catch {
      setMessage("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    try {
      setMessage("");

      const res = await fetch("/api/admin/users/update-role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update role");
        return;
      }

      setMessage("Role updated successfully");
      fetchUsers();
    } catch {
      setMessage("Failed to update role");
    }
  }

  async function handleApproval(userId: string, approved: boolean) {
    try {
      setMessage("");

      const res = await fetch("/api/admin/users/approve", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, approved }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update approval");
        return;
      }

      setMessage(approved ? "User approved" : "User blocked");
      fetchUsers();
    } catch {
      setMessage("Failed to update approval");
    }
  }

  async function handleDelete(userId: string, email?: string | null) {
    const confirmed = window.confirm(
      `Delete this account permanently?\n\n${email || userId}\n\nThis will remove the user from the system and Supabase Auth.`
    );

    if (!confirmed) return;

    try {
      setMessage("");

      const res = await fetch("/api/admin/users/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to delete user");
        return;
      }

      setMessage("User deleted successfully");
      fetchUsers();
    } catch {
      setMessage("Failed to delete user");
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!passwordUserId || !passwordValue) {
      setMessage("Please choose a user and enter a password");
      return;
    }

    try {
      setSavingPassword(true);
      setMessage("");

      const res = await fetch("/api/admin/users/set-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: passwordUserId,
          password: passwordValue,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update password");
        return;
      }

      setMessage("Password updated successfully");
      setPasswordUserId("");
      setPasswordValue("");
    } catch {
      setMessage("Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;

    return users.filter((user) => {
      const email = (user.email || "").toLowerCase();
      const fullName = (user.full_name || "").toLowerCase();
      const role = (user.role || "").toLowerCase();

      return (
        email.includes(q) ||
        fullName.includes(q) ||
        role.includes(q) ||
        user.id.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">
              Users
            </h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Manage roles, approval, passwords, and full account deletion.
            </p>
          </div>

          <form
            onSubmit={handleSetPassword}
            className="space-y-4 rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-[var(--memz-text)]">
              Set User Password
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={passwordUserId}
                onChange={(e) => setPasswordUserId(e.target.value)}
                className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email || user.id}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Enter new password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white"
            >
              {savingPassword ? "Saving..." : "Set Password"}
            </button>
          </form>

          <div className="space-y-5 rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-[var(--memz-text)]">
                All Users
              </h2>

              <div className="w-full max-w-sm">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search users..."
                />
              </div>
            </div>

            {message ? (
              <p className="text-sm font-medium text-[var(--memz-primary)]">
                {message}
              </p>
            ) : null}

            {loading ? (
              <p className="text-[var(--memz-muted)]">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-[var(--memz-muted)]">No users found.</p>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[var(--memz-text)]">
                          {user.full_name || "Unnamed User"}
                        </h3>

                        <p className="text-sm text-[var(--memz-muted)]">
                          {user.email || "No email"}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-white px-3 py-1">
                            Role: {user.role || "unknown"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1">
                            {user.approved ? "Approved" : "Blocked"}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:w-[420px]">
                        <select
                          value={user.role || "student"}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className="rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
                        >
                          <option value="student">student</option>
                          <option value="teacher">teacher</option>
                          <option value="admin">admin</option>
                        </select>

                        <button
                          onClick={() =>
                            handleApproval(user.id, !Boolean(user.approved))
                          }
                          className="rounded-2xl border border-[var(--memz-border)] px-4 py-3 text-sm font-semibold text-[var(--memz-text)]"
                        >
                          {user.approved ? "Block User" : "Approve User"}
                        </button>

                        <button
                          onClick={() => {
                            setPasswordUserId(user.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="rounded-2xl border border-[var(--memz-border)] px-4 py-3 text-sm font-semibold text-[var(--memz-primary)]"
                        >
                          Set Password
                        </button>

                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}