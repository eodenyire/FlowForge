"use client";

import { useCallback, useRef, useState } from "react";
import type {
  ProcessorNode,
  Connection,
  ProcessorType,
} from "@/lib/types";
import { getProcessorDefinition } from "@/lib/processors/definitions";

interface FlowCanvasProps {
  processors: ProcessorNode[];
  connections: Connection[];
  selectedId: string | null;
  onSelectNode: (id: string | null) => void;
  onMoveNode: (id: string, position: { x: number; y: number }) => void;
  onAddConnection: (sourceId: string, targetId: string) => void;
  onRemoveConnection: (id: string) => void;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

function getCategoryColor(category: string): string {
  switch (category) {
    case "source":
      return "bg-emerald-900/80 border-emerald-500 text-emerald-300";
    case "transform":
      return "bg-blue-900/80 border-blue-500 text-blue-300";
    case "sink":
      return "bg-amber-900/80 border-amber-500 text-amber-300";
    default:
      return "bg-neutral-800 border-neutral-600 text-neutral-300";
  }
}

function getStatusIcon(status: ProcessorNode["status"]): string {
  switch (status) {
    case "running":
      return "⟳";
    case "success":
      return "✓";
    case "error":
      return "✗";
    default:
      return "○";
  }
}

function getStatusColor(status: ProcessorNode["status"]): string {
  switch (status) {
    case "running":
      return "text-blue-400";
    case "success":
      return "text-emerald-400";
    case "error":
      return "text-red-400";
    default:
      return "text-neutral-500";
  }
}

export function FlowCanvas({
  processors,
  connections,
  selectedId,
  onSelectNode,
  onMoveNode,
  onAddConnection,
  onRemoveConnection,
}: FlowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      const node = processors.find((p) => p.id === nodeId);
      if (!node) return;

      onSelectNode(nodeId);
      setDraggingNodeId(nodeId);
      setDragOffset({
        x: e.clientX - node.position.x,
        y: e.clientY - node.position.y,
      });
    },
    [processors, onSelectNode]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }

      if (draggingNodeId) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        onMoveNode(draggingNodeId, {
          x: Math.max(0, newX),
          y: Math.max(0, newY),
        });
      }
    },
    [draggingNodeId, dragOffset, onMoveNode]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingNodeId(null);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === "svg") {
        onSelectNode(null);
      }
    },
    [onSelectNode]
  );

  const startConnecting = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      setConnectingFrom(nodeId);
    },
    []
  );

  const finishConnecting = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      if (connectingFrom && connectingFrom !== nodeId) {
        onAddConnection(connectingFrom, nodeId);
      }
      setConnectingFrom(null);
    },
    [connectingFrom, onAddConnection]
  );

  const getConnectionPath = useCallback(
    (source: ProcessorNode, target: ProcessorNode) => {
      const sx = source.position.x + NODE_WIDTH;
      const sy = source.position.y + NODE_HEIGHT / 2;
      const tx = target.position.x;
      const ty = target.position.y + NODE_HEIGHT / 2;
      const midX = (sx + tx) / 2;
      return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
    },
    []
  );

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-neutral-950 overflow-auto"
      style={{
        backgroundImage:
          "radial-gradient(circle, #262626 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ minWidth: 2000, minHeight: 2000 }}
      >
        {connections.map((conn) => {
          const source = processors.find((p) => p.id === conn.sourceId);
          const target = processors.find((p) => p.id === conn.targetId);
          if (!source || !target) return null;
          return (
            <g key={conn.id}>
              <path
                d={getConnectionPath(source, target)}
                fill="none"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray={selectedId === conn.id ? "5,5" : undefined}
              />
              <circle
                cx={(source.position.x + NODE_WIDTH + target.position.x) / 2}
                cy={
                  (source.position.y +
                    NODE_HEIGHT / 2 +
                    target.position.y +
                    NODE_HEIGHT / 2) /
                  2
                }
                r={8}
                fill="#ef4444"
                className="pointer-events-auto cursor-pointer opacity-0 hover:opacity-100"
                onClick={() => onRemoveConnection(conn.id)}
              />
            </g>
          );
        })}
        {connectingFrom && (
          <line
            x1={
              (processors.find((p) => p.id === connectingFrom)?.position.x ?? 0) +
              NODE_WIDTH
            }
            y1={
              (processors.find((p) => p.id === connectingFrom)?.position.y ?? 0) +
              NODE_HEIGHT / 2
            }
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )}
      </svg>

      {processors.map((node) => {
        const def = getProcessorDefinition(node.type);
        const colorClass = getCategoryColor(def.category);
        return (
          <div
            key={node.id}
            className={`absolute select-none rounded-lg border-2 shadow-lg transition-shadow cursor-move ${colorClass} ${
              selectedId === node.id
                ? "ring-2 ring-indigo-400 ring-offset-1 ring-offset-neutral-950 shadow-indigo-500/30"
                : "hover:shadow-lg"
            }`}
            style={{
              left: node.position.x,
              top: node.position.y,
              width: NODE_WIDTH,
              height: NODE_HEIGHT,
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <span className="text-xs font-semibold truncate">{def.name}</span>
              <span className={`text-xs ${getStatusColor(node.status)}`}>
                {getStatusIcon(node.status)}
              </span>
            </div>
            <div className="px-3 py-1.5">
              <p className="text-[10px] opacity-70 truncate">
                {node.label || def.description}
              </p>
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
              <div
                className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-neutral-900 pointer-events-auto cursor-pointer hover:bg-indigo-400"
                onClick={(e) => finishConnecting(e, node.id)}
              />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
              <div
                className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-neutral-900 pointer-events-auto cursor-pointer hover:bg-indigo-400"
                onMouseDown={(e) => startConnecting(e, node.id)}
              />
            </div>
          </div>
        );
      })}

      {processors.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-neutral-600">
            <p className="text-lg font-medium">No processors yet</p>
            <p className="text-sm mt-1">
              Drag processors from the sidebar to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
