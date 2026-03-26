export type ProcessorType =
  | "file-input"
  | "file-output"
  | "json-transform"
  | "csv-transform"
  | "filter"
  | "merge";

export type ProcessorStatus = "idle" | "running" | "success" | "error";

export interface ProcessorConfig {
  [key: string]: string | number | boolean | string[];
}

export interface ProcessorPort {
  id: string;
  name: string;
  type: "input" | "output";
}

export interface ProcessorDefinition {
  type: ProcessorType;
  name: string;
  description: string;
  category: "source" | "transform" | "sink";
  icon: string;
  defaultConfig: ProcessorConfig;
  configSchema: ConfigField[];
  inputs: ProcessorPort[];
  outputs: ProcessorPort[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "textarea";
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface ProcessorNode {
  id: string;
  type: ProcessorType;
  label: string;
  config: ProcessorConfig;
  position: { x: number; y: number };
  status: ProcessorStatus;
  lastRun?: string;
  errorMessage?: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  sourcePort: string;
  targetId: string;
  targetPort: string;
}

export interface FlowDefinition {
  id: string;
  name: string;
  description: string;
  processors: ProcessorNode[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  status: "draft" | "running" | "completed" | "failed";
}

export interface ProvenanceEvent {
  id: string;
  flowId: string;
  processorId: string;
  processorType: ProcessorType;
  eventType: "start" | "success" | "error" | "skip";
  timestamp: string;
  inputRecords?: number;
  outputRecords?: number;
  duration?: number;
  errorMessage?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface FlowExecution {
  id: string;
  flowId: string;
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  events: ProvenanceEvent[];
}

export interface FlowListItem {
  id: string;
  name: string;
  description: string;
  status: FlowDefinition["status"];
  processorCount: number;
  connectionCount: number;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
}

export interface FlowInputData {
  records: Record<string, unknown>[];
  metadata: Record<string, string | number | boolean>;
}

export interface FlowOutputData {
  records: Record<string, unknown>[];
  metadata: Record<string, string | number | boolean>;
}

export interface ProcessorContext {
  flowId: string;
  processorId: string;
  config: ProcessorConfig;
  inputData: FlowInputData | null;
}

export type ProcessorExecuteFn = (
  context: ProcessorContext
) => Promise<FlowOutputData>;
