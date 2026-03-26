"use client";

import { getAllProcessorDefinitions } from "@/lib/processors/definitions";
import type { ProcessorDefinition, ProcessorType } from "@/lib/types";

interface ProcessorPaletteProps {
  onAddProcessor: (type: ProcessorType) => void;
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "source":
      return "Sources";
    case "transform":
      return "Transforms";
    case "sink":
      return "Sinks";
    default:
      return "Other";
  }
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case "source":
      return "↗";
    case "transform":
      return "⇄";
    case "sink":
      return "↙";
    default:
      return "•";
  }
}

export function ProcessorPalette({ onAddProcessor }: ProcessorPaletteProps) {
  const definitions = getAllProcessorDefinitions();
  const categories = ["source", "transform", "sink"] as const;

  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-200">Processors</h2>
        <p className="text-xs text-neutral-500 mt-1">
          Click to add to canvas
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((category) => {
          const procs = definitions.filter((d) => d.category === category);
          if (procs.length === 0) return null;
          return (
            <div key={category}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs text-neutral-500">
                  {getCategoryIcon(category)}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                  {getCategoryLabel(category)}
                </span>
              </div>
              <div className="space-y-1.5">
                {procs.map((proc) => (
                  <button
                    key={proc.type}
                    onClick={() => onAddProcessor(proc.type)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all hover:border-indigo-500/50 hover:bg-indigo-950/30 ${getCategoryStyle(
                      category
                    )}`}
                  >
                    <div className="text-xs font-medium">{proc.name}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
                      {proc.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getCategoryStyle(category: string): string {
  switch (category) {
    case "source":
      return "border-emerald-800/50 bg-emerald-950/20";
    case "transform":
      return "border-blue-800/50 bg-blue-950/20";
    case "sink":
      return "border-amber-800/50 bg-amber-950/20";
    default:
      return "border-neutral-700 bg-neutral-800/50";
  }
}
