"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import type {
  FlowDefinition,
  ProcessorNode,
  Connection,
  ProcessorType,
  ProcessorConfig,
  ProvenanceEvent,
} from "@/lib/types";
import { getProcessorDefinition } from "@/lib/processors/definitions";
import { FlowCanvas } from "@/components/flow-editor/FlowCanvas";
import { ProcessorPalette } from "@/components/flow-editor/ProcessorPalette";
import { PropertiesPanel } from "@/components/flow-editor/PropertiesPanel";
import { FlowToolbar } from "@/components/flow-editor/FlowToolbar";
import { ProvenanceLog } from "@/components/flow-editor/ProvenanceLog";

interface FlowEditorProps {
  flowId: string;
}

export function FlowEditor({ flowId }: FlowEditorProps) {
  const [flow, setFlow] = useState<FlowDefinition | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [provenanceEvents, setProvenanceEvents] = useState<ProvenanceEvent[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const fetchFlow = useCallback(async () => {
    try {
      const res = await fetch(`/api/flows/${flowId}`);
      if (!res.ok) throw new Error("Flow not found");
      const data = await res.json();
      setFlow(data);
    } catch {
      setFlow(null);
    } finally {
      setLoading(false);
    }
  }, [flowId]);

  useEffect(() => {
    fetchFlow();
  }, [fetchFlow]);

  const fetchProvenance = async () => {
    try {
      const res = await fetch(`/api/flows/${flowId}/provenance`);
      if (res.ok) {
        const data = await res.json();
        setProvenanceEvents(data.events);
      }
    } catch {
      // ignore
    }
  };

  const saveFlow = useCallback(async () => {
    if (!flow) return;
    try {
      await fetch(`/api/flows/${flowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: flow.name,
          processors: flow.processors,
          connections: flow.connections,
        }),
      });
    } catch {
      // ignore
    }
  }, [flow, flowId]);

  const executeFlow = useCallback(async () => {
    if (!flow) return;
    setIsExecuting(true);
    try {
      const res = await fetch(`/api/flows/${flowId}/execute`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setProvenanceEvents(data.events);
        setProvenanceOpen(true);
        await fetchFlow();
      } else {
        setProvenanceEvents(data.events || []);
        setProvenanceOpen(true);
        await fetchFlow();
      }
    } catch {
      // ignore
    } finally {
      setIsExecuting(false);
    }
  }, [flow, flowId, fetchFlow]);

  const addProcessor = useCallback(
    (type: ProcessorType) => {
      if (!flow) return;
      const def = getProcessorDefinition(type);
      const newNode: ProcessorNode = {
        id: uuidv4(),
        type,
        label: def.name,
        config: { ...def.defaultConfig },
        position: {
          x: 100 + flow.processors.length * 50,
          y: 100 + flow.processors.length * 50,
        },
        status: "idle",
      };
      setFlow((prev) =>
        prev
          ? {
              ...prev,
              processors: [...prev.processors, newNode],
            }
          : prev
      );
      setSelectedNodeId(newNode.id);
    },
    [flow]
  );

  const moveNode = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setFlow((prev) =>
        prev
          ? {
              ...prev,
              processors: prev.processors.map((p) =>
                p.id === id ? { ...p, position } : p
              ),
            }
          : prev
      );
    },
    []
  );

  const addConnection = useCallback(
    (sourceId: string, targetId: string) => {
      if (!flow) return;
      const exists = flow.connections.some(
        (c) => c.sourceId === sourceId && c.targetId === targetId
      );
      if (exists) return;
      const conn: Connection = {
        id: uuidv4(),
        sourceId,
        sourcePort: "out",
        targetId,
        targetPort: "in",
      };
      setFlow((prev) =>
        prev
          ? {
              ...prev,
              connections: [...prev.connections, conn],
            }
          : prev
      );
    },
    [flow]
  );

  const removeConnection = useCallback((id: string) => {
    setFlow((prev) =>
      prev
        ? {
            ...prev,
            connections: prev.connections.filter((c) => c.id !== id),
          }
        : prev
    );
  }, []);

  const updateNodeConfig = useCallback(
    (nodeId: string, config: ProcessorConfig) => {
      setFlow((prev) =>
        prev
          ? {
              ...prev,
              processors: prev.processors.map((p) =>
                p.id === nodeId ? { ...p, config } : p
              ),
            }
          : prev
      );
    },
    []
  );

  const updateNodeLabel = useCallback((nodeId: string, label: string) => {
    setFlow((prev) =>
      prev
        ? {
            ...prev,
            processors: prev.processors.map((p) =>
              p.id === nodeId ? { ...p, label } : p
            ),
          }
        : prev
    );
  }, []);

  const removeNode = useCallback(
    (nodeId: string) => {
      setFlow((prev) =>
        prev
          ? {
              ...prev,
              processors: prev.processors.filter((p) => p.id !== nodeId),
              connections: prev.connections.filter(
                (c) => c.sourceId !== nodeId && c.targetId !== nodeId
              ),
            }
          : prev
      );
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
    },
    [selectedNodeId]
  );

  const updateFlowName = useCallback((name: string) => {
    setFlow((prev) => (prev ? { ...prev, name } : prev));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Loading flow...</p>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-300 text-lg font-medium">Flow not found</p>
          <Link
            href="/flows"
            className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block"
          >
            ← Back to flows
          </Link>
        </div>
      </div>
    );
  }

  const selectedNode = flow.processors.find((p) => p.id === selectedNodeId) || null;

  return (
    <div className="h-screen flex flex-col bg-neutral-950">
      <FlowToolbar
        flowName={flow.name}
        flowStatus={flow.status}
        isExecuting={isExecuting}
        onExecute={executeFlow}
        onNameChange={updateFlowName}
        onSave={saveFlow}
      />
      <div className="flex flex-1 min-h-0">
        <ProcessorPalette onAddProcessor={addProcessor} />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0">
            <FlowCanvas
              processors={flow.processors}
              connections={flow.connections}
              selectedId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onMoveNode={moveNode}
              onAddConnection={addConnection}
              onRemoveConnection={removeConnection}
            />
          </div>
          <ProvenanceLog
            events={provenanceEvents}
            isOpen={provenanceOpen}
            onToggle={() => setProvenanceOpen(!provenanceOpen)}
          />
        </div>
        <PropertiesPanel
          node={selectedNode}
          onUpdateConfig={updateNodeConfig}
          onUpdateLabel={updateNodeLabel}
          onRemoveNode={removeNode}
        />
      </div>
    </div>
  );
}
