# Architecture Documentation

## System Overview

FlowForge follows a client-server architecture built on Next.js 16 with the App Router pattern. The system separates concerns into clear layers:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                       │
│  Home │ Workflows │ Flow Editor │ Databases │ Data Browser│
├─────────────────────────────────────────────────────────┤
│                   API Layer (Next.js)                     │
│  /api/flows │ /api/databases │ /api/files │ /api/setup   │
├─────────────────────────────────────────────────────────┤
│                  Engine Layer (TypeScript)                 │
│  Flow Engine │ Processors │ Store │ Database Manager      │
├─────────────────────────────────────────────────────────┤
│               Persistence Layer (File System)             │
│  data/samples │ data/outputs │ data/databases │ data/workflows│
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Flow Execution Engine (`src/lib/engine/`)

The engine orchestrates flow execution using topological sorting:

1. **Graph Construction**: Builds an adjacency list from processor connections
2. **Topological Sort**: Orders processors using Kahn's algorithm (BFS-based)
3. **Cycle Detection**: Throws an error if the graph contains cycles
4. **Sequential Execution**: Runs each processor in sorted order
5. **Data Propagation**: Passes output from each processor as input to downstream processors
6. **Provenance Logging**: Records start/success/error events for each processor

```
Flow Definition → Build DAG → Topological Sort → Execute in Order → Log Provenance
```

### 2. Processor System (`src/lib/processors/`)

Processors follow a definition + executor pattern:

- **Definitions** (`definitions.ts`): Describe the processor's UI schema (name, description, config fields, input/output ports, category)
- **Executors** (`executors.ts`): Contain the runtime logic that transforms input data to output data

Each processor receives a `ProcessorContext` and returns a `FlowOutputData`:

```typescript
interface ProcessorContext {
  flowId: string;
  processorId: string;
  config: ProcessorConfig;        // User-configured values
  inputData: FlowInputData | null; // Records from upstream processors
}

interface FlowOutputData {
  records: Record<string, unknown>[];  // Output records
  metadata: Record<string, string | number | boolean>; // Execution metadata
}
```

### 3. Data Store (`src/lib/store/`)

The store provides file-backed persistence with in-memory caching:

- On first access, loads all persisted data from disk into memory
- All mutations write through to both the in-memory cache and disk files
- Uses JSON files for serialization
- Organizes data into directories: `workflows/flows/` and `provenance/executions/`

### 4. Database Manager (`src/lib/data/database-manager.ts`)

Provides a unified interface for database operations:

- **Connection Management**: CRUD operations for database connections stored as JSON files
- **Table Operations**: Create tables, insert rows, query rows — all persisted as JSON files
- **Schema Management**: Track column definitions and row counts

Database data is stored under `data/databases/`:
```
data/databases/
├── connections/
│   ├── {uuid}.json          # Connection config
├── tables/
│   ├── {connectionId}/
│   │   ├── {tableName}/
│   │   │   ├── schema.json  # Table schema
│   │   │   └── data.json    # Row data array
```

### 5. File Store (`src/lib/data/file-store.ts`)

Low-level file I/O abstraction:

- `writeJsonFile()`, `readJsonFile()` — JSON serialization
- `writeTextFile()`, `readTextFile()` — Text file operations
- `listFiles()`, `listDirs()` — Directory listing
- All paths are relative to the `data/` directory

## Data Flow Patterns

### Source → Transform → Sink

The most common pattern. A source processor generates records, transforms modify them, and a sink writes the result.

```
[JSON Input] → [Filter] → [Sort] → [CSV Output]
```

### Fan-Out (One-to-Many)

A single processor's output feeds multiple downstream processors.

```
[CSV Input] → [Transform] → [JSON Output]
                    ↓
              [Excel Output]
                    ↓
              [DB Insert]
```

### Fan-In (Many-to-One)

Multiple processors feed into a single downstream processor via the Merge processor.

```
[MySQL Query] → [Merge] → [Aggregate] → [CSV Output]
[MongoDB Query] →
```

### Database Read → Process → Write

Query a database, process the data, and write results to another database.

```
[DB Query: MySQL] → [Filter] → [Transform] → [DB Insert: PostgreSQL]
```

## Code Organization

### Types (`src/lib/types/`)

All TypeScript interfaces and types in a single file:

- `ProcessorType` — Union type of all 30+ processor type strings
- `ProcessorDefinition` — UI schema for a processor (config fields, ports)
- `ProcessorNode` — A processor instance in a flow (with position, config, status)
- `FlowDefinition` — Complete flow with processors, connections, metadata
- `Connection` — Link between two processor ports
- `ProvenanceEvent` — Single execution event record
- `FlowExecution` — Complete execution record with events
- `FlowInputData` / `FlowOutputData` — Data passed between processors

### API Routes (`src/app/api/`)

Follow Next.js App Router conventions:

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/flows` | GET, POST | List flows, create flow |
| `/api/flows/[id]` | GET, PUT, DELETE | Get, update, delete flow |
| `/api/flows/[id]/execute` | POST | Execute flow |
| `/api/flows/[id]/provenance` | GET | Get provenance data |
| `/api/processors` | GET | List processor definitions |
| `/api/databases` | GET, POST | List/create database connections |
| `/api/databases/[id]` | GET, PUT, DELETE | Get, update, delete connection |
| `/api/databases/[id]/tables` | GET, POST | List/create tables |
| `/api/databases/[id]/tables/[table]` | GET, POST | Query/insert rows |
| `/api/files/browse` | GET | Browse file tree |
| `/api/samples/generate` | POST | Generate sample files |
| `/api/setup` | POST | One-click full setup |

### UI Components (`src/components/flow-editor/`)

| Component | Purpose |
|-----------|---------|
| `FlowEditor` | Main orchestrator — manages state, API calls, coordinates child components |
| `FlowCanvas` | SVG-based canvas with draggable processor nodes and connection paths |
| `ProcessorPalette` | Sidebar listing available processors by category |
| `PropertiesPanel` | Configuration panel for selected processor |
| `FlowToolbar` | Top bar with execute, save, rename controls |
| `ProvenanceLog` | Collapsible panel showing execution events |

## Design Decisions

### Why File-Based Persistence?

- **Simplicity**: No database setup required — works immediately
- **Transparency**: Data is inspectable as plain JSON files
- **Portability**: The entire data directory can be copied/moved/backed up
- **Development**: Easy to reset (`rm -rf data/`) and regenerate

### Why In-Memory Execution?

- **Speed**: No network latency for data operations
- **Simplicity**: No connection pooling, transaction management, or query optimization needed
- **MVP Focus**: Gets the core workflow working without infrastructure dependencies

### Why JSON for All Formats?

The system uses JSON as the internal interchange format. Non-JSON formats (Excel, Parquet, XML, PDF) are represented as structured JSON:

- **Excel**: `{ format: "xlsx", sheets: [{ name, headers, rows }] }`
- **Parquet**: `{ format: "parquet", encoding: "snappy", columns, data }`
- **XML**: Parsed to/from records using regex-based extraction
- **PDF**: Stored as text content in a single record

This allows all processors to work with a uniform `Record<string, unknown>[]` data model.
