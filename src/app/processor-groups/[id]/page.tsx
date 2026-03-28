"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Pipeline {
  id: string;
  name: string;
  description: string;
  groupId: string;
  status: string;
  processorCount: number;
  connectionCount: number;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  tags: string[];
}

interface Breadcrumb {
  id: string;
  name: string;
}

interface GroupInfo {
  id: string;
  name: string;
  description: string;
  status: string;
}

export default function ProcessorGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    tags: "",
  });
  const [creating, setCreating] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");

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
      setUserRole(sessionData.user.role);
      setUserName(sessionData.user.name);

      // Load group info
      const groupRes = await fetch(
        `/api/processor-groups?id=${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (groupRes.ok) {
        const groupData = await groupRes.json();
        setGroup(groupData.group);
        setBreadcrumbs(groupData.breadcrumbs || []);
      }

      // Load pipelines
      const pipesRes = await fetch(
        `/api/pipelines?groupId=${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (pipesRes.ok) {
        const pipesData = await pipesRes.json();
        setPipelines(pipesData.pipelines);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router, groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/pipelines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          groupId,
          tags: createForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowCreate(false);
        setCreateForm({ name: "", description: "", tags: "" });
        // Redirect to flow editor
        router.push(`/flows/${data.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pipeline?")) return;
    await fetch(`/api/pipelines?id=${id}`, {
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
        <div className="text-neutral-400 text-sm">Loading...</div>
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
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link href="/processor-groups" className="hover:text-neutral-300">
            Processor Groups
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.id} className="flex items-center gap-2">
              <span>/</span>
              <Link
                href={`/processor-groups/${crumb.id}`}
                className="hover:text-neutral-300"
              >
                {crumb.name}
              </Link>
            </span>
          ))}
          {group && (
            <span className="flex items-center gap-2">
              <span>/</span>
              <span className="text-neutral-300">{group.name}</span>
            </span>
          )}
        </div>

        {/* Group info */}
        {group && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {group.name}
                </h1>
                <p className="text-neutral-400 text-sm">
                  {group.description || "No description"}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  group.status === "active"
                    ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/50"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {group.status}
              </span>
            </div>
          </div>
        )}

        {/* Pipelines */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Pipelines ({pipelines.length})
          </h2>
          {userRole !== "viewer" && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            >
              {showCreate ? "Cancel" : "+ New Pipeline"}
            </button>
          )}
        </div>

        {showCreate && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
            <h3 className="text-md font-semibold text-white mb-4">
              Create Pipeline
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Pipeline Name *</label>
                  <input type="text" required value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    placeholder="PostgreSQL to MySQL ETL" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
                  <input type="text" value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    placeholder="Extract customer data, transform, load to MySQL" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Tags</label>
                  <input type="text" value={createForm.tags}
                    onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    placeholder="etl, postgres, mysql" />
                </div>
              </div>
              <button type="submit" disabled={creating}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50">
                {creating ? "Creating..." : "Create Pipeline"}
              </button>
            </form>
          </div>
        )}

        {pipelines.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">{"\u{1F527}"}</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Pipelines Yet</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              Create your first pipeline in this processor group. Each pipeline can contain
              database queries, script transformations, and output destinations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-md font-semibold text-white">
                      {pipeline.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {pipeline.description || "No description"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      pipeline.status === "completed"
                        ? "bg-emerald-950/50 text-emerald-400"
                        : pipeline.status === "running"
                        ? "bg-blue-950/50 text-blue-400"
                        : pipeline.status === "failed"
                        ? "bg-red-950/50 text-red-400"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {pipeline.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                  <span>{pipeline.processorCount} processors</span>
                  <span>{pipeline.connectionCount} connections</span>
                  {pipeline.lastExecutedAt && (
                    <span>
                      Last run: {new Date(pipeline.lastExecutedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {pipeline.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pipeline.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-800">
                  <Link
                    href={`/flows/${pipeline.id}`}
                    className="flex-1 text-center py-1.5 bg-indigo-600/20 text-indigo-400 text-xs font-medium rounded hover:bg-indigo-600/30 transition-colors"
                  >
                    Open Editor
                  </Link>
                  {userRole !== "viewer" && (
                    <button
                      onClick={() => handleDelete(pipeline.id)}
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
