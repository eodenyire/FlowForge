"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Connection {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  status: string;
  lastTestedAt?: string;
  lastTestResult?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  config: Record<string, string | number | boolean>;
}

interface ConnectionTypeDef {
  type: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  configFields: {
    key: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    defaultValue?: string | number | boolean;
    options?: { label: string; value: string }[];
    group?: string;
  }[];
  defaultConfig: Record<string, string | number | boolean>;
}

export default function ConnectionsPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [typeDefinitions, setTypeDefinitions] = useState<ConnectionTypeDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    tags: "",
  });
  const [configValues, setConfigValues] = useState<
    Record<string, string | number | boolean>
  >({});
  const [creating, setCreating] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});

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

      const [connRes, typesRes] = await Promise.all([
        fetch("/api/connections", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/connections/types", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (connRes.ok) {
        const data = await connRes.json();
        setConnections(data.connections);
      }
      if (typesRes.ok) {
        const data = await typesRes.json();
        setTypeDefinitions(data.definitions);
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

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    const def = typeDefinitions.find((d) => d.type === type);
    if (def) {
      setConfigValues(def.defaultConfig as Record<string, string | number | boolean>);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          type: selectedType,
          config: configValues,
          tags: createForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        setShowCreate(false);
        setSelectedType("");
        setCreateForm({ name: "", description: "", tags: "" });
        setConfigValues({});
        await loadData();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleTest = async (connectionId: string) => {
    try {
      const res = await fetch("/api/connections/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ connectionId }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [connectionId]: data,
      }));
      await loadData();
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [connectionId]: { success: false, message: "Test failed" },
      }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this connection?")) return;
    await fetch(`/api/connections?id=${id}`, {
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

  const filteredConnections =
    activeFilter === "all"
      ? connections
      : connections.filter((c) => c.category === activeFilter);

  const selectedTypeDef = typeDefinitions.find((d) => d.type === selectedType);

  const categoryFilters = [
    { key: "all", label: "All" },
    { key: "database", label: "Databases" },
    { key: "file-server", label: "File Servers" },
    { key: "object-storage", label: "Object Storage" },
    { key: "api", label: "APIs" },
    { key: "email", label: "Email/SMTP" },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-400 text-sm">Loading connections...</div>
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
              <Link href="/processor-groups" className="text-sm text-neutral-400 hover:text-white transition-colors">Processors</Link>
              <Link href="/connections" className="text-sm text-white font-medium">Connections</Link>
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
              Connections
            </h1>
            <p className="text-neutral-400 text-sm">
              Manage database, file server, API, and SMTP connections for your pipelines
            </p>
          </div>
          {userRole !== "viewer" && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            >
              {showCreate ? "Cancel" : "+ New Connection"}
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Create Connection
            </h2>

            {/* Type selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Connection Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {typeDefinitions.map((def) => (
                  <button
                    key={def.type}
                    type="button"
                    onClick={() => handleTypeSelect(def.type)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedType === def.type
                        ? "border-indigo-500 bg-indigo-950/30"
                        : "border-neutral-700 bg-neutral-800 hover:border-neutral-600"
                    }`}
                  >
                    <p className="text-xs font-medium text-white">{def.name}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {def.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedTypeDef && (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Connection Name *</label>
                    <input type="text" required value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                      placeholder={`Production ${selectedTypeDef.name}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
                    <input type="text" value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                      placeholder="Main production database" />
                  </div>
                </div>

                {/* Config fields */}
                <div className="space-y-4">
                  {selectedTypeDef.configFields
                    .reduce((groups: { group: string; fields: typeof selectedTypeDef.configFields }[], field) => {
                      const group = field.group || "General";
                      const existing = groups.find((g) => g.group === group);
                      if (existing) {
                        existing.fields.push(field);
                      } else {
                        groups.push({ group, fields: [field] });
                      }
                      return groups;
                    }, [])
                    .map(({ group, fields }) => (
                      <div key={group}>
                        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                          {group}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {fields.map((field) => (
                            <div key={field.key}>
                              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                                {field.label} {field.required && "*"}
                              </label>
                              {field.type === "select" ? (
                                <select
                                  value={
                                    (configValues[field.key] as string) ??
                                    (field.defaultValue as string) ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    setConfigValues({
                                      ...configValues,
                                      [field.key]: e.target.value,
                                    })
                                  }
                                  required={field.required}
                                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                                >
                                  <option value="">Select...</option>
                                  {field.options?.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : field.type === "boolean" ? (
                                <select
                                  value={
                                    String(
                                      configValues[field.key] ??
                                        field.defaultValue ??
                                        false
                                    )
                                  }
                                  onChange={(e) =>
                                    setConfigValues({
                                      ...configValues,
                                      [field.key]: e.target.value === "true",
                                    })
                                  }
                                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                                >
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              ) : field.type === "textarea" ? (
                                <textarea
                                  value={
                                    (configValues[field.key] as string) ??
                                    (field.defaultValue as string) ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    setConfigValues({
                                      ...configValues,
                                      [field.key]: e.target.value,
                                    })
                                  }
                                  required={field.required}
                                  rows={3}
                                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
                                  placeholder={field.placeholder}
                                />
                              ) : field.type === "number" ? (
                                <input
                                  type="number"
                                  value={
                                    (configValues[field.key] as number) ??
                                    (field.defaultValue as number) ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    setConfigValues({
                                      ...configValues,
                                      [field.key]: Number(e.target.value),
                                    })
                                  }
                                  required={field.required}
                                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                  placeholder={field.placeholder}
                                />
                              ) : (
                                <input
                                  type={field.type === "password" ? "password" : "text"}
                                  value={
                                    (configValues[field.key] as string) ??
                                    (field.defaultValue as string) ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    setConfigValues({
                                      ...configValues,
                                      [field.key]: e.target.value,
                                    })
                                  }
                                  required={field.required}
                                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                  placeholder={field.placeholder}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Tags</label>
                  <input type="text" value={createForm.tags}
                    onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                    className="w-full max-w-sm px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    placeholder="production, primary, readonly" />
                </div>

                <button type="submit" disabled={creating}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50">
                  {creating ? "Creating..." : "Create Connection"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Category filters */}
        <div className="flex items-center gap-2 mb-6">
          {categoryFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === f.key
                  ? "bg-indigo-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Connections list */}
        {filteredConnections.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">{"\u{1F517}"}</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Connections Yet</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              Set up connections to databases, remote servers, API endpoints, and SMTP servers
              to use in your data pipelines.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConnections.map((conn) => (
              <div
                key={conn.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        conn.status === "active"
                          ? "bg-emerald-400"
                          : conn.status === "error"
                          ? "bg-red-400"
                          : conn.status === "testing"
                          ? "bg-blue-400 animate-pulse"
                          : "bg-neutral-500"
                      }`}
                    />
                    <h3 className="text-sm font-semibold text-white">
                      {conn.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-400 uppercase">
                      {conn.type}
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-400">
                      {conn.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 ml-5">
                    {conn.description || "No description"}
                    {conn.lastTestResult && (
                      <span className={conn.status === "active" ? "text-emerald-500 ml-2" : "text-red-500 ml-2"}>
                        {conn.lastTestResult}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTest(conn.id)}
                    className="px-3 py-1.5 bg-blue-950/20 text-blue-400 text-xs font-medium rounded hover:bg-blue-950/30 transition-colors"
                  >
                    Test
                  </button>
                  {userRole !== "viewer" && (
                    <button
                      onClick={() => handleDelete(conn.id)}
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
