# Active Context: FlowForge

## Current State

**Application Status**: Full NiFi-Style Enterprise Data Flow Platform

FlowForge is a comprehensive Apache NiFi-inspired data flow management platform with processor groups, multi-language script transforms, centralized connection management (databases, file servers, APIs, SMTP), engineer profiles, user authentication, company profiles, and team management.

## Recently Completed

- [x] Core type definitions for flows, processors, connections, provenance
- [x] File-based persistence layer (JSON files in data/ directory)
- [x] 40+ processors across 8 categories (source, transform, sink, database, communication, utility, multi-language script, remote operations)
- [x] File format support: JSON, CSV, Excel (.xlsx), Parquet, XML, PDF reports
- [x] Multi-language script transforms: SQL, Python, Ruby, Scala, Java, R
- [x] Remote file operations: FTP upload/download, SFTP upload/download, S3 read/write
- [x] API call and API response processors
- [x] Flow execution engine with topological sorting
- [x] REST API for all resources
- [x] Visual drag-and-drop flow designer canvas
- [x] 10 pre-built workflow templates with full documentation
- [x] Sample data generator and data browser
- [x] User authentication system with scrypt password hashing and session tokens
- [x] Company profile creation and management
- [x] Team member invitation with role-based access (admin, engineer, viewer)
- [x] Engineer profile page (title, department, specializations, bio, preferred languages, experience)
- [x] NiFi-style Processor Groups with nested hierarchy
- [x] Pipelines within processor groups (each pipeline = a flow)
- [x] Centralized Connections Store for all connection types
- [x] Database connections: PostgreSQL, MySQL, MariaDB, MSSQL, Oracle, MongoDB, Cassandra, Neo4j
- [x] File server connections: FTP, SFTP
- [x] Object storage connections: AWS S3, GCS, Azure Blob
- [x] API endpoint connections with auth types (none, basic, bearer, API key, OAuth 2.0)
- [x] SMTP email server connections
- [x] Connection testing functionality
- [x] Consistent auth-aware navigation across all pages

## Current Structure

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page with setup, login/signup navigation |
| `src/app/signup/page.tsx` | User registration |
| `src/app/login/page.tsx` | User login |
| `src/app/company-setup/page.tsx` | Company profile creation |
| `src/app/dashboard/page.tsx` | Authenticated dashboard |
| `src/app/profile/page.tsx` | Engineer profile editor |
| `src/app/team/page.tsx` | Team management |
| `src/app/processor-groups/page.tsx` | Processor groups listing |
| `src/app/processor-groups/[id]/page.tsx` | Processor group detail with pipelines |
| `src/app/connections/page.tsx` | Connections management (DB, FTP, S3, API, SMTP) |
| `src/app/flows/page.tsx` | Flow listing (legacy) |
| `src/app/flows/[id]/page.tsx` | Visual flow editor |
| `src/app/workflows/page.tsx` | Workflow library |
| `src/app/databases/page.tsx` | Database connection manager (legacy) |
| `src/app/data/page.tsx` | Data file browser |
| `src/app/api/auth/` | Auth API (signup, login, logout, session) |
| `src/app/api/companies/` | Company API (CRUD, invite, members) |
| `src/app/api/profile/` | Engineer profile API |
| `src/app/api/processor-groups/` | Processor groups CRUD API |
| `src/app/api/pipelines/` | Pipelines CRUD API |
| `src/app/api/connections/` | Connections CRUD API |
| `src/app/api/connections/types/` | Connection type definitions API |
| `src/app/api/connections/test/` | Connection testing API |
| `src/lib/types/` | TypeScript definitions |
| `src/lib/store/auth-store.ts` | Auth store (users, sessions, companies) |
| `src/lib/store/processor-group-store.ts` | Processor groups & pipelines store |
| `src/lib/store/connections-store.ts` | Connections store with 15 type definitions |
| `src/lib/store/index.ts` | Flows store (legacy) |
| `src/lib/processors/definitions.ts` | 40+ processor definitions |
| `src/lib/processors/executors.ts` | 40+ processor executors |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/signup` | User registration |
| `/login` | User login |
| `/company-setup` | Company profile creation |
| `/dashboard` | Authenticated dashboard |
| `/profile` | Engineer profile management |
| `/team` | Team management & engineer invitations |
| `/processor-groups` | Processor groups listing |
| `/processor-groups/[id]` | Processor group detail with pipelines |
| `/connections` | Connections management (all types) |
| `/flows` | Flow listing |
| `/flows/[id]` | Visual flow editor |
| `/workflows` | Workflow library |
| `/databases` | Database manager (legacy) |
| `/data` | Data file browser |

## Processor Types (40+)

### Sources (7)
file-input, json-input, csv-input, excel-input, parquet-input, xml-input, pdf-input

### Sinks (7)
file-output, json-output, csv-output, excel-output, parquet-output, xml-output, pdf-output

### Transforms (8)
json-transform, csv-transform, filter, merge, aggregate, sort, deduplicate, lookup

### Multi-Language Scripts (6)
sql-transform, python-script, ruby-script, scala-script, java-script, r-script

### Database (5)
db-query, db-create-table, db-insert, db-upsert, db-delete

### Communication (2 + 4)
email-send, webhook, api-call, api-response

### Remote File Operations (6)
ftp-upload, ftp-download, sftp-upload, sftp-download, s3-read, s3-write

### Utility (3)
data-generator, log, script

## Connection Types (15)

| Type | Category | Description |
|------|----------|-------------|
| postgresql | database | PostgreSQL database |
| mysql | database | MySQL database |
| mariadb | database | MariaDB database |
| mssql | database | Microsoft SQL Server |
| oracle | database | Oracle Database |
| mongodb | database | MongoDB |
| cassandra | database | Apache Cassandra |
| neo4j | database | Neo4j graph database |
| ftp | file-server | FTP server |
| sftp | file-server | SFTP server |
| s3 | object-storage | AWS S3 / compatible |
| gcs | object-storage | Google Cloud Storage |
| azure-blob | object-storage | Azure Blob Storage |
| api | api | REST API endpoint |
| smtp | email | SMTP email server |

## Data Directory Structure

```
data/
├── auth/
│   ├── users/         (user profiles with password hashes)
│   ├── companies/     (company profiles)
│   └── sessions/      (session tokens)
├── processor-groups/
│   ├── groups/        (processor group definitions)
│   └── pipelines/     (pipeline definitions within groups)
├── connections/       (database, file server, API, SMTP connections)
├── samples/           (sample data files)
├── outputs/           (pipeline output files)
├── databases/         (legacy database connections)
├── workflows/         (legacy flow definitions)
└── provenance/        (execution history)
```

## Session History

| Date | Changes |
|------|---------|
| Initial | FlowForge MVP: visual editor, 6 processors, execution engine, provenance tracking |
| Update | Enterprise expansion: 30+ processors, 14 DB adapters, 10 workflow templates, file persistence |
| Update | User auth: signup/login, company profiles, team management with role-based access |
| Update | NiFi-style processor groups, pipelines, multi-language transforms (SQL/Python/Ruby/Scala/Java/R), centralized connections (DB/FTP/S3/API/SMTP), engineer profiles |

## Dependencies

| Package | Purpose |
|---------|---------|
| uuid | Unique ID generation |
| papaparse | CSV parsing (available) |
| next | Framework |
| react/react-dom | UI |
| crypto (built-in) | Password hashing (scrypt) and session token generation |
