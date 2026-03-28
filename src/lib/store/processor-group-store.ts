import { v4 as uuidv4 } from "uuid";
import type {
  ProcessorGroup,
  ProcessorGroupListItem,
  Pipeline,
  PipelineListItem,
} from "@/lib/types";
import { writeJsonFile, readJsonFile, listFiles, deleteFile } from "@/lib/data/file-store";

const GROUPS_PREFIX = "processor-groups/groups/";
const PIPELINES_PREFIX = "processor-groups/pipelines/";

const groupsCache = new Map<string, ProcessorGroup>();
const pipelinesCache = new Map<string, Pipeline>();
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    const groupFiles = await listFiles(GROUPS_PREFIX);
    for (const file of groupFiles) {
      if (file.endsWith(".json")) {
        const group = await readJsonFile<ProcessorGroup>(`${GROUPS_PREFIX}${file}`);
        if (group) groupsCache.set(group.id, group);
      }
    }
    const pipelineFiles = await listFiles(PIPELINES_PREFIX);
    for (const file of pipelineFiles) {
      if (file.endsWith(".json")) {
        const pipeline = await readJsonFile<Pipeline>(`${PIPELINES_PREFIX}${file}`);
        if (pipeline) pipelinesCache.set(pipeline.id, pipeline);
      }
    }
  } catch {
    // First run
  }
}

async function persistGroup(group: ProcessorGroup) {
  groupsCache.set(group.id, group);
  await writeJsonFile(`${GROUPS_PREFIX}${group.id}.json`, group);
}

async function persistPipeline(pipeline: Pipeline) {
  pipelinesCache.set(pipeline.id, pipeline);
  await writeJsonFile(`${PIPELINES_PREFIX}${pipeline.id}.json`, pipeline);
}

// Group operations
export async function createGroup(data: {
  name: string;
  description: string;
  companyId: string;
  parentGroupId?: string | null;
  createdBy: string;
  tags?: string[];
}): Promise<ProcessorGroup> {
  await ensureLoaded();
  const now = new Date().toISOString();
  const group: ProcessorGroup = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    companyId: data.companyId,
    parentGroupId: data.parentGroupId ?? null,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
    status: "active",
    tags: data.tags ?? [],
    version: 1,
  };
  await persistGroup(group);
  return group;
}

export async function getGroup(id: string): Promise<ProcessorGroup | undefined> {
  await ensureLoaded();
  return groupsCache.get(id);
}

export async function listGroups(companyId: string): Promise<ProcessorGroupListItem[]> {
  await ensureLoaded();
  return Array.from(groupsCache.values())
    .filter((g) => g.companyId === companyId)
    .map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      parentGroupId: g.parentGroupId,
      pipelineCount: Array.from(pipelinesCache.values()).filter(
        (p) => p.groupId === g.id
      ).length,
      childGroupCount: Array.from(groupsCache.values()).filter(
        (cg) => cg.parentGroupId === g.id
      ).length,
      status: g.status,
      createdBy: g.createdBy,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      tags: g.tags,
    }));
}

export async function getGroupsByParent(
  companyId: string,
  parentGroupId: string | null
): Promise<ProcessorGroupListItem[]> {
  await ensureLoaded();
  return Array.from(groupsCache.values())
    .filter(
      (g) => g.companyId === companyId && g.parentGroupId === parentGroupId
    )
    .map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      parentGroupId: g.parentGroupId,
      pipelineCount: Array.from(pipelinesCache.values()).filter(
        (p) => p.groupId === g.id
      ).length,
      childGroupCount: Array.from(groupsCache.values()).filter(
        (cg) => cg.parentGroupId === g.id
      ).length,
      status: g.status,
      createdBy: g.createdBy,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      tags: g.tags,
    }));
}

export async function updateGroup(
  id: string,
  updates: Partial<ProcessorGroup>
): Promise<ProcessorGroup | undefined> {
  await ensureLoaded();
  const group = groupsCache.get(id);
  if (!group) return undefined;
  const updated: ProcessorGroup = {
    ...group,
    ...updates,
    updatedAt: new Date().toISOString(),
    version: group.version + 1,
  };
  await persistGroup(updated);
  return updated;
}

export async function deleteGroup(id: string): Promise<boolean> {
  await ensureLoaded();
  // Also delete child groups and pipelines
  const childGroups = Array.from(groupsCache.values()).filter(
    (g) => g.parentGroupId === id
  );
  for (const child of childGroups) {
    await deleteGroup(child.id);
  }
  const groupPipelines = Array.from(pipelinesCache.values()).filter(
    (p) => p.groupId === id
  );
  for (const pipeline of groupPipelines) {
    pipelinesCache.delete(pipeline.id);
    await deleteFile(`${PIPELINES_PREFIX}${pipeline.id}.json`);
  }
  groupsCache.delete(id);
  await deleteFile(`${GROUPS_PREFIX}${id}.json`);
  return true;
}

// Pipeline operations
export async function createPipeline(data: {
  name: string;
  description: string;
  groupId: string;
  companyId: string;
  createdBy: string;
  tags?: string[];
}): Promise<Pipeline> {
  await ensureLoaded();
  const now = new Date().toISOString();
  const pipeline: Pipeline = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    groupId: data.groupId,
    companyId: data.companyId,
    processors: [],
    connections: [],
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
    status: "draft",
    tags: data.tags ?? [],
  };
  await persistPipeline(pipeline);
  return pipeline;
}

export async function getPipeline(id: string): Promise<Pipeline | undefined> {
  await ensureLoaded();
  return pipelinesCache.get(id);
}

export async function listPipelines(groupId: string): Promise<PipelineListItem[]> {
  await ensureLoaded();
  return Array.from(pipelinesCache.values())
    .filter((p) => p.groupId === groupId)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      groupId: p.groupId,
      status: p.status,
      processorCount: p.processors.length,
      connectionCount: p.connections.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      lastExecutedAt: p.lastExecutedAt,
      tags: p.tags,
    }));
}

export async function listAllPipelines(companyId: string): Promise<PipelineListItem[]> {
  await ensureLoaded();
  return Array.from(pipelinesCache.values())
    .filter((p) => p.companyId === companyId)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      groupId: p.groupId,
      status: p.status,
      processorCount: p.processors.length,
      connectionCount: p.connections.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      lastExecutedAt: p.lastExecutedAt,
      tags: p.tags,
    }));
}

export async function updatePipeline(
  id: string,
  updates: Partial<Pipeline>
): Promise<Pipeline | undefined> {
  await ensureLoaded();
  const pipeline = pipelinesCache.get(id);
  if (!pipeline) return undefined;
  const updated: Pipeline = {
    ...pipeline,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await persistPipeline(updated);
  return updated;
}

export async function deletePipeline(id: string): Promise<boolean> {
  await ensureLoaded();
  pipelinesCache.delete(id);
  await deleteFile(`${PIPELINES_PREFIX}${id}.json`);
  return true;
}

// Breadcrumb helper
export async function getGroupBreadcrumb(
  groupId: string | null
): Promise<{ id: string; name: string }[]> {
  await ensureLoaded();
  const breadcrumbs: { id: string; name: string }[] = [];
  let currentId = groupId;
  while (currentId) {
    const group = groupsCache.get(currentId);
    if (!group) break;
    breadcrumbs.unshift({ id: group.id, name: group.name });
    currentId = group.parentGroupId;
  }
  return breadcrumbs;
}
