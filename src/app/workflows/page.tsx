"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FlowListItem {
  id: string;
  name: string;
  description: string;
  status: string;
  processorCount: number;
  connectionCount: number;
  tags?: string[];
  category?: string;
  createdAt: string;
}

export default function WorkflowsPage() {
  const [flows, setFlows] = useState<FlowListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [flowDetail, setFlowDetail] = useState<FlowDetail | null>(null);
  const [setupDone, setSetupDone] = useState(false);
  const [settingUp, setSettingUp] = useState(false);

  interface FlowDetail {
    id: string;
    name: string;
    description: string;
    documentation?: string;
    tags?: string[];
    category?: string;
    processors: { id: string; type: string; label: string; config: Record<string, unknown> }[];
    connections: { id: string; sourceId: string; targetId: string }[];
    status: string;
  }

  useEffect(() => { fetchFlows(); }, []);

  const fetchFlows = async () => {
    try {
      const res = await fetch("/api/flows");
      if (res.ok) {
        const data = await res.json();
        setFlows(data);
      }
    } finally { setLoading(false); }
  };

  const runSetup = async () => {
    setSettingUp(true);
    try {
      const res = await fetch("/api/setup", { method: "POST" });
      if (res.ok) {
        setSetupDone(true);
        await fetchFlows();
      }
    } finally { setSettingUp(false); }
  };

  const viewFlow = async (id: string) => {
    setSelectedFlow(id);
    try {
      const res = await fetch(`/api/flows/${id}`);
      if (res.ok) setFlowDetail(await res.json());
    } catch { /* ignore */ }
  };

  const categories = [...new Set(flows.map((f) => f.category || "Uncategorized"))];
  const statusColors: Record<string, string> = {
    draft: "bg-neutral-800 text-neutral-400",
    completed: "bg-emerald-900/50 text-emerald-400",
    running: "bg-blue-900/50 text-blue-400",
    failed: "bg-red-900/50 text-red-400",
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-neutral-500 hover:text-neutral-300 text-sm mb-1 inline-block">← Home</Link>
            <h1 className="text-2xl font-bold text-neutral-100">Workflow Library</h1>
            <p className="text-sm text-neutral-500 mt-1">Pre-built data pipeline workflows for common scenarios</p>
          </div>
          {flows.length === 0 && !loading && (
            <button
              onClick={runSetup}
              disabled={settingUp}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 disabled:opacity-50"
            >
              {settingUp ? "Setting up..." : "⚡ Run Setup"}
            </button>
          )}
        </div>

        {setupDone && (
          <div className="bg-emerald-950/30 border border-emerald-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-emerald-300">Setup complete! Sample files generated, database connections created, and workflow templates loaded.</p>
          </div>
        )}

        {loading ? (
          <p className="text-neutral-500 text-sm py-12 text-center">Loading workflows...</p>
        ) : flows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-lg font-medium">No workflows yet</p>
            <p className="text-neutral-600 text-sm mt-1">Click &quot;Run Setup&quot; to generate sample files, databases, and pre-built workflows</p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Workflow list */}
            <div className="col-span-5 space-y-4">
              {categories.map((cat) => (
                <div key={cat}>
                  <h3 className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-2 px-1">{cat}</h3>
                  <div className="space-y-1.5">
                    {flows.filter((f) => (f.category || "Uncategorized") === cat).map((flow) => (
                      <button
                        key={flow.id}
                        onClick={() => viewFlow(flow.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg border transition-all ${selectedFlow === flow.id ? "border-indigo-500 bg-indigo-950/30" : "border-neutral-800 hover:border-neutral-700 bg-neutral-900/50"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-neutral-200">{flow.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${statusColors[flow.status] || statusColors.draft}`}>{flow.status}</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 line-clamp-2 mb-1.5">{flow.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-neutral-600">{flow.processorCount} processors</span>
                          <span className="text-[9px] text-neutral-600">{flow.connectionCount} connections</span>
                        </div>
                        {flow.tags && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {flow.tags.slice(0, 5).map((tag) => (
                              <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500">{tag}</span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Workflow detail */}
            <div className="col-span-7">
              {flowDetail ? (
                <div className="space-y-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-neutral-100">{flowDetail.name}</h2>
                      <Link
                        href={`/flows/${flowDetail.id}`}
                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                      >
                        Open Editor
                      </Link>
                    </div>
                    <p className="text-sm text-neutral-400 mb-3">{flowDetail.description}</p>
                    {flowDetail.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {flowDetail.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/50 text-indigo-400 border border-indigo-800/50">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Documentation */}
                  {flowDetail.documentation && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                      <h3 className="text-xs font-semibold text-neutral-300 mb-3 uppercase tracking-wider">Documentation</h3>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="text-xs text-neutral-400 whitespace-pre-wrap font-sans leading-relaxed">
                          {flowDetail.documentation}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Data flow diagram */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-neutral-300 mb-3 uppercase tracking-wider">Data Flow</h3>
                    <div className="flex flex-wrap gap-2 items-center">
                      {flowDetail.processors.map((p, i) => (
                        <span key={p.id} className="flex items-center gap-2">
                          <span className="px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300">
                            {p.label}
                          </span>
                          {i < flowDetail.processors.length - 1 && (
                            <span className="text-indigo-500">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Processor details */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                    <h3 className="text-xs font-semibold text-neutral-300 mb-3 uppercase tracking-wider">Processors ({flowDetail.processors.length})</h3>
                    <div className="space-y-2">
                      {flowDetail.processors.map((p) => (
                        <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                          <div>
                            <span className="text-xs text-neutral-200 font-medium">{p.label}</span>
                            <span className="text-[10px] text-neutral-600 ml-2">({p.type})</span>
                          </div>
                          <span className="text-[10px] text-neutral-600">
                            {Object.keys(p.config).filter(k => p.config[k]).length} config fields
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-12 text-center">
                  <p className="text-neutral-500">Select a workflow to view its documentation and details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
