import type {
  FlowDefinition,
  FlowExecution,
  ProcessorNode,
  FlowInputData,
  FlowOutputData,
  Connection,
} from "@/lib/types";
import { getProcessorExecutor } from "@/lib/processors";
import {
  updateFlow,
  createExecution,
  updateExecution,
  addProvenanceEvent,
} from "@/lib/store";

function buildAdjacencyList(
  processors: ProcessorNode[],
  connections: Connection[]
): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const p of processors) adj.set(p.id, []);
  for (const conn of connections) {
    const targets = adj.get(conn.sourceId) ?? [];
    targets.push(conn.targetId);
    adj.set(conn.sourceId, targets);
  }
  return adj;
}

function topologicalSort(
  processors: ProcessorNode[],
  connections: Connection[]
): ProcessorNode[] {
  const adj = buildAdjacencyList(processors, connections);
  const inDegree = new Map<string, number>();
  for (const p of processors) inDegree.set(p.id, 0);
  for (const conn of connections) {
    inDegree.set(conn.targetId, (inDegree.get(conn.targetId) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: ProcessorNode[] = [];
  const processorMap = new Map(processors.map((p) => [p.id, p]));

  while (queue.length > 0) {
    const id = queue.shift()!;
    const proc = processorMap.get(id);
    if (proc) sorted.push(proc);
    for (const target of adj.get(id) ?? []) {
      const newDegree = (inDegree.get(target) ?? 1) - 1;
      inDegree.set(target, newDegree);
      if (newDegree === 0) queue.push(target);
    }
  }

  if (sorted.length !== processors.length) {
    throw new Error("Flow contains a cycle - cannot execute");
  }
  return sorted;
}

function getInputDataForProcessor(
  processorId: string,
  connections: Connection[],
  outputs: Map<string, FlowOutputData>
): FlowInputData | null {
  const incomingConnections = connections.filter((c) => c.targetId === processorId);
  if (incomingConnections.length === 0) return null;

  const allRecords: Record<string, unknown>[] = [];
  const combinedMetadata: Record<string, string | number | boolean> = {};
  for (const conn of incomingConnections) {
    const sourceOutput = outputs.get(conn.sourceId);
    if (sourceOutput) {
      allRecords.push(...sourceOutput.records);
      Object.assign(combinedMetadata, sourceOutput.metadata);
    }
  }
  return { records: allRecords, metadata: combinedMetadata };
}

export async function executeFlow(flow: FlowDefinition): Promise<FlowExecution> {
  const execution = await createExecution(flow.id);
  await updateFlow(flow.id, { status: "running" });

  try {
    const sortedProcessors = topologicalSort(flow.processors, flow.connections);
    const outputs = new Map<string, FlowOutputData>();

    for (const processor of sortedProcessors) {
      const inputData = getInputDataForProcessor(processor.id, flow.connections, outputs);

      await addProvenanceEvent(execution.id, {
        flowId: flow.id,
        processorId: processor.id,
        processorType: processor.type,
        eventType: "start",
        inputRecords: inputData?.records.length ?? 0,
      });

      try {
        const executor = getProcessorExecutor(processor.type);
        const output = await executor({
          flowId: flow.id,
          processorId: processor.id,
          config: processor.config,
          inputData,
        });
        outputs.set(processor.id, output);

        await addProvenanceEvent(execution.id, {
          flowId: flow.id,
          processorId: processor.id,
          processorType: processor.type,
          eventType: "success",
          inputRecords: inputData?.records.length ?? 0,
          outputRecords: output.records.length,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        await addProvenanceEvent(execution.id, {
          flowId: flow.id,
          processorId: processor.id,
          processorType: processor.type,
          eventType: "error",
          inputRecords: inputData?.records.length ?? 0,
          errorMessage,
        });
        throw err;
      }
    }

    await updateExecution(execution.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    await updateFlow(flow.id, {
      status: "completed",
      lastExecutedAt: new Date().toISOString(),
    });

    return execution;
  } catch (err) {
    await updateExecution(execution.id, {
      status: "failed",
      completedAt: new Date().toISOString(),
    });
    await updateFlow(flow.id, { status: "failed" });
    throw err;
  }
}
