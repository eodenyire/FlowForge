"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface ProcessorGroup {
  id: string;
  name: string;
  description: string;
  parentGroupId: string | null;
  pipelineCount: number;
  childGroupCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export default function ProcessorGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<ProcessorGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    tags: "",
  });
  const [creating, setCreating] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  const getToken = () => localStorage.getItem("auth_token");

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const sessionRes = await fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!sessionRes.ok) {
        router.push("/login");
        return;
      }
      const sessionData = await sessionRes.json();
      setUserName(sessionData.user.name);
      setUserRole(sessionData.user.role);

      if (!sessionData.user.companyId) {
        router.push("/company-setup");
        return;
      }

      const groupsRes = await fetch("/api/processor-groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setGroups(data.groups);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/processor-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          tags: createForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        setShowCreate(false);
        setCreateForm({ name: "", description: "", tags: "" });
        await loadData();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this processor group and all its pipelines?")) return;
    await fetch(`/api/processor-groups?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    await loadData();
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
        <div className="text-neutral-400 text-sm">Loading processor groups...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950">
      <header className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-white tracking-tight">
              Flow<span className="text-indigo-400">Forge</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/processor-groups" className="text-sm text-white font-medium">Processors</Link>
              <Link href="/connections" className="text-sm text-neutral-400 hover:text-white transition-colors">Connections</Link>
              <Link href="/team" className="text-sm text-neutral-400 hover:text-white transition-colors">Team</Link>
              <Link href="/profile" className="text-sm text-neutral-400 hover:text-white transition-colors">Profile</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">{userName} ({userRole})</span>
            <button onClick={handleLogout} className="text-sm text-neutral-400 hover:text-white transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Processor Groups
            </h1>
            <p className="text-neutral-400 text-sm">
              Organize your data pipelines into logical groups, just like Apache NiFi process groups
            </p>
          </div>
          {userRole !== "viewer" && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            >
              {showCreate ? "Cancel" : "+ New Group"}
            </button>
          )}
        </div>

        {showCreate && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Create Processor Group
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Group Name *</label>
                  <input type="text" required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    placeholder="Customer Data Pipeline" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
                  <input type="text" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    placeholder="Handles customer data ingestion and transformation" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Tags (comma separated)</label>
                  <input type="text" value={createForm.tags} onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    placeholder="etl, customers, postgres" />
                </div>
              </div>
              <button type="submit" disabled={creating}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50">
                {creating ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        )}

        {groups.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">{"\u{1F5C4}"}</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Processor Groups Yet</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              Processor groups organize your data pipelines. Create a group for each major data flow domain
              (e.g., Customer Data, Financial Transactions, Reporting).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link
                    href={`/processor-groups/${group.id}`}
                    className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors"
                  >
                    {group.name}
                  </Link>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      group.status === "active"
                        ? "bg-emerald-950/50 text-emerald-400"
                        : group.status === "running"
                        ? "bg-blue-950/50 text-blue-400"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {group.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-4 line-clamp-2">
                  {group.description || "No description"}
                </p>
                <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                  <span>{group.pipelineCount} pipelines</span>
                  <span>{group.childGroupCount} sub-groups</span>
                </div>
                {group.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {group.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-800">
                  <Link
                    href={`/processor-groups/${group.id}`}
                    className="flex-1 text-center py-1.5 bg-indigo-600/20 text-indigo-400 text-xs font-medium rounded hover:bg-indigo-600/30 transition-colors"
                  >
                    Open
                  </Link>
                  {userRole !== "viewer" && (
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="px-3 py-1.5 bg-red-950/20 text-red-400 text-xs font-medium rounded hover:bg-red-950/30 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
