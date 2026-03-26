# Active Context: FlowForge

## Current State

**Application Status**: ✅ Full Enterprise Data Flow Platform

FlowForge is a comprehensive Apache NiFi-inspired data flow management platform with file processing across all major formats, 14 database adapters (including cloud), 10 pre-built workflow templates, file-based persistence, and full UI for browsing data and managing connections.

## Recently Completed

- [x] Core type definitions for flows, processors, connections, provenance
- [x] File-based persistence layer (JSON files in data/ directory)
- [x] 30+ processors across 6 categories (source, transform, sink, database, communication, utility)
- [x] File format support: JSON, CSV, Excel (.xlsx), Parquet, XML, PDF reports
- [x] 14 database adapters: MySQL, PostgreSQL, MSSQL, Oracle, MongoDB, Cassandra, Neo4j, GCP Cloud SQL, GCP BigQuery, AWS RDS, AWS DynamoDB, AWS Redshift, Azure SQL, Azure Cosmos DB
- [x] Database processors: Query, Create Table, Insert, Upsert, Delete
- [x] Email send and webhook processors
- [x] Flow execution engine with topological sorting
- [x] REST API for all resources
- [x] Visual drag-and-drop flow designer canvas
- [x] 10 pre-built workflow templates with full documentation
- [x] Sample data generator (20 customers, 20 products, 50 orders, 15 employees, 100 transactions, 20 inventory items)
- [x] Data browser page (file tree, JSON/CSV viewer)
- [x] Database connections page (connection list, table browser)
- [x] Workflow library page with documentation viewer
- [x] One-click setup endpoint (creates all sample data, DB connections, workflow templates)

## Current Structure

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page with setup and navigation |
| `src/app/flows/page.tsx` | Flow listing and creation |
| `src/app/flows/[id]/page.tsx` | Visual flow editor |
| `src/app/workflows/page.tsx` | Workflow library with documentation |
| `src/app/databases/page.tsx` | Database connection manager & table browser |
| `src/app/data/page.tsx` | Data file browser |
| `src/app/api/flows/` | Flow CRUD API |
| `src/app/api/processors/` | Processor definitions API |
| `src/app/api/databases/` | Database connections API |
| `src/app/api/files/browse/` | File browser API |
| `src/app/api/samples/generate/` | Sample data generator API |
| `src/app/api/setup/` | One-click setup API |
| `src/components/flow-editor/` | Canvas, palette, properties, toolbar, provenance |
| `src/lib/types/` | TypeScript definitions |
| `src/lib/store/` | File-backed data store |
| `src/lib/engine/` | Flow execution engine |
| `src/lib/processors/` | 30+ processor definitions & executors |
| `src/lib/data/` | Sample data, file store, database manager |
| `src/lib/workflows/` | 10 workflow templates |
| `data/` | Persisted data directory (samples, outputs, databases, workflows, provenance) |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with setup button and navigation |
| `/flows` | Flow listing and creation |
| `/flows/[id]` | Visual flow editor |
| `/workflows` | Workflow library with documentation |
| `/databases` | Database connection manager and table browser |
| `/data` | Data file browser |

## Data Directory Structure

```
data/
├── samples/
│   ├── json/        (customers.json, products.json, orders.json, employees.json, transactions.json, inventory.json, .xml files)
│   ├── csv/         (customers.csv, products.csv, orders.csv, employees.csv, transactions.csv)
│   ├── excel/       (sales_report.xlsx.json, hr_data.xlsx.json)
│   ├── parquet/     (customers.parquet.json, orders.parquet.json, transactions.parquet.json)
│   └── pdf/         (sales_report_q4.pdf.txt, hr_report_2024.pdf.txt)
├── outputs/
│   ├── json/        (workflow output files)
│   ├── csv/         (workflow output files)
│   ├── excel/       (workflow output files)
│   ├── parquet/     (workflow output files)
│   ├── xml/         (workflow output files)
│   └── pdf/         (workflow output files)
├── databases/
│   ├── connections/ (database connection configs)
│   └── tables/      (database table data)
├── workflows/
│   └── flows/       (persisted flow definitions)
└── provenance/
    └── executions/  (execution history and events)
```

## Session History

| Date | Changes |
|------|---------|
| Initial | FlowForge MVP: visual editor, 6 processors, execution engine, provenance tracking |
| Update | Enterprise expansion: 30+ processors, 14 DB adapters, 10 workflow templates, file persistence, data browser, database manager |

## Dependencies

| Package | Purpose |
|---------|---------|
| uuid | Unique ID generation |
| papaparse | CSV parsing (available) |
| next | Framework |
| react/react-dom | UI |
