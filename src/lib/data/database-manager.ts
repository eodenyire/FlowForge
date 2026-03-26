import { v4 as uuidv4 } from "uuid";
import { writeJsonFile, readJsonFile, listFiles, deleteFile } from "./file-store";

export type DatabaseType =
  | "mysql"
  | "mssql"
  | "oracle"
  | "cassandra"
  | "mongodb"
  | "neo4j"
  | "postgresql"
  | "gcp-sql"
  | "gcp-bigquery"
  | "aws-rds"
  | "aws-dynamodb"
  | "aws-redshift"
  | "azure-sql"
  | "azure-cosmos"
  | "sqlite";

export interface DatabaseConnection {
  id: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  status: "connected" | "disconnected" | "error";
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, string | number | boolean>;
}

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  rowCount: number;
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
}

const CONNECTIONS_PREFIX = "databases/connections/";
const TABLE_DATA_PREFIX = "databases/tables/";

function getDbDefaults(type: DatabaseType): { port: number; host: string } {
  switch (type) {
    case "mysql": return { port: 3306, host: "localhost" };
    case "mssql": return { port: 1433, host: "localhost" };
    case "oracle": return { port: 1521, host: "localhost" };
    case "cassandra": return { port: 9042, host: "localhost" };
    case "mongodb": return { port: 27017, host: "localhost" };
    case "neo4j": return { port: 7687, host: "localhost" };
    case "postgresql": return { port: 5432, host: "localhost" };
    case "gcp-sql": return { port: 3306, host: "cloud-sql.google.com" };
    case "gcp-bigquery": return { port: 443, host: "bigquery.googleapis.com" };
    case "aws-rds": return { port: 5432, host: "rds.amazonaws.com" };
    case "aws-dynamodb": return { port: 443, host: "dynamodb.amazonaws.com" };
    case "aws-redshift": return { port: 5439, host: "redshift.amazonaws.com" };
    case "azure-sql": return { port: 1433, host: "database.azure.com" };
    case "azure-cosmos": return { port: 443, host: "cosmos.azure.com" };
    case "sqlite": return { port: 0, host: "local" };
  }
}

export function getDbLabel(type: DatabaseType): string {
  const labels: Record<DatabaseType, string> = {
    mysql: "MySQL",
    mssql: "Microsoft SQL Server",
    oracle: "Oracle Database",
    cassandra: "Apache Cassandra",
    mongodb: "MongoDB",
    neo4j: "Neo4j Graph DB",
    postgresql: "PostgreSQL",
    "gcp-sql": "Google Cloud SQL",
    "gcp-bigquery": "Google BigQuery",
    "aws-rds": "Amazon RDS",
    "aws-dynamodb": "Amazon DynamoDB",
    "aws-redshift": "Amazon Redshift",
    "azure-sql": "Azure SQL Database",
    "azure-cosmos": "Azure Cosmos DB",
    sqlite: "SQLite",
  };
  return labels[type];
}

export function getDbCategory(type: DatabaseType): string {
  if (type.startsWith("gcp-")) return "Google Cloud";
  if (type.startsWith("aws-")) return "Amazon Web Services";
  if (type.startsWith("azure-")) return "Microsoft Azure";
  return "On-Premise";
}

export async function createConnection(
  data: Omit<DatabaseConnection, "id" | "status" | "createdAt" | "updatedAt">
): Promise<DatabaseConnection> {
  const now = new Date().toISOString();
  const defaults = getDbDefaults(data.type);
  const conn: DatabaseConnection = {
    ...data,
    id: uuidv4(),
    host: data.host || defaults.host,
    port: data.port || defaults.port,
    status: "connected",
    createdAt: now,
    updatedAt: now,
  };
  await writeJsonFile(`${CONNECTIONS_PREFIX}${conn.id}.json`, conn);
  return conn;
}

export async function getConnection(id: string): Promise<DatabaseConnection | null> {
  return readJsonFile<DatabaseConnection>(`${CONNECTIONS_PREFIX}${id}.json`);
}

export async function listConnections(): Promise<DatabaseConnection[]> {
  const files = await listFiles(CONNECTIONS_PREFIX);
  const connections: DatabaseConnection[] = [];
  for (const file of files) {
    if (file.endsWith(".json")) {
      const conn = await readJsonFile<DatabaseConnection>(`${CONNECTIONS_PREFIX}${file}`);
      if (conn) connections.push(conn);
    }
  }
  return connections.sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateConnection(id: string, updates: Partial<DatabaseConnection>): Promise<DatabaseConnection | null> {
  const existing = await getConnection(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await writeJsonFile(`${CONNECTIONS_PREFIX}${id}.json`, updated);
  return updated;
}

export async function deleteConnection(id: string): Promise<boolean> {
  await deleteFile(`${CONNECTIONS_PREFIX}${id}.json`);
  return true;
}

// Table data operations (simulated DB with file storage)
export async function createTable(dbId: string, tableName: string, columns: ColumnDefinition[]): Promise<TableSchema> {
  const schema: TableSchema = { name: tableName, columns, rowCount: 0 };
  await writeJsonFile(`${TABLE_DATA_PREFIX}${dbId}/${tableName}/schema.json`, schema);
  await writeJsonFile(`${TABLE_DATA_PREFIX}${dbId}/${tableName}/data.json`, []);
  return schema;
}

export async function getTableSchema(dbId: string, tableName: string): Promise<TableSchema | null> {
  return readJsonFile<TableSchema>(`${TABLE_DATA_PREFIX}${dbId}/${tableName}/schema.json`);
}

export async function insertRows(dbId: string, tableName: string, rows: Record<string, unknown>[]): Promise<number> {
  const existing = await readJsonFile<Record<string, unknown>[]>(`${TABLE_DATA_PREFIX}${dbId}/${tableName}/data.json`) ?? [];
  const combined = [...existing, ...rows];
  await writeJsonFile(`${TABLE_DATA_PREFIX}${dbId}/${tableName}/data.json`, combined);

  const schema = await getTableSchema(dbId, tableName);
  if (schema) {
    schema.rowCount = combined.length;
    await writeJsonFile(`${TABLE_DATA_PREFIX}${dbId}/${tableName}/schema.json`, schema);
  }
  return rows.length;
}

export async function queryRows(dbId: string, tableName: string, options?: { limit?: number; offset?: number; where?: Record<string, unknown> }): Promise<Record<string, unknown>[]> {
  let rows = await readJsonFile<Record<string, unknown>[]>(`${TABLE_DATA_PREFIX}${dbId}/${tableName}/data.json`) ?? [];

  if (options?.where) {
    rows = rows.filter((row) =>
      Object.entries(options.where!).every(([key, val]) => row[key] === val)
    );
  }

  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? rows.length;
  return rows.slice(offset, offset + limit);
}

export async function listTables(dbId: string): Promise<string[]> {
  const { listDirs } = await import("./file-store");
  return listDirs(`${TABLE_DATA_PREFIX}${dbId}/`);
}

export async function deleteTable(dbId: string, tableName: string): Promise<void> {
  const { deleteFile: del } = await import("./file-store");
  await del(`${TABLE_DATA_PREFIX}${dbId}/${tableName}/schema.json`);
  await del(`${TABLE_DATA_PREFIX}${dbId}/${tableName}/data.json`);
}
