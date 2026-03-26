"use client";

import type { ProvenanceEvent } from "@/lib/types";

interface ProvenanceLogProps {
  events: ProvenanceEvent[];
  isOpen: boolean;
  onToggle: () => void;
}

function getEventIcon(eventType: string): string {
  switch (eventType) {
    case "start":
      return "→";
    case "success":
      return "✓";
    case "error":
      return "✗";
    case "skip":
      return "⊘";
    default:
      return "•";
  }
}

function getEventColor(eventType: string): string {
  switch (eventType) {
    case "start":
      return "text-blue-400";
    case "success":
      return "text-emerald-400";
    case "error":
      return "text-red-400";
    case "skip":
      return "text-neutral-500";
    default:
      return "text-neutral-400";
  }
}

export function ProvenanceLog({ events, isOpen, onToggle }: ProvenanceLogProps) {
  return (
    <div
      className={`bg-neutral-900 border-t border-neutral-800 transition-all ${
        isOpen ? "h-64" : "h-10"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-neutral-800/50 transition-colors"
      >
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Provenance Log
        </span>
        <span className="text-xs text-neutral-500">
          {events.length} events {isOpen ? "▼" : "▲"}
        </span>
      </button>
      {isOpen && (
        <div className="h-52 overflow-y-auto px-4 pb-2">
          {events.length === 0 ? (
            <p className="text-xs text-neutral-600 text-center py-8">
              No provenance events yet. Execute the flow to generate events.
            </p>
          ) : (
            <div className="space-y-1">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 text-xs py-1.5 px-2 rounded hover:bg-neutral-800/50"
                >
                  <span className={getEventColor(event.eventType)}>
                    {getEventIcon(event.eventType)}
                  </span>
                  <span className="text-neutral-500 font-mono w-20 truncate">
                    {event.processorType}
                  </span>
                  <span className={`capitalize ${getEventColor(event.eventType)}`}>
                    {event.eventType}
                  </span>
                  {event.inputRecords !== undefined && (
                    <span className="text-neutral-600">
                      in:{event.inputRecords}
                    </span>
                  )}
                  {event.outputRecords !== undefined && (
                    <span className="text-neutral-600">
                      out:{event.outputRecords}
                    </span>
                  )}
                  {event.errorMessage && (
                    <span className="text-red-400 truncate max-w-[200px]">
                      {event.errorMessage}
                    </span>
                  )}
                  <span className="text-neutral-700 ml-auto font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
