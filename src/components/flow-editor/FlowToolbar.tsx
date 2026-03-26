"use client";

import { useState } from "react";
import Link from "next/link";

interface FlowToolbarProps {
  flowName: string;
  flowStatus: string;
  isExecuting: boolean;
  onExecute: () => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
}

export function FlowToolbar({
  flowName,
  flowStatus,
  isExecuting,
  onExecute,
  onNameChange,
  onSave,
}: FlowToolbarProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/flows"
          className="text-neutral-500 hover:text-neutral-300 text-sm"
        >
          ← Flows
        </Link>
        <div className="w-px h-6 bg-neutral-700" />
        {isEditing ? (
          <input
            type="text"
            value={flowName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500 min-w-[200px]"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-neutral-200 hover:text-white"
          >
            {flowName || "Untitled Flow"}
          </button>
        )}
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${getStatusBadge(
            flowStatus
          )}`}
        >
          {flowStatus}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            isExecuting
              ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-500"
          }`}
        >
          {isExecuting ? "Running..." : "▶ Execute"}
        </button>
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
