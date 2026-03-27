# Database Connections

FlowForge supports 14 database types across on-premise, Google Cloud, Amazon Web Services, and Microsoft Azure.

## Supported Database Types

### On-Premise Databases

| Type ID | Name | Default Port | Category |
|---------|------|-------------|----------|
| `mysql` | MySQL | 3306 | On-Premise |
| `postgresql` | PostgreSQL | 5432 | On-Premise |
| `mssql` | Microsoft SQL Server | 1433 | On-Premise |
| `oracle` | Oracle Database | 1521 | On-Premise |
| `mongodb` | MongoDB | 27017 | On-Premise |
| `cassandra` | Apache Cassandra | 9042 | On-Premise |
| `neo4j` | Neo4j Graph DB | 7687 | On-Premise |
| `sqlite` | SQLite | 0 (local) | On-Premise |

### Google Cloud

| Type ID | Name | Default Port | Category |
|---------|------|-------------|----------|
| `gcp-sql` | Google Cloud SQL | 3306 | Google Cloud |
| `gcp-bigquery` | Google BigQuery | 443 | Google Cloud |

### Amazon Web Services

| Type ID | Name | Default Port | Category |
|---------|------|-------------|----------|
| `aws-rds` | Amazon RDS | 5432 | AWS |
| `aws-dynamodb` | Amazon DynamoDB | 443 | AWS |
| `aws-redshift` | Amazon Redshift | 5439 | AWS |

### Microsoft Azure

| Type ID | Name | Default Port | Category |
|---------|------|-------------|----------|
| `azure-sql` | Azure SQL Database | 1433 | Azure |
| `azure-cosmos` | Azure Cosmos DB | 443 | Azure |

## Default Connections

When you run "Quick Setup", 14 database connections are created automatically:

| Name | Type | Database |
|------|------|----------|
| MySQL Production | mysql | ecommerce |
| PostgreSQL Analytics | postgresql | analytics |
| MSSQL Enterprise | mssql | enterprise |
| Oracle Warehouse | oracle | warehouse |
| MongoDB NoSQL | mongodb | documents |
| Cassandra TimeSeries | cassandra | timeseries |
| Neo4j Graph | neo4j | graphdb |
| Google Cloud SQL | gcp-sql | gcp_ecommerce |
| Google BigQuery | gcp-bigquery | analytics_lake |
| AWS RDS PostgreSQL | aws-rds | rds_analytics |
| AWS DynamoDB | aws-dynamodb | nosql_store |
| AWS Redshift | aws-redshift | data_warehouse |
| Azure SQL Database | azure-sql | azure_ecommerce |
| Azure Cosmos DB | azure-cosmos | cosmos_store |

## Connection Data Model

```typescript
interface DatabaseConnection {
  id: string;          // UUID
  name: string;        // Display name
  type: DatabaseType;  // Database type identifier
  host: string;        // Hostname or endpoint
  port: number;        // Connection port
  database: string;    // Database/schema name
  username: string;    // Authentication username
  password: string;    // Authentication password
  ssl: boolean;        // SSL enabled
  status: "connected" | "disconnected" | "error";
  createdAt: string;   // ISO timestamp
  updatedAt: string;   // ISO timestamp
  metadata: Record<string, string | number | boolean>;
}
```

## Table Data Model

```typescript
interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  rowCount: number;
}

interface ColumnDefinition {
  name: string;
  type: string;        // "string", "number", "boolean", "date"
  nullable: boolean;
  primaryKey: boolean;
}
```

## Storage Layout

Database data is stored under `data/databases/`:

```
data/databases/
├── connections/
│   ├── {uuid-1}.json          # MySQL Production connection config
│   ├── {uuid-2}.json          # PostgreSQL Analytics connection config
│   └── ...
└── tables/
    ├── {connection-uuid-1}/
    │   ├── customers/
    │   │   ├── schema.json    # { name: "customers", columns: [...], rowCount: 20 }
    │   │   └── data.json      # [ { id: "C001", name: "Alice", ... }, ... ]
    │   └── orders/
    │       ├── schema.json
    │       └── data.json
    └── {connection-uuid-2}/
        └── ...
```

## API Endpoints

### List Connections

```
GET /api/databases
Response: DatabaseConnection[]
```

### Create Connection

```
POST /api/databases
Body: { name, type, host?, port?, database?, username?, password?, ssl?, metadata? }
Response: DatabaseConnection
```

### Get Connection (with tables)

```
GET /api/databases/{id}
Response: DatabaseConnection & { tables: string[] }
```

### Update Connection

```
PUT /api/databases/{id}
Body: Partial<DatabaseConnection>
Response: DatabaseConnection
```

### Delete Connection

```
DELETE /api/databases/{id}
Response: { success: true }
```

### List Tables

```
GET /api/databases/{id}/tables
Response: TableSchema[]
```

### Create Table

```
POST /api/databases/{id}/tables
Body: { name: string, columns: ColumnDefinition[] }
Response: TableSchema
```

### Query Table

```
GET /api/databases/{id}/tables/{table}?limit=100&offset=0
Response: { schema: TableSchema, rows: Record<string, unknown>[], count: number }
```

### Insert Rows

```
POST /api/databases/{id}/tables/{table}
Body: Record<string, unknown>[] | { rows: Record<string, unknown>[] }
Response: { inserted: number }
```

## Database Processors

These processors interact with database connections:

| Processor | Purpose | Config |
|-----------|---------|--------|
| `db-query` | Read rows from a table | connectionId, tableName, limit, offset |
| `db-create-table` | Create a table with schema | connectionId, tableName, columnDefinitions |
| `db-insert` | Insert records into a table | connectionId, tableName |
| `db-upsert` | Insert or update records | connectionId, tableName, keyField |
| `db-delete` | Delete records by key | connectionId, tableName, keyField, keyValue |

## Browsing Database Data

The Database Manager page (`/databases`) provides:

1. **Connection List** — All 14 connections grouped by provider (On-Premise, Google Cloud, AWS, Azure)
2. **Table Browser** — Click a connection to see its tables
3. **Data Viewer** — Click a table to view its rows in a tabular format

All database data is persisted as JSON files and can also be viewed in the Data Browser (`/data`) under `databases/`.
