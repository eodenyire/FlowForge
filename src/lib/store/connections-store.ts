import { v4 as uuidv4 } from "uuid";
import type {
  DataConnection,
  ConnectionType,
  ConnectionCategory,
  ConnectionConfig,
  ConnectionTypeDefinition,
  ConnectionConfigField,
} from "@/lib/types";
import { writeJsonFile, readJsonFile, listFiles, deleteFile } from "@/lib/data/file-store";

const CONNECTIONS_PREFIX = "connections/";

const connectionsCache = new Map<string, DataConnection>();
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    const files = await listFiles(CONNECTIONS_PREFIX);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const conn = await readJsonFile<DataConnection>(
          `${CONNECTIONS_PREFIX}${file}`
        );
        if (conn) connectionsCache.set(conn.id, conn);
      }
    }
  } catch {
    // First run
  }
}

async function persist(conn: DataConnection) {
  connectionsCache.set(conn.id, conn);
  await writeJsonFile(`${CONNECTIONS_PREFIX}${conn.id}.json`, conn);
}

export async function createConnection(data: {
  name: string;
  description: string;
  type: ConnectionType;
  companyId: string;
  createdBy: string;
  config: ConnectionConfig;
  tags?: string[];
}): Promise<DataConnection> {
  await ensureLoaded();
  const def = getConnectionTypeDefinition(data.type);
  const now = new Date().toISOString();
  const conn: DataConnection = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    type: data.type,
    category: def.category,
    companyId: data.companyId,
    createdBy: data.createdBy,
    config: { ...def.defaultConfig, ...data.config },
    status: "inactive",
    createdAt: now,
    updatedAt: now,
    tags: data.tags ?? [],
  };
  await persist(conn);
  return conn;
}

export async function getConnection(
  id: string
): Promise<DataConnection | undefined> {
  await ensureLoaded();
  return connectionsCache.get(id);
}

