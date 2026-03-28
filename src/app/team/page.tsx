"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { PublicUser } from "@/lib/types";

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [members, setMembers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    role: "engineer",
  });
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviting, setInviting] = useState(false);

  const getToken = () => localStorage.getItem("auth_token");

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        router.push("/login");
        return;
      }

      const data = await res.json();
      setUser(data.user);

      if (!data.user.companyId) {
        router.push("/company-setup");
        return;
      }

      // Load members
      const membersRes = await fetch("/api/companies/members", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    setInviting(true);

    try {
      const res = await fetch("/api/companies/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(inviteForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "Failed to invite member");
        return;
      }

      setMembers([...members, data.user]);
      setInviteSuccess(
        `${data.user.name} has been added with temporary password: ${data.temporaryPassword}`
      );
      setInviteForm({ email: "", name: "", role: "engineer" });
      setShowInvite(false);
    } catch {
      setInviteError("Network error. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const handleLogout = async () => {
    const token = getToken();
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-400 text-sm">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xl font-bold text-white tracking-tight"
            >
              Flow<span className="text-indigo-400">Forge</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/flows"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Flows
              </Link>
              <Link
                href="/workflows"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Workflows
              </Link>
              <Link
                href="/databases"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Databases
              </Link>
              <Link
                href="/data"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Data
              </Link>
              <Link href="/team" className="text-sm text-white font-medium">
                Team
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Team Management
            </h1>
            <p className="text-neutral-400 text-sm">
              Manage your company&apos;s data engineers and team members
            </p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            >
              {showInvite ? "Cancel" : "+ Invite Member"}
            </button>
          )}
        </div>

        {/* Success message */}
        {inviteSuccess && (
          <div className="bg-emerald-950/30 border border-emerald-800 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-emerald-300">{inviteSuccess}</p>
          </div>
        )}

        {/* Invite form */}
        {showInvite && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Invite Team Member
            </h2>

            {inviteError && (
              <div className="bg-red-950/30 border border-red-800 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-red-300">{inviteError}</p>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="jane@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="engineer">Data Engineer</option>
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={inviting}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {inviting ? "Adding..." : "Add Team Member"}
              </button>
            </form>
          </div>
        )}

        {/* Members list */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800">
            <h2 className="text-lg font-semibold text-white">
              Team Members ({members.length})
            </h2>
          </div>

          {members.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-neutral-400 text-sm">
                No team members yet. Invite data engineers to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-800/50 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-400">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.name}
                      </p>
                      <p className="text-xs text-neutral-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        member.role === "admin"
                          ? "bg-indigo-950/50 text-indigo-400 border border-indigo-800/50"
                          : member.role === "engineer"
                          ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/50"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                      }`}
                    >
                      {member.role === "admin"
                        ? "Admin"
                        : member.role === "engineer"
                        ? "Data Engineer"
                        : "Viewer"}
                    </span>
                    <span className="text-xs text-neutral-500">
                      Joined{" "}
                      {new Date(member.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role descriptions */}
        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <h3 className="text-sm font-semibold text-neutral-200">Admin</h3>
              </div>
              <p className="text-xs text-neutral-500">
                Full access. Can manage company settings, invite members, create
                and execute flows, configure databases.
              </p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-200">
                  Data Engineer
                </h3>
              </div>
              <p className="text-xs text-neutral-500">
                Can create, edit, and execute data flows. Configure processors
                and manage data pipelines.
              </p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-neutral-500" />
                <h3 className="text-sm font-semibold text-neutral-200">Viewer</h3>
              </div>
              <p className="text-xs text-neutral-500">
                Read-only access. Can view flows, provenance logs, and data
                browser. Cannot edit or execute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
