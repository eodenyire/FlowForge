"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FileEntry { name: string; isDir?: boolean }

export default function DataBrowserPage() {
  const [currentPath, setCurrentPath] = useState("samples");
  const [dirs, setDirs] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [fileContent, setFileContent] = useState<unknown>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { browse(currentPath); }, [currentPath]);

  const browse = async (path: string) => {
    setLoading(true);
    setFileContent(null);
    setSelectedFile(null);
    try {
      const res = await fetch(`/api/files/browse?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setDirs(data.directories || []);
        setFiles(data.files || []);
      }
    } finally { setLoading(false); }
  };

  const viewFile = async (path: string) => {
    setSelectedFile(path);
    try {
      const res = await fetch(`/api/files/browse?path=${encodeURIComponent(path)}&read=true`);
      if (res.ok) {
        const data = await res.json();
        setFileContent(data.content);
      }
    } catch { /* ignore */ }
  };

  const pathParts = currentPath.split("/").filter(Boolean);

  const categoryColors: Record<string, string> = {
    samples: "text-emerald-400",
    outputs: "text-blue-400",
    databases: "text-amber-400",
    workflows: "text-purple-400",
    provenance: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-neutral-500 hover:text-neutral-300 text-sm mb-1 inline-block">← Home</Link>
            <h1 className="text-2xl font-bold text-neutral-100">Data Browser</h1>
            <p className="text-sm text-neutral-500 mt-1">Browse sample files, outputs, and persisted data</p>
          </div>
          <button
            onClick={() => browse(currentPath)}
            className="px-3 py-1.5 text-xs bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 hover:bg-neutral-700"
          >
            Refresh
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-4 text-sm">
          <button onClick={() => setCurrentPath("")} className="text-neutral-500 hover:text-neutral-300">root</button>
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-neutral-700">/</span>
              <button
                onClick={() => setCurrentPath(pathParts.slice(0, i + 1).join("/"))}
                className={`${categoryColors[part] || "text-neutral-400"} hover:opacity-80`}
              >
                {part}
              </button>
            </span>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* File tree */}
          <div className="col-span-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Directory</h3>
              {loading ? (
                <p className="text-xs text-neutral-600">Loading...</p>
              ) : (
                <div className="space-y-0.5">
                  {dirs.map((d) => (
                    <button
                      key={d}
                      onClick={() => setCurrentPath(currentPath ? `${currentPath}/${d}` : d)}
                      className="w-full text-left px-2 py-1.5 rounded text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 flex items-center gap-2"
                    >
                      <span className="text-neutral-600">📁</span> {d}/
                    </button>
                  ))}
                  {files.map((f) => (
                    <button
                      key={f}
                      onClick={() => viewFile(currentPath ? `${currentPath}/${f}` : f)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 ${selectedFile === (currentPath ? `${currentPath}/${f}` : f) ? "bg-indigo-950/30 text-indigo-300" : "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"}`}
                    >
                      <span className="text-neutral-600">
                        {f.endsWith(".json") ? "📄" : f.endsWith(".csv") ? "📊" : f.endsWith(".xml") ? "📰" : f.endsWith(".txt") ? "📝" : "📎"}
                      </span>
                      {f}
                    </button>
                  ))}
                  {dirs.length === 0 && files.length === 0 && (
                    <p className="text-xs text-neutral-700 py-4 text-center">Empty directory</p>
                  )}
                </div>
              )}
            </div>

            {/* Quick navigation */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mt-4">
              <h3 className="text-xs font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Quick Nav</h3>
              <div className="space-y-1">
                {["samples", "samples/json", "samples/csv", "samples/excel", "samples/parquet", "samples/pdf", "outputs", "outputs/csv", "outputs/json", "outputs/excel", "outputs/parquet", "outputs/xml", "outputs/pdf", "databases", "workflows", "provenance"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPath(p)}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] ${currentPath === p ? "bg-indigo-950/30 text-indigo-300" : "text-neutral-500 hover:text-neutral-300"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File viewer */}
          <div className="col-span-8">
            {fileContent !== null ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-neutral-200">{selectedFile}</h3>
                  <span className="text-[10px] text-neutral-600">
                    {typeof fileContent === "string" ? `${fileContent.length} chars` : "JSON data"}
                  </span>
                </div>
                <div className="p-4 max-h-[600px] overflow-auto">
                  <pre className="text-xs text-neutral-400 font-mono whitespace-pre-wrap">
                    {typeof fileContent === "string" ? fileContent : JSON.stringify(fileContent, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-12 text-center">
                <p className="text-neutral-500">Select a file to view its contents</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
