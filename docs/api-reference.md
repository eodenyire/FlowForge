# API Reference

Complete REST API documentation for all FlowForge endpoints.

## Flows

### List Flows

```
GET /api/flows
```

Returns all flows as a list.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "My Flow",
    "description": "Description",
    "status": "draft",
    "processorCount": 4,
    "connectionCount": 3,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastExecutedAt": "2024-01-01T00:00:00.000Z",
    "tags": ["tag1"],
    "category": "Category"
  }
]
```

### Create Flow

```
POST /api/flows
Content-Type: application/json
```

**Body:**
```json
{
  "name": "My Flow",
  "description": "Optional description",
  "processors": [],
  "connections": [],
  "tags": ["tag1"],
  "category": "Category",
  "documentation": "Markdown documentation"
}
```

**Response:** `201` with the created `FlowDefinition`

### Get Flow

```
GET /api/flows/{id}
```

**Response:** Full `FlowDefinition` including all processors and connections

### Update Flow

```
PUT /api/flows/{id}
Content-Type: application/json
```

**Body:** Any partial `FlowDefinition` fields to update

**Response:** Updated `FlowDefinition`

### Delete Flow

```
DELETE /api/flows/{id}
```

**Response:** `{ "success": true }`

### Execute Flow

```
POST /api/flows/{id}/execute
```

Executes the flow with topological sorting.

**Response:** `FlowExecution` with provenance events
```json
{
  "id": "uuid",
  "flowId": "uuid",
  "startedAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:00:01.000Z",
  "status": "completed",
  "events": [
    {
      "id": "uuid",
      "flowId": "uuid",
      "processorId": "uuid",
      "processorType": "json-input",
      "eventType": "success",
      "timestamp": "2024-01-01T00:00:00.500Z",
      "inputRecords": 0,
      "outputRecords": 20
    }
  ]
}
```

**Error Response:** `400` if flow has no processors, `500` if execution fails

### Get Provenance

```
GET /api/flows/{id}/provenance
```

**Response:**
```json
{
  "events": [ProvenanceEvent, ...],
  "executions": [FlowExecution, ...]
}
```

---

## Processors

### List Processor Definitions

```
GET /api/processors
```

**Response:** Array of all `ProcessorDefinition` objects with type, name, description, category, configSchema, inputs, and outputs.

---

## Database Connections

### List Connections

```
GET /api/databases
```

**Response:** Array of `DatabaseConnection` objects

### Create Connection

```
POST /api/databases
Content-Type: application/json
```

**Body:**
```json
{
  "name": "MySQL Production",
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "ecommerce",
  "username": "admin",
  "password": "secret",
  "ssl": true,
  "metadata": {}
}
```

**Response:** `201` with created `DatabaseConnection`

### Get Connection

```
GET /api/databases/{id}
```

**Response:** `DatabaseConnection` with `tables: string[]`

### Update Connection

```
PUT /api/databases/{id}
Content-Type: application/json
```

**Response:** Updated `DatabaseConnection`

### Delete Connection

```
DELETE /api/databases/{id}
```

**Response:** `{ "success": true }`

---

## Database Tables

### List Tables

```
GET /api/databases/{id}/tables
```

**Response:** Array of `TableSchema` objects

### Create Table

```
POST /api/databases/{id}/tables
Content-Type: application/json
```

**Body:**
```json
{
  "name": "customers",
  "columns": [
    { "name": "id", "type": "string", "nullable": false, "primaryKey": true },
    { "name": "name", "type": "string", "nullable": true, "primaryKey": false }
  ]
}
```

**Response:** `201` with created `TableSchema`

### Query Table

```
GET /api/databases/{id}/tables/{table}?limit=100&offset=0
```

**Response:**
```json
{
  "schema": { "name": "customers", "columns": [...], "rowCount": 20 },
  "rows": [{ "id": "C001", "name": "Alice", ... }, ...],
  "count": 20
}
```

### Insert Rows

```
POST /api/databases/{id}/tables/{table}
Content-Type: application/json
```

**Body:**
```json
[
  { "id": "C021", "name": "New Customer", ... },
  { "id": "C022", "name": "Another Customer", ... }
]
```

**Response:** `{ "inserted": 2 }`

---

## File Browser

### Browse Directory

```
GET /api/files/browse?path=samples/json
```

**Response:**
```json
{
  "path": "samples/json",
  "directories": [],
  "files": ["customers.json", "products.json", ...]
}
```

### Read File

```
GET /api/files/browse?path=samples/json/customers.json&read=true
```

**Response:**
```json
{
  "path": "samples/json/customers.json",
  "content": [...],
  "type": "json"
}
```

For text files:
```json
{
  "path": "samples/csv/customers.csv",
  "content": "id,name,...\nC001,Alice,...",
  "type": "text"
}
```

---

## Setup

### One-Click Setup

```
POST /api/setup
```

Creates all sample data, database connections, and workflow templates.

**Response:**
```json
{
  "message": "Environment setup complete",
  "sampleFiles": 18,
  "databases": 14,
  "workflows": 10
}
```

### Generate Sample Files Only

```
POST /api/samples/generate
```

**Response:**
```json
{
  "message": "Sample files generated",
  "files": ["samples/json/customers.json", ...]
}
```
