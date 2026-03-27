# FlowForge — Visual Data Flow Orchestration Platform

An Apache NiFi-inspired visual data flow management platform built with Next.js 16, TypeScript, and Tailwind CSS. Process data across 6 file formats, 14 database types (including major cloud providers), with 30+ modular processors and 10 pre-built workflow templates.

---

## Table of Contents

- [Quick Start](#quick-start)
- [What Is FlowForge?](#what-is-flowforge)
- [Features at a Glance](#features-at-a-glance)
- [Application Pages](#application-pages)
- [How It Works](#how-it-works)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Development](#development)

---

## Quick Start

```bash
# Install dependencies
bun install

# Start the development server
bun dev

# Open http://localhost:3000
```

1. Open the home page and click **"Quick Setup"** to generate sample data, database connections, and workflow templates in one click.
2. Navigate to **Workflow Library** (`/workflows`) to explore the 10 pre-built workflows.
3. Open any workflow in the **Visual Editor** (`/flows/[id]`) to see the data pipeline.
4. Click **"Execute"** in the toolbar to run the workflow and see provenance logs.
5. Browse generated output files in the **Data Browser** (`/data`).

---

## What Is FlowForge?

FlowForge is a web-based data flow orchestration tool that lets you:

- **Design data pipelines visually** using a drag-and-drop canvas
- **Process data across formats**: JSON, CSV, Excel (.xlsx), Parquet, XML, and PDF reports
- **Connect to 14 database types** including MySQL, PostgreSQL, MongoDB, Oracle, Cassandra, Neo4j, and cloud databases from AWS, Google Cloud, and Azure
- **Track data lineage** with detailed provenance logs showing input/output records, timing, and errors
- **Persist everything** — flows, database connections, execution history, and output files are all saved to disk

Think of it as a lightweight, web-native version of Apache NiFi designed for modern data engineering workflows.

---

## Features at a Glance

### 30+ Modular Processors

| Category | Processors | Count |
|----------|------------|-------|
| **Sources** | JSON Input, CSV Input, Excel Input, Parquet Input, XML Input, PDF Input, File Input, Data Generator | 8 |
| **Transforms** | JSON Transform, CSV Transform, Filter, Sort, Aggregate, Merge, Deduplicate, Lookup/Enrich, Script | 9 |
| **Sinks** | JSON Output, CSV Output, Excel Output, Parquet Output, XML Output, PDF Report Output, File Output | 7 |
| **Database** | Database Query, Create Table, Insert, Upsert, Delete | 5 |
| **Communication** | Send Email, Webhook | 2 |
| **Utility** | Log, Script, Data Generator | 3 |

### 14 Database Adapters

| Provider | Databases |
|----------|-----------|
| **On-Premise** | MySQL, PostgreSQL, Microsoft SQL Server, Oracle, MongoDB, Apache Cassandra, Neo4j |
| **Google Cloud** | Cloud SQL, BigQuery |
| **Amazon Web Services** | RDS, DynamoDB, Redshift |
| **Microsoft Azure** | SQL Database, Cosmos DB |

### 10 Pre-Built Workflow Templates

Each template includes full documentation, data flow diagrams, and working processor configurations.

| # | Workflow | Scenario |
|---|----------|----------|
| 1 | JSON to Multi-Format Export | Read JSON → Transform → Export to CSV + JSON |
| 2 | CSV to Database Load | Read CSV → Filter → Insert to MySQL |
| 3 | Database to Multi-Format Export | Query DB → Sort → Export to Excel/Parquet/XML/PDF |
| 4 | Cross-Database Migration | MySQL + MongoDB → Merge → PostgreSQL + Oracle |
| 5 | Cloud-to-Cloud ETL | GCP BigQuery → Transform → AWS Redshift + Azure Cosmos |
| 6 | Excel Report to Email | Read Excel → Aggregate → CSV → Send Email |
| 7 | Parquet Data Enrichment | Read Parquet → Lookup → Sort → Parquet + Excel |
| 8 | XML Processing Pipeline | Read XML → Filter → Normalize → CSV + XML + JSON |
| 9 | Multi-Database Aggregation | PostgreSQL + MSSQL + Cassandra → Merge → Aggregate → CSV + Neo4j |
| 10 | AWS + Azure Cloud ETL | DynamoDB + Azure SQL → Enrich → Filter → Redshift + Cosmos + Email |

### Sample Data

6 datasets across all supported formats with 225+ records:

| Dataset | Records | Fields |
|---------|---------|--------|
| Customers | 20 | id, name, email, city, country, totalOrders, totalSpent, segment, joinDate |
| Products | 20 | id, name, category, price, stock, supplier, weight |
| Orders | 50 | id, customerId, customerName, productId, productName, quantity, unitPrice, totalPrice, status, orderDate, region, paymentMethod |
| Employees | 15 | id, name, department, role, salary, hireDate, manager, performance |
| Transactions | 100 | id, customerId, type, amount, currency, timestamp, status, reference |
| Inventory | 20 | productId, productName, warehouse, quantity, reorderLevel, lastRestocked, unitCost |

---

## Application Pages

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Landing page with setup button, navigation cards, architecture overview |
| **Workflow Library** | `/workflows` | Browse 10 pre-built workflows, view documentation, open in editor |
| **Flow Editor** | `/flows/[id]` | Visual drag-and-drop canvas with processor palette, properties panel, provenance log |
| **Flow Listing** | `/flows` | Create, list, and manage flows |
| **Database Manager** | `/databases` | View 14 database connections, browse tables, view table data |
| **Data Browser** | `/data` | Navigate file tree, view JSON/CSV/XML content, quick navigation |

---

## How It Works

### Flow Execution

1. **Topological Sort**: The execution engine builds a directed acyclic graph (DAG) from the flow's processor connections and sorts processors in execution order.

2. **Sequential Execution**: Each processor runs in order. Source processors (with no incoming connections) generate initial data. Transform processors modify data. Sink processors write output.

3. **Data Propagation**: Output from each processor is passed as input to all connected downstream processors.

4. **Provenance Tracking**: Every processor execution generates provenance events recording input/output record counts, timing, and any errors.

### Data Persistence

All data is persisted to the `data/` directory:

```
data/
├── samples/          # Generated sample files (JSON, CSV, Excel, Parquet, XML, PDF)
├── outputs/          # Workflow output files
├── databases/        # Database connections and table data (JSON files)
│   ├── connections/  # Connection configurations
│   └── tables/       # Table schemas and row data
├── workflows/        # Persisted flow definitions
│   └── flows/        # Flow JSON files
└── provenance/       # Execution history
    └── executions/   # Execution and event records
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design, data flow, code structure, and design patterns |
| [Processors](docs/processors.md) | All 30+ processors with descriptions, config schemas, and usage examples |
| [Workflows](docs/workflows.md) | All 10 workflow templates with data flow diagrams, scenarios, and documentation |
| [Databases](docs/databases.md) | All 14 database adapters, connection management, and table operations |
| [Sample Data](docs/sample-data.md) | All sample datasets, file formats, and data generation |
| [API Reference](docs/api-reference.md) | All REST API endpoints with request/response formats |
| [Data Persistence](docs/data-persistence.md) | How data is stored, managed, and accessed |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home page with setup and navigation
│   ├── layout.tsx                  # Root layout
│   ├── flows/
│   │   ├── page.tsx                # Flow listing
│   │   └── [id]/page.tsx           # Flow editor
│   ├── workflows/page.tsx          # Workflow library
│   ├── databases/page.tsx          # Database manager
│   ├── data/page.tsx               # Data browser
│   └── api/
│       ├── flows/                  # Flow CRUD, execution, provenance
│       ├── processors/             # Processor definitions
│       ├── databases/              # Database connections, tables
│       ├── files/browse/           # File browser
│       ├── samples/generate/       # Sample data generator
│       └── setup/                  # One-click setup
├── components/
│   └── flow-editor/                # Canvas, palette, properties, toolbar, provenance
└── lib/
    ├── types/                      # TypeScript type definitions
    ├── store/                      # File-backed data store
    ├── engine/                     # Flow execution engine
    ├── processors/                 # Processor definitions and executors
    ├── data/                       # Sample data, file store, database manager
    └── workflows/                  # Workflow templates
```

---

## Development

### Commands

```bash
bun install        # Install dependencies
bun dev            # Start development server (http://localhost:3000)
bun build          # Production build
bun start          # Start production server
bun lint           # Run ESLint
bun typecheck      # Run TypeScript type checking
```

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.9.x | Type-safe JavaScript |
| Tailwind CSS | 4.x | Utility-first CSS |
| Bun | Latest | Package manager and runtime |
| uuid | 13.x | Unique ID generation |

### Adding a New Processor

1. Add the processor type to `ProcessorType` in `src/lib/types/index.ts`
2. Add the processor definition to `processorDefinitions` in `src/lib/processors/definitions.ts`
3. Add the executor function to the `executors` map in `src/lib/processors/executors.ts`
4. The processor is now available in the flow editor palette

### Adding a New Database Adapter

1. Add the type to `DatabaseType` in `src/lib/data/database-manager.ts`
2. Add the default port/host in `getDbDefaults()`
3. Add the label in `getDbLabel()`
4. Add a default entry in `src/app/api/setup/route.ts`

---

## License

Internal project.
