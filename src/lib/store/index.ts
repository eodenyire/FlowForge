import { v4 as uuidv4 } from "uuid";
import type {
  FlowDefinition,
  FlowExecution,
  ProvenanceEvent,
  FlowListItem,
} from "@/lib/types";
import { writeJsonFile, readJsonFile, listFiles, deleteFile } from "@/lib/data/file-store";

const FLOWS_PREFIX = "workflows/flows/";
const EXECUTIONS_PREFIX = "provenance/executions/";

// In-memory cache backed by disk
const flowsCache = new Map<string, FlowDefinition>();
const executionsCache = new Map<string, FlowExecution>();
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    const files = await listFiles(FLOWS_PREFIX);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const flow = await readJsonFile<FlowDefinition>(`${FLOWS_PREFIX}${file}`);
        if (flow) flowsCache.set(flow.id, flow);
      }
    }
    const execFiles = await listFiles(EXECUTIONS_PREFIX);
    for (const file of execFiles) {
      if (file.endsWith(".json")) {
        const exec = await readJsonFile<FlowExecution>(`${EXECUTIONS_PREFIX}${file}`);
        if (exec) executionsCache.set(exec.id, exec);
      }
    }
  } catch {
    // First run, no files yet
  }
}

async function persistFlow(flow: FlowDefinition) {
  flowsCache.set(flow.id, flow);
  await writeJsonFile(`${FLOWS_PREFIX}${flow.id}.json`, flow);
}

async function persistExecution(exec: FlowExecution) {
  executionsCache.set(exec.id, exec);
  await writeJsonFile(`${EXECUTIONS_PREFIX}${exec.id}.json`, exec);
}

export async function createFlow(
  data: Partial<FlowDefinition> & { name: string; description: string }
): Promise<FlowDefinition> {
  await ensureLoaded();
  const now = new Date().toISOString();
  const flow: FlowDefinition = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    processors: data.processors || [],
    connections: data.connections || [],
    tags: data.tags || [],
    category: data.category,
    documentation: data.documentation,
    createdAt: now,
    updatedAt: now,
    status: "draft",
  };
  await persistFlow(flow);
  return flow;
}

export async function getFlow(id: string): Promise<FlowDefinition | undefined> {
  await ensureLoaded();
  return flowsCache.get(id);
}

export async function listFlows(): Promise<FlowListItem[]> {
  await ensureLoaded();
  return Array.from(flowsCache.values()).map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    status: f.status,
    processorCount: f.processors.length,
    connectionCount: f.connections.length,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
    lastExecutedAt: f.lastExecutedAt,
    tags: f.tags,
    category: f.category,
  }));
}

export async function updateFlow(
  id: string,
  updates: Partial<FlowDefinition>
): Promise<FlowDefinition | undefined> {
  await ensureLoaded();
  const flow = flowsCache.get(id);
  if (!flow) return undefined;
  const updated: FlowDefinition = {
    ...flow,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await persistFlow(updated);
  return updated;
}

export async function deleteFlow(id: string): Promise<boolean> {
  await ensureLoaded();
  flowsCache.delete(id);
  await deleteFile(`${FLOWS_PREFIX}${id}.json`);
  return true;
}

export async function createExecution(flowId: string): Promise<FlowExecution> {
  await ensureLoaded();
  const execution: FlowExecution = {
    id: uuidv4(),
    flowId,
    startedAt: new Date().toISOString(),
    status: "running",
    events: [],
  };
  await persistExecution(execution);
  return execution;
}

export async function getExecution(id: string): Promise<FlowExecution | undefined> {
  await ensureLoaded();
  return executionsCache.get(id);
}

export async function updateExecution(
  id: string,
  updates: Partial<FlowExecution>
): Promise<FlowExecution | undefined> {
  await ensureLoaded();
  const exec = executionsCache.get(id);
  if (!exec) return undefined;
  const updated = { ...exec, ...updates };
  await persistExecution(updated);
  return updated;
}

export async function addProvenanceEvent(
  executionId: string,
  event: Omit<ProvenanceEvent, "id" | "timestamp">
): Promise<ProvenanceEvent | undefined> {
  await ensureLoaded();
  const exec = executionsCache.get(executionId);
  if (!exec) return undefined;
  const provenanceEvent: ProvenanceEvent = {
    ...event,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
  };
  exec.events.push(provenanceEvent);
  await persistExecution(exec);
  return provenanceEvent;
}

export async function getProvenanceForFlow(flowId: string): Promise<ProvenanceEvent[]> {
  await ensureLoaded();
  const events: ProvenanceEvent[] = [];
  for (const exec of executionsCache.values()) {
    if (exec.flowId === flowId) {
      events.push(...exec.events);
    }
  }
  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function getExecutionsForFlow(flowId: string): Promise<FlowExecution[]> {
  await ensureLoaded();
  return Array.from(executionsCache.values())
    .filter((e) => e.flowId === flowId)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
}