export async function listConnections(
  companyId: string,
  category?: ConnectionCategory
): Promise<DataConnection[]> {
  await ensureLoaded();
  return Array.from(connectionsCache.values())
    .filter(
      (c) =>
        c.companyId === companyId && (!category || c.category === category)
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listConnectionsByType(
  companyId: string,
  type: ConnectionType
): Promise<DataConnection[]> {
  await ensureLoaded();
  return Array.from(connectionsCache.values())
    .filter((c) => c.companyId === companyId && c.type === type)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateConnection(
  id: string,
  updates: Partial<DataConnection>
): Promise<DataConnection | undefined> {
  await ensureLoaded();
  const conn = connectionsCache.get(id);
  if (!conn) return undefined;
  const updated: DataConnection = {
    ...conn,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await persist(updated);
  return updated;
}

export async function testConnection(
  id: string
): Promise<{ success: boolean; message: string }> {
  await ensureLoaded();
  const conn = connectionsCache.get(id);
  if (!conn) return { success: false, message: "Connection not found" };

  // Simulate connection test based on type
  const updated: DataConnection = {
    ...conn,
    status: "testing",
    lastTestedAt: new Date().toISOString(),
  };
  await persist(updated);

  // Simulated test - in production, this would actually attempt to connect
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const success = Math.random() > 0.1; // 90% success rate for simulation
  const result: DataConnection = {
    ...updated,
    status: success ? "active" : "error",
    lastTestResult: success
      ? `Connection to ${conn.name} successful`
      : `Connection to ${conn.name} failed - check credentials`,
  };
  await persist(result);

  return {
    success,
    message: result.lastTestResult ?? "Test completed",
  };
}

export async function deleteConnection(id: string): Promise<boolean> {
  await ensureLoaded();
  connectionsCache.delete(id);
  await deleteFile(`${CONNECTIONS_PREFIX}${id}.json`);
  return true;
}

// Connection type definitions
export function getConnectionTypeDefinition(
  type: ConnectionType
): ConnectionTypeDefinition {
  return CONNECTION_TYPE_DEFINITIONS[type] ?? DEFAULT_DEF;
}

export function getAllConnectionTypeDefinitions(): ConnectionTypeDefinition[] {
  return Object.values(CONNECTION_TYPE_DEFINITIONS);
}

const DEFAULT_DEF: ConnectionTypeDefinition = {
  type: "postgresql",
  name: "PostgreSQL",
  category: "database",
  description: "PostgreSQL database connection",
  icon: "\u{1F5C4}",
  configFields: [],
  defaultConfig: {},
};

const CONNECTION_TYPE_DEFINITIONS: Record<ConnectionType, ConnectionTypeDefinition> = {
  postgresql: {
    type: "postgresql",
    name: "PostgreSQL",
    category: "database",
    description: "Connect to PostgreSQL database for reading and writing data",
    icon: "\u{1F5C4}",
    configFields: dbConfigFields("PostgreSQL", 5432),
    defaultConfig: {
      host: "localhost",
      port: 5432,
      database: "",
      username: "",
      password: "",
      ssl: false,
      connectionPoolSize: 10,
      connectionTimeout: 30000,
    },
  },
  mysql: {
    type: "mysql",
    name: "MySQL",
    category: "database",
    description: "Connect to MySQL database for reading and writing data",
    icon: "\u{1F5C4}",
    configFields: dbConfigFields("MySQL", 3306),
    defaultConfig: {
      host: "localhost",
      port: 3306,
      database: "",
      username: "",
      password: "",
      ssl: false,
      connectionPoolSize: 10,
      connectionTimeout: 30000,
    },
  },
  mariadb: {
    type: "mariadb",
    name: "MariaDB",
    category: "database",
    description: "Connect to MariaDB database for reading and writing data",
    icon: "\u{1F5C4}",
    configFields: dbConfigFields("MariaDB", 3306),
    defaultConfig: {
      host: "localhost",
      port: 3306,
      database: "",
      username: "",
      password: "",
      ssl: false,
      connectionPoolSize: 10,
      connectionTimeout: 30000,
    },
  },
  mssql: {
    type: "mssql",
    name: "Microsoft SQL Server",
    category: "database",
    description: "Connect to Microsoft SQL Server database",
    icon: "\u{1F5C4}",
    configFields: dbConfigFields("MSSQL", 1433),
    defaultConfig: {
      host: "localhost",
      port: 1433,
      database: "",
      username: "",
      password: "",
      ssl: false,
      connectionPoolSize: 10,
      connectionTimeout: 30000,
    },
  },
  oracle: {
    type: "oracle",
    name: "Oracle Database",
    category: "database",
    description: "Connect to Oracle database",
    icon: "\u{1F5C4}",
    configFields: dbConfigFields("Oracle", 1521),
    defaultConfig: {
      host: "localhost",
      port: 1521,
      database: "",
      username: "",
      password: "",
      ssl: false,
      connectionPoolSize: 10,
      connectionTimeout: 30000,
    },
  },
  mongodb: {
    type: "mongodb",
    name: "MongoDB",
    category: "database",
    description: "Connect to MongoDB for document-based data operations",
    icon: "\u{1F5C4}",
    configFields: dbConfigFields("MongoDB", 27017),
    defaultConfig: {
      host: "localhost",
      port: 27017,
      database: "",
      username: "",
      password: "",
      ssl: false,
      connectionPoolSize: 10,
      connectionTimeout: 30000,
    },
  },
  cassandra: {
    type: "cassandra",
    name: "Apache Cassandra",
    category: "database",
    description: "Connect to Apache Cassandra for distributed data",
    icon: "\u{1F5C4}",
    configFields: dbConfigFields("Cassandra", 9042),
    defaultConfig: {
      host: "localhost",
      port: 9042,
      database: "",
      username: "",
      password: "",
      ssl: false,
      connectionPoolSize: 10,
      connectionTimeout: 30000,
    },
  },
  neo4j: {
    type: "neo4j",
    name: "Neo4j",
    category: "database",
    description: "Connect to Neo4j graph database",
    icon: "\u{1F5C4}",
    configFields: dbConfigFields("Neo4j", 7687),
    defaultConfig: {
      host: "localhost",
      port: 7687,
      database: "neo4j",
      username: "neo4j",
      password: "",
      ssl: false,
      connectionPoolSize: 10,
      connectionTimeout: 30000,
    },
  },
  ftp: {
    type: "ftp",
    name: "FTP Server",
    category: "file-server",
    description: "Connect to FTP server for file upload and download",
    icon: "\u{1F4C2}",
    configFields: serverConfigFields("FTP", 21),
    defaultConfig: {
      host: "",
      port: 21,
      protocol: "ftp",
      username: "",
      password: "",
      rootPath: "/",
      passiveMode: true,
    },
  },
  sftp: {
    type: "sftp",
    name: "SFTP Server",
    category: "file-server",
    description: "Connect to SFTP server with SSH key authentication",
    icon: "\u{1F512}",
    configFields: [
      ...serverConfigFields("SFTP", 22),
      {
        key: "privateKey",
        label: "SSH Private Key (optional)",
        type: "textarea",
        required: false,
        placeholder: "-----BEGIN RSA PRIVATE KEY-----...",
        group: "Authentication",
      },
    ],
    defaultConfig: {
      host: "",
      port: 22,
      protocol: "sftp",
      username: "",
      password: "",
      rootPath: "/",
    },
  },
  s3: {
    type: "s3",
    name: "AWS S3 / Object Storage",
    category: "object-storage",
    description: "Connect to AWS S3, GCS, or compatible object storage",
    icon: "\u2601",
    configFields: [
      {
        key: "provider",
        label: "Provider",
        type: "select",
        required: true,
        options: [
          { label: "AWS S3", value: "aws-s3" },
          { label: "Google Cloud Storage", value: "gcs" },
          { label: "Azure Blob", value: "azure-blob" },
        ],
        defaultValue: "aws-s3",
        group: "General",
      },
      {
        key: "bucket",
        label: "Bucket Name",
        type: "text",
        required: true,
        placeholder: "my-data-bucket",
        group: "General",
      },
      {
        key: "region",
        label: "Region",
        type: "text",
        required: true,
        placeholder: "us-east-1",
        group: "General",
      },
      {
        key: "accessKey",
        label: "Access Key",
        type: "text",
        required: true,
        group: "Credentials",
      },
      {
        key: "secretKey",
        label: "Secret Key",
        type: "password",
        required: true,
        group: "Credentials",
      },
      {
        key: "endpoint",
        label: "Custom Endpoint (optional)",
        type: "text",
        required: false,
        placeholder: "https://s3.amazonaws.com",
        group: "Advanced",
      },
      {
        key: "prefix",
        label: "Path Prefix (optional)",
        type: "text",
        required: false,
        placeholder: "data/",
        group: "Advanced",
      },
    ],
    defaultConfig: {
      provider: "aws-s3",
      bucket: "",
      region: "us-east-1",
      accessKey: "",
      secretKey: "",
    },
  },
  gcs: {
    type: "gcs",
    name: "Google Cloud Storage",
    category: "object-storage",
    description: "Connect to Google Cloud Storage",
    icon: "\u2601",
    configFields: [
      {
        key: "bucket",
        label: "Bucket Name",
        type: "text",
        required: true,
        group: "General",
      },
      {
        key: "region",
        label: "Region",
        type: "text",
        required: true,
        defaultValue: "us-central1",
        group: "General",
      },
      {
        key: "accessKey",
        label: "Service Account Email",
        type: "text",
        required: true,
        group: "Credentials",
      },
      {
        key: "secretKey",
        label: "Service Account Key (JSON)",
        type: "password",
        required: true,
        group: "Credentials",
      },
    ],
    defaultConfig: {
      provider: "gcs",
      bucket: "",
      region: "us-central1",
      accessKey: "",
      secretKey: "",
    },
  },
  "azure-blob": {
    type: "azure-blob",
    name: "Azure Blob Storage",
    category: "object-storage",
    description: "Connect to Azure Blob Storage",
    icon: "\u2601",
    configFields: [
      {
        key: "bucket",
        label: "Container Name",
        type: "text",
        required: true,
        group: "General",
      },
      {
        key: "accessKey",
        label: "Storage Account Name",
        type: "text",
        required: true,
        group: "Credentials",
      },
      {
        key: "secretKey",
        label: "Storage Account Key",
        type: "password",
        required: true,
        group: "Credentials",
      },
    ],
    defaultConfig: {
      provider: "azure-blob",
      bucket: "",
      region: "",
      accessKey: "",
      secretKey: "",
    },
  },
  api: {
    type: "api",
    name: "API Endpoint",
    category: "api",
    description: "Connect to REST API endpoints for data exchange",
    icon: "\u{1F310}",
    configFields: [
      {
        key: "baseUrl",
        label: "Base URL",
        type: "text",
        required: true,
        placeholder: "https://api.example.com/v1",
        group: "General",
      },
      {
        key: "authType",
        label: "Authentication Type",
        type: "select",
        required: true,
        options: [
          { label: "None", value: "none" },
          { label: "Basic Auth", value: "basic" },
          { label: "Bearer Token", value: "bearer" },
          { label: "API Key", value: "api-key" },
          { label: "OAuth 2.0", value: "oauth2" },
        ],
        defaultValue: "none",
        group: "Authentication",
      },
      {
        key: "username",
        label: "Username / Client ID",
        type: "text",
        required: false,
        group: "Authentication",
      },
      {
        key: "password",
        label: "Password / Client Secret",
        type: "password",
        required: false,
        group: "Authentication",
      },
      {
        key: "apiKey",
        label: "API Key",
        type: "password",
        required: false,
        group: "Authentication",
      },
      {
        key: "apiKeyHeader",
        label: "API Key Header",
        type: "text",
        required: false,
        defaultValue: "X-API-Key",
        group: "Authentication",
      },
      {
        key: "bearerToken",
        label: "Bearer Token",
        type: "password",
        required: false,
        group: "Authentication",
      },
      {
        key: "timeout",
        label: "Timeout (ms)",
        type: "number",
        required: false,
        defaultValue: 30000,
        group: "Advanced",
      },
      {
        key: "retries",
        label: "Max Retries",
        type: "number",
        required: false,
        defaultValue: 3,
        group: "Advanced",
      },
    ],
    defaultConfig: {
      baseUrl: "",
      authType: "none",
      timeout: 30000,
      retries: 3,
    },
  },
  smtp: {
    type: "smtp",
    name: "SMTP Email Server",
    category: "email",
    description: "Configure SMTP server for sending email notifications and files",
    icon: "\u2709",
    configFields: [
      {
        key: "host",
        label: "SMTP Host",
        type: "text",
        required: true,
        placeholder: "smtp.gmail.com",
        group: "Server",
      },
      {
        key: "port",
        label: "Port",
        type: "number",
        required: true,
        defaultValue: 587,
        group: "Server",
      },
      {
        key: "secure",
        label: "Use TLS/SSL",
        type: "boolean",
        required: false,
        defaultValue: true,
        group: "Server",
      },
      {
        key: "username",
        label: "Username",
        type: "text",
        required: true,
        group: "Credentials",
      },
      {
        key: "password",
        label: "Password",
        type: "password",
        required: true,
        group: "Credentials",
      },
      {
        key: "fromAddress",
        label: "From Email Address",
        type: "text",
        required: true,
        placeholder: "noreply@company.com",
        group: "Sender",
      },
      {
        key: "fromName",
        label: "From Name",
        type: "text",
        required: true,
        placeholder: "FlowForge Notifications",
        group: "Sender",
      },
    ],
    defaultConfig: {
      host: "",
      port: 587,
      secure: true,
      username: "",
      password: "",
      fromAddress: "",
      fromName: "FlowForge",
    },
  },
};

function dbConfigFields(
  dbName: string,
  defaultPort: number
): ConnectionConfigField[] {
  return [
    {
      key: "host",
      label: "Host",
      type: "text",
      required: true,
      placeholder: "localhost",
      group: "Connection",
    },
    {
      key: "port",
      label: "Port",
      type: "number",
      required: true,
      defaultValue: defaultPort,
      group: "Connection",
    },
    {
      key: "database",
      label: "Database Name",
      type: "text",
      required: true,
      placeholder: `${dbName.toLowerCase()}_db`,
      group: "Connection",
    },
    {
      key: "username",
      label: "Username",
      type: "text",
      required: true,
      group: "Credentials",
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      required: true,
      group: "Credentials",
    },
    {
      key: "ssl",
      label: "Use SSL",
      type: "boolean",
      required: false,
      defaultValue: false,
      group: "Security",
    },
    {
      key: "connectionPoolSize",
      label: "Connection Pool Size",
      type: "number",
      required: false,
      defaultValue: 10,
      group: "Advanced",
    },
    {
      key: "connectionTimeout",
      label: "Connection Timeout (ms)",
      type: "number",
      required: false,
      defaultValue: 30000,
      group: "Advanced",
    },
  ];
}

function serverConfigFields(
  serverType: string,
  defaultPort: number
): ConnectionConfigField[] {
  return [
    {
      key: "host",
      label: "Host",
      type: "text",
      required: true,
      placeholder: `${serverType.toLowerCase()}.example.com`,
      group: "Connection",
    },
    {
      key: "port",
      label: "Port",
      type: "number",
      required: true,
      defaultValue: defaultPort,
      group: "Connection",
    },
    {
      key: "username",
      label: "Username",
      type: "text",
      required: true,
      group: "Credentials",
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      required: true,
      group: "Credentials",
    },
    {
      key: "rootPath",
      label: "Root Path",
      type: "text",
      required: false,
      defaultValue: "/",
      placeholder: "/data/imports",
      group: "Paths",
    },
    {
      key: "passiveMode",
      label: "Passive Mode (FTP)",
      type: "boolean",
      required: false,
      defaultValue: true,
      group: "Advanced",
    },
  ];
}
