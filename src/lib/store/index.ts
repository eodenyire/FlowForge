import { v4 as uuidv4 } from "uuid";
import type {
  FlowDefinition,
  FlowExecution,
  ProvenanceEvent,
  FlowListItem,
} from "@/lib/types";

const flows = new Map<string, FlowDefinition>();
const executions = new Map<string, FlowExecution>();

export function createFlow(
  data: Pick<FlowDefinition, "name" | "description">
): FlowDefinition {
  const now = new Date().toISOString();
  const flow: FlowDefinition = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    processors: [],
    connections: [],
    createdAt: now,
    updatedAt: now,
    status: "draft",
  };
  flows.set(flow.id, flow);
  return flow;
}

export function getFlow(id: string): FlowDefinition | undefined {
  return flows.get(id);
}

export function listFlows(): FlowListItem[] {
  return Array.from(flows.values()).map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    status: f.status,
    processorCount: f.processors.length,
    connectionCount: f.connections.length,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
    lastExecutedAt: f.lastExecutedAt,
  }));
}

export function updateFlow(
  id: string,
  updates: Partial<Pick<FlowDefinition, "name" | "description" | "processors" | "connections" | "status" | "lastExecutedAt">>
): FlowDefinition | undefined {
  const flow = flows.get(id);
  if (!flow) return undefined;
  const updated: FlowDefinition = {
    ...flow,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  flows.set(id, updated);
  return updated;
}

export function deleteFlow(id: string): boolean {
  return flows.delete(id);
}

export function createExecution(flowId: string): FlowExecution {
  const execution: FlowExecution = {
    id: uuidv4(),
    flowId,
    startedAt: new Date().toISOString(),
    status: "running",
    events: [],
  };
  executions.set(execution.id, execution);
  return execution;
}

export function getExecution(id: string): FlowExecution | undefined {
  return executions.get(id);
}

export function updateExecution(
  id: string,
  updates: Partial<FlowExecution>
): FlowExecution | undefined {
  const exec = executions.get(id);
  if (!exec) return undefined;
  const updated = { ...exec, ...updates };
  executions.set(id, updated);
  return updated;
}

export function addProvenanceEvent(
  executionId: string,
  event: Omit<ProvenanceEvent, "id" | "timestamp">
): ProvenanceEvent | undefined {
  const exec = executions.get(executionId);
  if (!exec) return undefined;
  const provenanceEvent: ProvenanceEvent = {
    ...event,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
  };
  exec.events.push(provenanceEvent);
  return provenanceEvent;
}

export function getProvenanceForFlow(flowId: string): ProvenanceEvent[] {
  const events: ProvenanceEvent[] = [];
  for (const exec of executions.values()) {
    if (exec.flowId === flowId) {
      events.push(...exec.events);
    }
  }
  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getExecutionsForFlow(flowId: string): FlowExecution[] {
  return Array.from(executions.values())
    .filter((e) => e.flowId === flowId)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
}
