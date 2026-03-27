# Workflow Templates

FlowForge includes 10 pre-built workflow templates that demonstrate common data pipeline scenarios. Each template includes:

- Complete processor configurations
- Connection definitions
- Full documentation with data flow diagrams
- Categorization and tags

All templates are created when you click "Quick Setup" on the home page.

---

## Workflow 1: JSON to Multi-Format Export

**Category:** File Export | **Tags:** `export`, `json`, `csv`, `transform`

### Scenario

Read customer data from a JSON file, transform field names, and export to both CSV and JSON formats simultaneously.

### Data Flow Diagram

```
[JSON Input] → [JSON Transform] → [CSV Output]
                      ↓
                [JSON Output]
```

### Processors

| # | Processor | Type | Configuration |
|---|-----------|------|---------------|
| 1 | Read Customers JSON | `json-input` | filePath: `data/samples/json/customers.json` |
| 2 | Rename Fields | `json-transform` | mappings: `joinDate:registration_date`, `totalOrders:order_count`; removeFields: `segment` |
| 3 | Export to CSV | `csv-output` | filePath: `data/outputs/csv/customers_transformed.csv` |
| 4 | Export to JSON | `json-output` | filePath: `data/outputs/json/customers_transformed.json` |

### Source Files

- Input: `data/samples/json/customers.json` (20 records)

### Output Files

- `data/outputs/csv/customers_transformed.csv`
- `data/outputs/json/customers_transformed.json`

### Use Cases

- Data migration between systems that require different field names
- Report generation in multiple formats
- ETL pipeline for analytics platforms

---

## Workflow 2: CSV to Database Load

**Category:** Database Loading | **Tags:** `csv`, `database`, `mysql`, `filter`

### Scenario

Read order data from a CSV file, filter for delivered orders, insert them into a MySQL database table, and export the filtered results to a separate CSV file.

### Data Flow Diagram

```
[CSV Input] → [Filter: delivered] → [DB Insert: MySQL]
                     ↓
               [CSV Output]
```

### Processors

| # | Processor | Type | Configuration |
|---|-----------|------|---------------|
| 1 | Read Orders CSV | `csv-input` | filePath: `data/samples/csv/orders.csv` |
| 2 | Filter Completed | `filter` | field: `status`, operator: `equals`, value: `delivered` |
| 3 | Insert to MySQL | `db-insert` | connectionId: `mysql-main`, tableName: `completed_orders` |
| 4 | Export Delivered | `csv-output` | filePath: `data/outputs/csv/delivered_orders.csv` |

### Use Cases

- Loading operational data into a data warehouse
- Data quality filtering before database load
- Parallel processing with audit trail

---

## Workflow 3: Database to Multi-Format Export

**Category:** Database Export | **Tags:** `database`, `mysql`, `excel`, `parquet`, `xml`, `pdf`, `export`

### Scenario

Query customer data from a MySQL database, sort by total spending (descending), and export to four different formats: Excel workbook, Parquet columnar file, XML document, and PDF text report.

### Data Flow Diagram

```
[DB Query: MySQL] → [Sort: totalSpent desc] → [Excel Output]
                                     ↓ → [Parquet Output]
                                     ↓ → [XML Output]
                                     ↓ → [PDF Report]
```

### Processors

| # | Processor | Type | Configuration |
|---|-----------|------|---------------|
| 1 | MySQL Customers | `db-query` | connectionId: `mysql-main`, tableName: `customers`, limit: `500` |
| 2 | Sort by Spent | `sort` | field: `totalSpent`, order: `desc` |
| 3 | Export to Excel | `excel-output` | filePath: `data/outputs/excel/top_customers.xlsx.json`, sheetName: `Top Customers` |
| 4 | Export to Parquet | `parquet-output` | filePath: `data/outputs/parquet/customers.parquet.json` |
| 5 | Export to XML | `xml-output` | filePath: `data/outputs/xml/customers.xml`, rootTag: `customers`, itemTag: `customer` |
| 6 | Generate Report | `pdf-output` | filePath: `data/outputs/pdf/customer_report.pdf.txt`, title: `Top Customers Report` |

### Output Files

- `data/outputs/excel/top_customers.xlsx.json`
- `data/outputs/parquet/customers.parquet.json`
- `data/outputs/xml/customers.xml`
- `data/outputs/pdf/customer_report.pdf.txt`

### Use Cases

- Multi-format reporting for different teams
- Data distribution to analytics platforms
- Data lake export in various formats

---

## Workflow 4: Cross-Database Migration

**Category:** Database Migration | **Tags:** `mysql`, `mongodb`, `postgresql`, `oracle`, `migration`, `merge`

### Scenario

Extract customer data from MySQL and order data from MongoDB, merge both data streams, deduplicate by ID, and load the unified dataset into both PostgreSQL and Oracle databases.

### Data Flow Diagram

```
[MySQL Query] ─→
                 [Merge] → [Deduplicate] → [PostgreSQL Insert]
[MongoDB Query] ─→                    ↓ → [Oracle Insert]
```

### Processors

