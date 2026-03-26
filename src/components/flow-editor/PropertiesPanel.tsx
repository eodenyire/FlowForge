"use client";

import { getProcessorDefinition } from "@/lib/processors/definitions";
import type { ProcessorNode, ProcessorConfig } from "@/lib/types";

interface PropertiesPanelProps {
  node: ProcessorNode | null;
  onUpdateConfig: (nodeId: string, config: ProcessorConfig) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  onRemoveNode: (nodeId: string) => void;
}

export function PropertiesPanel({
  node,
  onUpdateConfig,
  onUpdateLabel,
  onRemoveNode,
}: PropertiesPanelProps) {
  if (!node) {
    return (
      <div className="w-72 bg-neutral-900 border-l border-neutral-800 p-4 flex items-center justify-center">
        <p className="text-sm text-neutral-500 text-center">
          Select a processor to view its properties
        </p>
      </div>
    );
  }

  const def = getProcessorDefinition(node.type);

  return (
    <div className="w-72 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-200">
            {def.name}
          </h2>
          <button
            onClick={() => onRemoveNode(node.id)}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-950/30"
          >
            Remove
          </button>
        </div>
        <p className="text-[10px] text-neutral-500 mt-1">{def.description}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
            Label
          </label>
          <input
            type="text"
            value={node.label}
            onChange={(e) => onUpdateLabel(node.id, e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="border-t border-neutral-800 pt-4">
          <h3 className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-3">
            Configuration
          </h3>
          {def.configSchema.map((field) => (
            <div key={field.key} className="mb-3">
              <label className="block text-xs text-neutral-400 mb-1">
                {field.label}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  value={
                    (node.config[field.key] as string) ??
                    (field.defaultValue as string) ??
                    ""
                  }
                  onChange={(e) =>
                    onUpdateConfig(node.id, {
                      ...node.config,
                      [field.key]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={(node.config[field.key] as string) ?? ""}
                  onChange={(e) =>
                    onUpdateConfig(node.id, {
                      ...node.config,
                      [field.key]: e.target.value,
                    })
                  }
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-indigo-500 resize-none font-mono"
                />
              ) : field.type === "boolean" ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      (node.config[field.key] as boolean) ??
                      (field.defaultValue as boolean) ??
                      false
                    }
                    onChange={(e) =>
                      onUpdateConfig(node.id, {
                        ...node.config,
                        [field.key]: e.target.checked,
                      })
                    }
                    className="rounded border-neutral-700 bg-neutral-800"
                  />
                  <span className="text-sm text-neutral-400">Enabled</span>
                </label>
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={(node.config[field.key] as string) ?? ""}
                  onChange={(e) =>
                    onUpdateConfig(node.id, {
                      ...node.config,
                      [field.key]: e.target.value,
                    })
                  }
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-800 pt-4">
          <h3 className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-2">
            Status
          </h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${getStatusDotColor(node.status)}`}
            />
            <span className="text-xs text-neutral-400 capitalize">
              {node.status}
            </span>
          </div>
          {node.errorMessage && (
            <p className="text-xs text-red-400 mt-2 bg-red-950/30 rounded px-2 py-1.5">
              {node.errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusDotColor(status: string): string {
  switch (status) {
    case "running":
      return "bg-blue-400 animate-pulse";
    case "success":
      return "bg-emerald-400";
    case "error":
      return "bg-red-400";
    default:
      return "bg-neutral-500";
  }
}
