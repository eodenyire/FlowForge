"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FlowListItem } from "@/lib/types";

export default function FlowsPage() {
  const [flows, setFlows] = useState<FlowListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      const res = await fetch("/api/flows");
      if (res.ok) {
        const data = await res.json();
        setFlows(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const createFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
        }),
      });
      if (res.ok) {
        const flow = await res.json();
        router.push(`/flows/${flow.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteFlow = async (id: string) => {
    await fetch(`/api/flows/${id}`, { method: "DELETE" });
    setFlows((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="text-neutral-500 hover:text-neutral-300 text-sm mb-2 inline-block"
            >
              ← Home
            </Link>
            <h1 className="text-2xl font-bold text-neutral-100">Data Flows</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Manage and configure your data pipelines
            </p>
          </div>
        </div>

        <form
          onSubmit={createFlow}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8"
        >
          <h2 className="text-sm font-semibold text-neutral-300 mb-4">
            Create New Flow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Flow name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? "Creating..." : "Create Flow"}
          </button>
        </form>

        {loading ? (
          <p className="text-neutral-500 text-sm text-center py-12">Loading flows...</p>
        ) : flows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-lg font-medium">
              No flows yet
            </p>
            <p className="text-neutral-600 text-sm mt-1">
              Create your first data flow to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link
                    href={`/flows/${flow.id}`}
                    className="text-sm font-semibold text-neutral-200 hover:text-indigo-400 transition-colors"
                  >
                    {flow.name}
                  </Link>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${getStatusBadge(
                      flow.status
                    )}`}
                  >
                    {flow.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-4 line-clamp-2">
                  {flow.description || "No description"}
                </p>
                <div className="flex items-center gap-4 text-[10px] text-neutral-600 mb-4">
                  <span>{flow.processorCount} processors</span>
                  <span>{flow.connectionCount} connections</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-700">
                    Updated {new Date(flow.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => deleteFlow(flow.id)}
                    className="text-xs text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusBadge(status: string): string {
  switch (status) {
    case "running":
      return "bg-blue-900/50 text-blue-400 border border-blue-800";
    case "completed":
      return "bg-emerald-900/50 text-emerald-400 border border-emerald-800";
    case "failed":
      return "bg-red-900/50 text-red-400 border border-red-800";
    default:
      return "bg-neutral-800 text-neutral-400 border border-neutral-700";
  }
}