| # | Processor | Type | Configuration |
|---|-----------|------|---------------|
| 1 | MySQL Customers | `db-query` | connectionId: `mysql-main`, tableName: `customers` |
| 2 | MongoDB Orders | `db-query` | connectionId: `mongo-main`, tableName: `orders` |
| 3 | Merge Streams | `merge` | strategy: `concat` |
| 4 | Remove Duplicates | `deduplicate` | keyField: `id` |
| 5 | Insert to PostgreSQL | `db-insert` | connectionId: `pg-main`, tableName: `unified_data` |
| 6 | Insert to Oracle | `db-insert` | connectionId: `oracle-main`, tableName: `unified_data` |

### Databases Involved

- **Sources:** MySQL (customers), MongoDB (orders)
- **Targets:** PostgreSQL (unified_data), Oracle (unified_data)

### Use Cases

- Database consolidation projects
- Data warehouse population from multiple sources
- Multi-region data replication

---

## Workflow 5: Cloud-to-Cloud ETL

**Category:** Cloud ETL | **Tags:** `gcp`, `bigquery`, `aws`, `redshift`, `azure`, `cosmos`, `cloud`

### Scenario

Extract order data from Google BigQuery, add metadata fields (region, source), filter for high-value orders (price > $100), and load into both AWS Redshift and Azure Cosmos DB.

### Data Flow Diagram

```
[GCP BigQuery] → [Add Region] → [Filter: price > 100] → [AWS Redshift]
                                                    ↓ → [Azure Cosmos DB]
```

### Processors

| # | Processor | Type | Configuration |
|---|-----------|------|---------------|
| 1 | GCP BigQuery Orders | `db-query` | connectionId: `gcp-bigquery-main`, tableName: `orders` |
| 2 | Add Region | `json-transform` | addFields: `region:global`, `source:bigquery` |
| 3 | Filter High Value | `filter` | field: `totalPrice`, operator: `gt`, value: `100` |
| 4 | AWS Redshift | `db-insert` | connectionId: `aws-redshift-main`, tableName: `high_value_orders` |
| 5 | Azure Cosmos DB | `db-insert` | connectionId: `azure-cosmos-main`, tableName: `high_value_orders` |

### Cloud Services

- **Source:** Google BigQuery
- **Targets:** Amazon Redshift, Azure Cosmos DB

### Use Cases

- Multi-cloud data distribution
- Cross-platform analytics
- Disaster recovery data replication

---

## Workflow 6: Excel Report to Email

**Category:** Reporting | **Tags:** `excel`, `aggregate`, `email`, `reporting`

### Scenario

Read order data from an Excel workbook, aggregate sales by region (sum of totalPrice), export the summary to CSV, and send it as an email attachment.

### Data Flow Diagram

```
[Excel Input] → [Aggregate: by region] → [CSV Output]
                                  ↓ → [Send Email]
```

### Processors

| # | Processor | Type | Configuration |
|---|-----------|------|---------------|
| 1 | Read Excel Report | `excel-input` | filePath: `data/samples/excel/sales_report.xlsx.json`, sheetName: `Orders` |
| 2 | Group by Region | `aggregate` | groupBy: `region`, operation: `sum`, field: `totalPrice` |
| 3 | Export Summary | `csv-output` | filePath: `data/outputs/csv/regional_summary.csv` |
| 4 | Email Report | `email-send` | to: `sales@company.com`, subject: `Regional Sales Summary`, format: `csv` |

### Use Cases

- Automated report distribution
- Sales dashboard data preparation
- Scheduled reporting pipelines

---

## Workflow 7: Parquet Data Enrichment

**Category:** Data Enrichment | **Tags:** `parquet`, `lookup`, `enrichment`, `excel`

### Scenario

Read order data from a Parquet file, enrich each order with product details using a JSON lookup reference, sort by order date (descending), and export to both Parquet and Excel formats.

### Data Flow Diagram

```
[Parquet Input] → [Lookup: products] → [Sort: date desc] → [Parquet Output]
                                                      ↓ → [Excel Output]
```

### Processors

| # | Processor | Type | Configuration |
|---|-----------|------|---------------|
| 1 | Read Parquet Orders | `parquet-input` | filePath: `data/samples/parquet/orders.parquet.json` |
| 2 | Enrich with Products | `lookup` | referencePath: `data/samples/json/products.json`, joinKey: `productId`, referenceKey: `id` |
| 3 | Sort by Date | `sort` | field: `orderDate`, order: `desc` |
| 4 | Write Enriched Parquet | `parquet-output` | filePath: `data/outputs/parquet/enriched_orders.parquet.json` |
| 5 | Write to Excel | `excel-output` | filePath: `data/outputs/excel/enriched_orders.xlsx.json`, sheetName: `Enriched Orders` |

### Use Cases

- Data lake enrichment
- Preparing enriched datasets for analytics
- Cross-format data distribution

---

## Workflow 8: XML Processing Pipeline

**Category:** File Processing | **Tags:** `xml`, `filter`, `transform`, `multi-format`

### Scenario

Read product data from XML, filter for Electronics category, normalize field names (name→product_name, price→unit_price), remove unnecessary fields, and export to CSV, XML, and JSON formats.

