import { writeFile, readFile, mkdir, readdir, unlink, stat } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

export async function writeJsonFile(relativePath: string, data: unknown) {
  const fullPath = join(DATA_DIR, relativePath);
  await ensureDir(join(fullPath, ".."));
  await writeFile(fullPath, JSON.stringify(data, null, 2), "utf-8");
}

export async function readJsonFile<T>(relativePath: string): Promise<T | null> {
  const fullPath = join(DATA_DIR, relativePath);
  if (!existsSync(fullPath)) return null;
  const content = await readFile(fullPath, "utf-8");
  return JSON.parse(content) as T;
}

export async function writeTextFile(relativePath: string, content: string) {
  const fullPath = join(DATA_DIR, relativePath);
  await ensureDir(join(fullPath, ".."));
  await writeFile(fullPath, content, "utf-8");
}

export async function readTextFile(relativePath: string): Promise<string | null> {
  const fullPath = join(DATA_DIR, relativePath);
  if (!existsSync(fullPath)) return null;
  return readFile(fullPath, "utf-8");
}

export async function listFiles(relativePath: string): Promise<string[]> {
  const fullPath = join(DATA_DIR, relativePath);
  if (!existsSync(fullPath)) return [];
  const entries = await readdir(fullPath, { withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => e.name);
}

export async function listDirs(relativePath: string): Promise<string[]> {
  const fullPath = join(DATA_DIR, relativePath);
  if (!existsSync(fullPath)) return [];
  const entries = await readdir(fullPath, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function deleteFile(relativePath: string) {
  const fullPath = join(DATA_DIR, relativePath);
  if (existsSync(fullPath)) {
    await unlink(fullPath);
  }
}

export async function fileExists(relativePath: string): Promise<boolean> {
  return existsSync(join(DATA_DIR, relativePath));
}

export async function getFileSize(relativePath: string): Promise<number> {
  const fullPath = join(DATA_DIR, relativePath);
  if (!existsSync(fullPath)) return 0;
  const s = await stat(fullPath);
  return s.size;
}

export function getDataDir() {
  return DATA_DIR;
}
