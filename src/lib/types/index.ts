export type ProcessorType =
  // File sources
  | "file-input"
  | "json-input"
  | "csv-input"
  | "excel-input"
  | "parquet-input"
  | "xml-input"
  | "pdf-input"
  // File sinks
  | "file-output"
  | "json-output"
  | "csv-output"
  | "excel-output"
  | "parquet-output"
  | "xml-output"
  | "pdf-output"
  // Transform
  | "json-transform"
  | "csv-transform"
  | "filter"
  | "merge"
  | "aggregate"
  | "sort"
  | "deduplicate"
  | "lookup"
  // Database sources/sinks
  | "db-query"
  | "db-create-table"
  | "db-insert"
  | "db-upsert"
  | "db-delete"
  // Communication
  | "email-send"
  | "webhook"
  // Utility
  | "data-generator"
  | "log"
  | "script"
  // Multi-language script transforms
  | "sql-transform"
  | "python-script"
  | "ruby-script"
  | "scala-script"
  | "java-script"
  | "r-script"
  // Remote operations
  | "ftp-upload"
  | "ftp-download"
  | "sftp-upload"
  | "sftp-download"
  | "s3-read"
  | "s3-write"
  | "api-call"
  | "api-response";

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
  category: "source" | "transform" | "sink" | "database" | "communication" | "utility";
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
  tags?: string[];
  category?: string;
  documentation?: string;
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
  tags?: string[];
  category?: string;
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

export interface WorkflowDocumentation {
  flowId: string;
  title: string;
  description: string;
  scenarios: WorkflowScenario[];
  dataFlowDiagram: string;
  createdAt: string;
}

export interface WorkflowScenario {
  name: string;
  description: string;
  inputSource: string;
  outputDestination: string;
  transformations: string[];
  databases: string[];
}

// Auth types
export type UserRole = "admin" | "engineer" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  companyId: string | null;
  role: UserRole;
  title: string;
  department: string;
  specializations: string[];
  bio: string;
  phone: string;
  location: string;
  yearsExperience: number;
  preferredLanguages: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  companyId: string | null;
  role: UserRole;
  title: string;
  department: string;
  specializations: string[];
  bio: string;
  phone: string;
  location: string;
  yearsExperience: number;
  preferredLanguages: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  size: string;
  website: string;
  logoUrl: string;
  ownerId: string;
  settings: CompanySettings;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  defaultDataFormats: string[];
  maxFlowRetentionDays: number;
  enableProvenance: boolean;
  allowedProcessorTypes: string[];
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: PublicUser;
  company: Company | null;
  token: string;
}

export interface InviteEngineerRequest {
  email: string;
  name: string;
  role: UserRole;
}

// Engineer Profile
export interface EngineerProfile {
  id: string;
  userId: string;
  companyId: string;
  title: string;
  department: string;
  specializations: string[];
  bio: string;
  phone: string;
  location: string;
  yearsExperience: number;
  certifications: string[];
  preferredLanguages: string[];
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicEngineerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  specializations: string[];
  bio: string;
  phone: string;
  location: string;
  yearsExperience: number;
  certifications: string[];
  preferredLanguages: string[];
  avatarUrl: string;
}

// Processor Groups (NiFi-style)
export interface ProcessorGroup {
  id: string;
  name: string;
  description: string;
  companyId: string;
  parentGroupId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "running" | "stopped";
  tags: string[];
  version: number;
}

export interface ProcessorGroupListItem {
  id: string;
  name: string;
  description: string;
  parentGroupId: string | null;
  pipelineCount: number;
  childGroupCount: number;
  status: ProcessorGroup["status"];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// Pipeline (a flow inside a processor group)
export interface Pipeline {
  id: string;
  name: string;
  description: string;
  groupId: string;
  companyId: string;
  processors: ProcessorNode[];
  connections: Connection[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  status: "draft" | "running" | "completed" | "failed";
  schedule?: PipelineSchedule;
  tags: string[];
}

export interface PipelineSchedule {
  enabled: boolean;
  cronExpression: string;
  timezone: string;
  lastRun?: string;
  nextRun?: string;
}

export interface PipelineListItem {
  id: string;
  name: string;
  description: string;
  groupId: string;
  status: Pipeline["status"];
  processorCount: number;
  connectionCount: number;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  tags: string[];
}

// Connection Types
export type ConnectionType =
  | "postgresql"
  | "mysql"
  | "mariadb"
  | "mssql"
  | "oracle"
  | "mongodb"
  | "cassandra"
  | "neo4j"
  | "ftp"
  | "sftp"
  | "s3"
  | "gcs"
  | "azure-blob"
  | "api"
  | "smtp";

export type ConnectionCategory = "database" | "file-server" | "object-storage" | "api" | "email";

export interface ConnectionConfig {
  [key: string]: string | number | boolean;
}

export interface DataConnection {
  id: string;
  name: string;
  description: string;
  type: ConnectionType;
  category: ConnectionCategory;
  companyId: string;
  createdBy: string;
  config: ConnectionConfig;
  status: "active" | "inactive" | "error" | "testing";
  lastTestedAt?: string;
  lastTestResult?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// Database Connection Config
export interface DatabaseConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionPoolSize: number;
  connectionTimeout: number;
}

// Remote Server Connection Config
export interface RemoteServerConfig {
  host: string;
  port: number;
  protocol: "ftp" | "sftp" | "ftps";
  username: string;
  password: string;
  rootPath: string;
  privateKey?: string;
  passiveMode?: boolean;
}

// S3/Object Storage Config
export interface ObjectStorageConfig {
  provider: "aws-s3" | "gcs" | "azure-blob";
  bucket: string;
  region: string;
  accessKey: string;
  secretKey: string;
  endpoint?: string;
  prefix?: string;
}

// API Endpoint Config
export interface ApiEndpointConfig {
  baseUrl: string;
  authType: "none" | "basic" | "bearer" | "api-key" | "oauth2";
  username?: string;
  password?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  bearerToken?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  oauthTokenUrl?: string;
  defaultHeaders: Record<string, string>;
  timeout: number;
  retries: number;
}

// SMTP Config
export interface SmtpConnectionConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromAddress: string;
  fromName: string;
}

// Script language types
export type ScriptLanguage = "sql" | "python" | "ruby" | "scala" | "java" | "r";

export interface ScriptTransformConfig {
  language: ScriptLanguage;
  code: string;
  inputVariable: string;
  outputVariable: string;
  timeout: number;
  connectionId?: string;
}

// Connection config schema definitions
export interface ConnectionConfigField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "textarea" | "password";
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  group?: string;
}

export interface ConnectionTypeDefinition {
  type: ConnectionType;
  name: string;
  category: ConnectionCategory;
  description: string;
  icon: string;
  configFields: ConnectionConfigField[];
  defaultConfig: ConnectionConfig;
}

// OAuth types
export type OAuthProvider = "github" | "google" | "apple" | "facebook" | "twitter";

export interface OAuthAccount {
  id: string;
  userId: string;
  provider: OAuthProvider;
  providerAccountId: string;
  providerEmail: string;
  providerName: string;
  providerAvatarUrl: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OAuthProviderConfig {
  provider: OAuthProvider;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  redirectUri: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}