### Data Flow Diagram

```
[XML Input] → [Filter: Electronics] → [Transform] → [CSV Output]
                                              ↓ → [XML Output]
                                              ↓ → [JSON Output]
```

### Processors

| # | Processor | Type | Configuration |
|---|-----------|------|---------------|
| 1 | Read XML Products | `xml-input` | filePath: `data/samples/json/products.xml`, rootTag: `products`, itemTag: `product` |
| 2 | Filter Electronics | `filter` | field: `category`, operator: `equals`, value: `Electronics` |
| 3 | Normalize Fields | `json-transform` | mappings: `name:product_name`, `price:unit_price`; removeFields: `weight,supplier` |
| 4 | Export to CSV | `csv-output` | filePath: `data/outputs/csv/electronics_products.csv` |
| 5 | Export to XML | `xml-output` | filePath: `data/outputs/xml/electronics_products.xml`, rootTag: `electronics`, itemTag: `product` |
| 6 | Export to JSON | `json-output` | filePath: `data/outputs/json/electronics_products.json` |

### Use Cases

- XML data normalization
- Product catalog processing
- Multi-format data distribution

---

## Workflow 9: Multi-Database Aggregation

**Category:** Multi-DB Analytics | **Tags:** `postgresql`, `mssql`, `cassandra`, `neo4j`, `aggregation`, `merge`

### Scenario

Query order data from three different databases (PostgreSQL, MSSQL, Cassandra), merge all streams, deduplicate by order ID, aggregate counts by status, and export the summary to CSV and Neo4J.

### Data Flow Diagram

```
[PostgreSQL] ──→
[MSSQL]     ──→ [Merge] → [Merge All] → [Deduplicate] → [Aggregate] → [CSV]
[Cassandra] ──→                                    ↓ → [Neo4J]
```

### Processors

| # | Processor | Type | Configuration |
|---|-----------|------|---------------|
| 1 | PostgreSQL Orders | `db-query` | connectionId: `pg-main`, tableName: `orders` |
| 2 | MSSQL Orders | `db-query` | connectionId: `mssql-main`, tableName: `orders` |
| 3 | Cassandra Orders | `db-query` | connectionId: `cassandra-main`, tableName: `orders` |
| 4 | Merge 1+2 | `merge` | strategy: `concat` |
| 5 | Merge All | `merge` | strategy: `concat` |
| 6 | Deduplicate by ID | `deduplicate` | keyField: `id` |
| 7 | Group by Status | `aggregate` | groupBy: `status`, operation: `count` |
| 8 | Export Summary | `csv-output` | filePath: `data/outputs/csv/order_status_summary.csv` |
| 9 | Insert to Neo4J | `db-insert` | connectionId: `neo4j-main`, tableName: `order_summary` |

### Databases Involved

- **Sources:** PostgreSQL, Microsoft SQL Server, Apache Cassandra
- **Target:** Neo4j Graph Database

### Use Cases

- Enterprise data consolidation
- Cross-platform analytics
- Data warehouse population from heterogeneous sources

---

## Workflow 10: AWS + Azure Cloud ETL

**Category:** Cloud ETL | **Tags:** `aws`, `dynamodb`, `redshift`, `azure`, `cosmos`, `sql`, `email`

### Scenario

Extract transaction data from AWS DynamoDB, enrich with customer data from Azure SQL, merge streams, filter for completed transactions only, and load into AWS Redshift, Azure Cosmos DB, and send an email alert.

### Data Flow Diagram

```
[AWS DynamoDB] → [Lookup: customers] →
                                       [Merge] → [Filter: completed] → [AWS Redshift]
[Azure SQL] ──→                              ↓ → [Azure Cosmos DB]
                                            ↓ → [Email Alert]
```

### Processors

| # | Processor | Type | Configuration |
|---|-----------|------|---------------|
| 1 | AWS DynamoDB | `db-query` | connectionId: `aws-dynamodb-main`, tableName: `transactions` |
| 2 | Azure SQL | `db-query` | connectionId: `azure-sql-main`, tableName: `customers` |
| 3 | Enrich Transactions | `lookup` | referencePath: `data/samples/json/customers.json`, joinKey: `customerId`, referenceKey: `id` |
| 4 | Merge Enriched | `merge` | strategy: `concat` |
| 5 | Filter Completed | `filter` | field: `status`, operator: `equals`, value: `completed` |
| 6 | AWS Redshift | `db-insert` | connectionId: `aws-redshift-main`, tableName: `completed_transactions` |
| 7 | Azure Cosmos DB | `db-insert` | connectionId: `azure-cosmos-main`, tableName: `completed_transactions` |
| 8 | Email Alert | `email-send` | to: `ops@company.com`, subject: `Daily Transaction Report`, format: `json` |

### Cloud Services

- **AWS:** DynamoDB (source), Redshift (target)
- **Azure:** SQL Database (source), Cosmos DB (target)

### Use Cases

- Multi-cloud data integration
- Real-time transaction processing
- Cross-cloud data distribution with notification
