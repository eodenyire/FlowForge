# Data Persistence

FlowForge uses file-based persistence to store all data as JSON files on disk. This document explains the storage layout, data formats, and how to manage persisted data.

## Storage Strategy

All data is stored under the `data/` directory at the project root. The system uses:

- **JSON files** for all structured data (flows, connections, table data, execution records)
- **Text files** for sample data in various formats (CSV, XML, PDF reports)
- **In-memory caching** for fast access with write-through to disk

### Why File-Based?

1. **Zero setup** — No database server required
2. **Transparent** — Data is inspectable as plain JSON
3. **Portable** — Copy the `data/` directory to move everything
4. **Version-controllable** — JSON files can be diffed and tracked

## Directory Structure

```
data/
├── samples/                        # Generated sample data files
│   ├── json/                       # JSON and XML data files
│   │   ├── customers.json          # 20 customer records
│   │   ├── products.json           # 20 product records
│   │   ├── orders.json             # 50 order records
│   │   ├── employees.json          # 15 employee records
│   │   ├── transactions.json       # 100 transaction records
│   │   ├── inventory.json          # 20 inventory records
│   │   ├── customers.xml           # XML representation
│   │   └── products.xml            # XML representation
│   ├── csv/                        # CSV data files
│   │   ├── customers.csv
│   │   ├── products.csv
│   │   ├── orders.csv
│   │   ├── employees.csv
│   │   └── transactions.csv
│   ├── excel/                      # Excel workbook JSON files
│   │   ├── sales_report.xlsx.json  # Multi-sheet workbook
│   │   └── hr_data.xlsx.json       # Multi-sheet workbook
│   ├── parquet/                    # Parquet JSON files
│   │   ├── customers.parquet.json
│   │   ├── orders.parquet.json
│   │   └── transactions.parquet.json
│   └── pdf/                        # PDF text reports
│       ├── sales_report_q4.pdf.txt
│       └── hr_report_2024.pdf.txt
├── outputs/                        # Workflow output files
│   ├── json/                       # JSON outputs
│   ├── csv/                        # CSV outputs
│   ├── excel/                      # Excel workbook JSONs
│   ├── parquet/                    # Parquet JSONs
│   ├── xml/                        # XML outputs
│   ├── pdf/                        # PDF report texts
│   └── emails/                     # Email queue logs
├── databases/                      # Database simulation layer
│   ├── connections/                # Connection configurations
│   │   ├── {uuid}.json             # One file per connection
│   │   └── ...
│   └── tables/                     # Table data
│       ├── {connection-uuid}/      # Per-connection directory
│       │   ├── {table-name}/       # Per-table directory
│       │   │   ├── schema.json     # Table schema
│       │   │   └── data.json       # Row data array
│       │   └── ...
│       └── ...
├── workflows/                      # Persisted workflow definitions
│   └── flows/                      # Flow definitions
│       ├── {uuid}.json             # One file per flow
│       └── ...
└── provenance/                     # Execution history
    └── executions/                 # Execution records
        ├── {uuid}.json             # One file per execution
        └── ...
```

## Data Formats

### Flow Definition (`workflows/flows/{id}.json`)

```json
{
  "id": "uuid",
  "name": "JSON to Multi-Format Export",
  "description": "Read customer JSON data...",
  "processors": [
    {
      "id": "uuid",
      "type": "json-input",
      "label": "Read Customers JSON",
      "config": { "filePath": "data/samples/json/customers.json" },
      "position": { "x": 50, "y": 50 },
      "status": "idle"
    }
  ],
  "connections": [
    {
      "id": "uuid",
      "sourceId": "processor-uuid",
      "sourcePort": "out",
      "targetId": "target-uuid",
      "targetPort": "in"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "status": "draft",
  "tags": ["export", "json"],
  "category": "File Export",
  "documentation": "## Workflow: JSON to Multi-Format Export\n..."
}
```

### Database Connection (`databases/connections/{id}.json`)

```json
{
  "id": "uuid",
  "name": "MySQL Production",
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "ecommerce",
  "username": "",
  "password": "",
  "ssl": false,
  "status": "connected",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "metadata": {}
}
```

### Table Schema (`databases/tables/{db-id}/{table}/schema.json`)

```json
{
  "name": "customers",
  "columns": [
    { "name": "id", "type": "string", "nullable": false, "primaryKey": true },
    { "name": "name", "type": "string", "nullable": true, "primaryKey": false },
    { "name": "email", "type": "string", "nullable": true, "primaryKey": false }
  ],
  "rowCount": 20
}
```

### Table Data (`databases/tables/{db-id}/{table}/data.json`)

```json
[
  { "id": "C001", "name": "Alice Johnson", "email": "alice@example.com", ... },
  { "id": "C002", "name": "Bob Smith", "email": "bob@example.com", ... }
]
```

### Execution Record (`provenance/executions/{id}.json`)

```json
{
  "id": "uuid",
  "flowId": "flow-uuid",
  "startedAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:00:01.000Z",
  "status": "completed",
  "events": [
    {
      "id": "uuid",
      "flowId": "flow-uuid",
      "processorId": "proc-uuid",
      "processorType": "json-input",
      "eventType": "start",
      "timestamp": "2024-01-01T00:00:00.100Z",
      "inputRecords": 0
    },
    {
      "id": "uuid",
      "flowId": "flow-uuid",
      "processorId": "proc-uuid",
      "processorType": "json-input",
      "eventType": "success",
      "timestamp": "2024-01-01T00:00:00.200Z",
      "inputRecords": 0,
      "outputRecords": 20
    }
  ]
}
```

## In-Memory Cache

The store (`src/lib/store/`) maintains in-memory caches for fast access:

- `flowsCache: Map<string, FlowDefinition>` — All flow definitions
- `executionsCache: Map<string, FlowExecution>` — All execution records

### Lifecycle

1. **First access**: All JSON files are loaded from disk into the in-memory cache
2. **Read operations**: Return directly from cache (no disk I/O)
3. **Write operations**: Update cache AND write to disk (write-through)
4. **Cache invalidation**: Cache is rebuilt on server restart

## Managing Data

### Reset All Data

```bash
rm -rf data/
# Then click "Quick Setup" in the UI or call POST /api/setup
```

### Reset Only Workflows

```bash
rm -rf data/workflows/
rm -rf data/provenance/
```

### Reset Only Database Data

```bash
rm -rf data/databases/
```

### Backup Data

```bash
cp -r data/ backup/data-$(date +%Y%m%d)/
```

### View Data in Data Browser

Navigate to `/data` in the application to browse all persisted files with a tree view and content viewer.

## Browsing Persisted Data

### Via UI

- **Data Browser** (`/data`): Navigate all files in the `data/` directory
- **Database Manager** (`/databases`): View connections and table data
- **Workflow Library** (`/workflows`): View flow definitions and documentation

### Via File System

All data is plain JSON and can be inspected with any text editor or JSON viewer.

### Via API

```
GET /api/files/browse?path=samples/json        # List directory
GET /api/files/browse?path=samples/json/customers.json&read=true  # Read file
GET /api/databases/{id}/tables/{table}          # Query table data
```
