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
- [x] Sample data generator (225+ records across 6 datasets)
- [x] Data browser page (file tree, JSON/CSV viewer)
- [x] Database connections page (connection list, table browser)
- [x] Workflow library page with documentation viewer
- [x] One-click setup endpoint
- [x] Comprehensive documentation (README, 7 docs/ files)
- [x] 10 pre-built workflow templates with full documentation
- [x] Sample data generator (20 customers, 20 products, 50 orders, 15 employees, 100 transactions, 20 inventory items)
- [x] Data browser page (file tree, JSON/CSV viewer)
- [x] Database connections page (connection list, table browser)
- [x] Workflow library page with documentation viewer
- [x] One-click setup endpoint (creates all sample data, DB connections, workflow templates)
- [x] User authentication system with scrypt password hashing and session tokens
- [x] Company profile creation and management
- [x] Team member invitation with role-based access (admin, engineer, viewer)
- [x] Auth API routes: signup, login, logout, session check
- [x] Company API routes: CRUD, invite members, list members
- [x] Signup page with company name optional field
- [x] Login page with session token storage
- [x] Company setup page (industry, size, description, website)
- [x] Dashboard page with auth guard and navigation header
- [x] Team management page with invite form and member list
- [x] Landing page updated with Login/Signup navigation

## Current Structure

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page with setup, login/signup navigation |
| `src/app/signup/page.tsx` | User registration with optional company name |
| `src/app/login/page.tsx` | User login with email/password |
| `src/app/company-setup/page.tsx` | Company profile creation form |
| `src/app/dashboard/page.tsx` | Authenticated dashboard with navigation |
| `src/app/team/page.tsx` | Team management and engineer invitations |
| `src/app/flows/page.tsx` | Flow listing and creation |
| `src/app/flows/[id]/page.tsx` | Visual flow editor |
| `src/app/workflows/page.tsx` | Workflow library with documentation |
| `src/app/databases/page.tsx` | Database connection manager & table browser |
| `src/app/data/page.tsx` | Data file browser |
| `src/app/api/auth/signup/route.ts` | User registration API |
| `src/app/api/auth/login/route.ts` | User login API |
| `src/app/api/auth/logout/route.ts` | User logout API |
| `src/app/api/auth/session/route.ts` | Session validation API |
| `src/app/api/companies/route.ts` | Company CRUD API |
| `src/app/api/companies/invite/route.ts` | Team member invite API |
| `src/app/api/companies/members/route.ts` | List company members API |
| `src/app/api/flows/` | Flow CRUD API |
| `src/app/api/processors/` | Processor definitions API |
| `src/app/api/databases/` | Database connections API |
| `src/app/api/files/browse/` | File browser API |
| `src/app/api/samples/generate/` | Sample data generator API |
| `src/app/api/setup/` | One-click setup API |
| `src/components/flow-editor/` | Canvas, palette, properties, toolbar, provenance |
| `src/lib/types/` | TypeScript definitions (includes auth types) |
| `src/lib/store/` | File-backed data store + auth store |
| `src/lib/engine/` | Flow execution engine |
| `src/lib/processors/` | 30+ processor definitions & executors |
| `src/lib/data/` | Sample data, file store, database manager |
| `src/lib/workflows/` | 10 workflow templates |
| `README.md` | Project overview and quick start guide |
| `docs/architecture.md` | System design, data flow, code structure |
| `docs/processors.md` | All 30+ processors with config schemas |
| `docs/workflows.md` | All 10 workflow templates with documentation |
| `docs/databases.md` | All 14 database adapters and connection management |
| `docs/sample-data.md` | Sample datasets and file formats |
| `docs/api-reference.md` | All REST API endpoints |
| `docs/data-persistence.md` | Storage layout and data formats |
| `data/` | Persisted data directory (includes auth/ subdirectory) |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with setup, login/signup navigation |
| `/signup` | User registration |
| `/login` | User login |
| `/company-setup` | Company profile creation (after signup) |
| `/dashboard` | Authenticated dashboard with overview |
| `/team` | Team management and engineer invitations |
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
| Update | User auth: signup/login, company profiles, team management with role-based access |

## Dependencies

| Package | Purpose |
|---------|---------|
| uuid | Unique ID generation |
| papaparse | CSV parsing (available) |
| next | Framework |
| react/react-dom | UI |
| crypto (built-in) | Password hashing (scrypt) and session token generation |
