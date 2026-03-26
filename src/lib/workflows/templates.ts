import { v4 as uuidv4 } from "uuid";
import type { FlowDefinition, ProcessorNode, Connection } from "@/lib/types";

function node(type: ProcessorNode["type"], label: string, config: Record<string, unknown>, x: number, y: number): ProcessorNode {
  return { id: uuidv4(), type, label, config: config as Record<string, string | number | boolean | string[]>, position: { x, y }, status: "idle" };
}

function conn(source: ProcessorNode, target: ProcessorNode): Connection {
  return { id: uuidv4(), sourceId: source.id, sourcePort: "out", targetId: target.id, targetPort: "in" };
}

// ===== WORKFLOW 1: JSON to Multiple DBs =====
function createJsonToMultiDb(): FlowDefinition {
  const src = node("json-input", "Read Customers JSON", { filePath: "data/samples/json/customers.json" }, 50, 50);
  const transform = node("json-transform", "Rename Fields", { mappings: "joinDate:registration_date\ntotalOrders:order_count", removeFields: "segment" }, 300, 50);
  const toCsv = node("csv-output", "Export to CSV", { filePath: "data/outputs/csv/customers_transformed.csv" }, 550, 50);
  const toJson = node("json-output", "Export to JSON", { filePath: "data/outputs/json/customers_transformed.json" }, 550, 200);

  const connections = [conn(src, transform), conn(transform, toCsv), conn(transform, toJson)];

  return {
    id: uuidv4(), name: "JSON to Multi-Format Export", description: "Read customer JSON data, transform fields, and export to both CSV and JSON formats simultaneously.",
    processors: [src, transform, toCsv, toJson], connections,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft",
    tags: ["export", "json", "csv", "transform"], category: "File Export",
    documentation: "## Workflow: JSON to Multi-Format Export\n\n### Scenario\nRead customer data from a JSON file, rename fields (joinDate→registration_date, totalOrders→order_count), remove the 'segment' field, and export the transformed data to both CSV and JSON formats.\n\n### Data Flow\n```\n[JSON Input] → [JSON Transform] → [CSV Output]\n                          ↓\n                    [JSON Output]\n```\n\n### Source Files\n- Input: data/samples/json/customers.json (20 records)\n\n### Output Files\n- data/outputs/csv/customers_transformed.csv\n- data/outputs/json/customers_transformed.json\n\n### Use Cases\n- Data migration between systems\n- Report generation in multiple formats\n- ETL pipeline for analytics",
  };
}

// ===== WORKFLOW 2: CSV to Database Insert =====
function createCsvToDb(): FlowDefinition {
  const src = node("csv-input", "Read Orders CSV", { filePath: "data/samples/csv/orders.csv" }, 50, 50);
  const filter = node("filter", "Filter Completed", { field: "status", operator: "equals", value: "delivered" }, 300, 50);
  const dbInsert = node("db-insert", "Insert to MySQL", { connectionId: "mysql-main", tableName: "completed_orders" }, 550, 50);
  const csvOut = node("csv-output", "Export Delivered", { filePath: "data/outputs/csv/delivered_orders.csv" }, 550, 200);

  const connections = [conn(src, filter), conn(filter, dbInsert), conn(filter, csvOut)];

  return {
    id: uuidv4(), name: "CSV to Database Load", description: "Read orders from CSV, filter delivered orders, insert into MySQL database and export filtered data.",
    processors: [src, filter, dbInsert, csvOut], connections,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft",
    tags: ["csv", "database", "mysql", "filter"], category: "Database Loading",
    documentation: "## Workflow: CSV to Database Load\n\n### Scenario\nRead order data from CSV, filter for 'delivered' status orders, insert them into a MySQL database table, and export the filtered results to a separate CSV file.\n\n### Data Flow\n```\n[CSV Input] → [Filter: delivered] → [DB Insert: MySQL]\n                         ↓\n                   [CSV Output]\n```\n\n### Source Files\n- Input: data/samples/csv/orders.csv (50 records)\n\n### Output\n- Database table: completed_orders\n- File: data/outputs/csv/delivered_orders.csv\n\n### Use Cases\n- Loading operational data into data warehouse\n- Data quality filtering before DB load\n- Parallel processing for audit trail",
  };
}

// ===== WORKFLOW 3: Database Query to Multiple File Formats =====
function createDbToFiles(): FlowDefinition {
  const dbQuery = node("db-query", "Query MySQL Customers", { connectionId: "mysql-main", tableName: "customers", limit: "500" }, 50, 50);
  const sort = node("sort", "Sort by Spent", { field: "totalSpent", order: "desc" }, 300, 50);
  const toExcel = node("excel-output", "Export to Excel", { filePath: "data/outputs/excel/top_customers.xlsx.json", sheetName: "Top Customers" }, 550, 50);
  const toParquet = node("parquet-output", "Export to Parquet", { filePath: "data/outputs/parquet/customers.parquet.json" }, 550, 200);
  const toXml = node("xml-output", "Export to XML", { filePath: "data/outputs/xml/customers.xml", rootTag: "customers", itemTag: "customer" }, 550, 350);
  const toPdf = node("pdf-output", "Generate Report", { filePath: "data/outputs/pdf/customer_report.pdf.txt", title: "Top Customers Report" }, 550, 500);

  const connections = [conn(dbQuery, sort), conn(sort, toExcel), conn(sort, toParquet), conn(sort, toXml), conn(sort, toPdf)];

  return {
    id: uuidv4(), name: "Database to Multi-Format Export", description: "Query customers from MySQL, sort by spending, export to Excel, Parquet, XML, and PDF report formats.",
    processors: [dbQuery, sort, toExcel, toParquet, toXml, toPdf], connections,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft",
    tags: ["database", "mysql", "excel", "parquet", "xml", "pdf", "export"], category: "Database Export",
    documentation: "## Workflow: Database to Multi-Format Export\n\n### Scenario\nQuery customer data from a MySQL database, sort by total spending (descending), and export to four different formats: Excel workbook, Parquet columnar file, XML document, and PDF text report.\n\n### Data Flow\n```\n[DB Query: MySQL] → [Sort: totalSpent desc] → [Excel Output]\n                                      ↓ → [Parquet Output]\n                                      ↓ → [XML Output]\n                                      ↓ → [PDF Report]\n```\n\n### Output Files\n- data/outputs/excel/top_customers.xlsx.json\n- data/outputs/parquet/customers.parquet.json\n- data/outputs/xml/customers.xml\n- data/outputs/pdf/customer_report.pdf.txt\n\n### Use Cases\n- Multi-format reporting\n- Data distribution to different teams\n- Analytics data lake export",
  };
}

// ===== WORKFLOW 4: Cross-Database Migration =====
function createCrossDbMigration(): FlowDefinition {
  const srcMySql = node("db-query", "MySQL Customers", { connectionId: "mysql-main", tableName: "customers" }, 50, 50);
  const srcMongo = node("db-query", "MongoDB Orders", { connectionId: "mongo-main", tableName: "orders" }, 50, 250);
  const merge = node("merge", "Merge Streams", { strategy: "concat" }, 300, 150);
  const dedup = node("deduplicate", "Remove Duplicates", { keyField: "id" }, 500, 150);
  const pgInsert = node("db-insert", "Insert to PostgreSQL", { connectionId: "pg-main", tableName: "unified_data" }, 700, 150);
  const oracleInsert = node("db-insert", "Insert to Oracle", { connectionId: "oracle-main", tableName: "unified_data" }, 700, 300);

  const connections = [conn(srcMySql, merge), conn(srcMongo, merge), conn(merge, dedup), conn(dedup, pgInsert), conn(dedup, oracleInsert)];

  return {
    id: uuidv4(), name: "Cross-Database Migration", description: "Query data from MySQL and MongoDB, merge streams, deduplicate, and load into PostgreSQL and Oracle databases.",
    processors: [srcMySql, srcMongo, merge, dedup, pgInsert, oracleInsert], connections,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft",
    tags: ["mysql", "mongodb", "postgresql", "oracle", "migration", "merge"], category: "Database Migration",
    documentation: "## Workflow: Cross-Database Migration\n\n### Scenario\nExtract customer data from MySQL and order data from MongoDB, merge both data streams, deduplicate by ID, and load the unified dataset into both PostgreSQL and Oracle databases.\n\n### Data Flow\n```\n[MySQL Query] ─→\n                  [Merge] → [Deduplicate] → [PostgreSQL Insert]\n[MongoDB Query] ─→                    ↓ → [Oracle Insert]\n```\n\n### Databases Involved\n- Source: MySQL (customers), MongoDB (orders)\n- Target: PostgreSQL (unified_data), Oracle (unified_data)\n\n### Use Cases\n- Database consolidation\n- Data warehouse loading\n- Multi-region data replication",
  };
}

// ===== WORKFLOW 5: Cloud DB to Cloud DB =====
function createCloudToCloud(): FlowDefinition {
  const gcpQuery = node("db-query", "GCP BigQuery Orders", { connectionId: "gcp-bigquery-main", tableName: "orders" }, 50, 50);
  const transform = node("json-transform", "Add Region", { addFields: "region:global\nsource:bigquery" }, 300, 50);
  const filter = node("filter", "Filter High Value", { field: "totalPrice", operator: "gt", value: "100" }, 500, 50);
  const awsInsert = node("db-insert", "AWS Redshift", { connectionId: "aws-redshift-main", tableName: "high_value_orders" }, 700, 50);
  const azureInsert = node("db-insert", "Azure Cosmos DB", { connectionId: "azure-cosmos-main", tableName: "high_value_orders" }, 700, 200);

  const connections = [conn(gcpQuery, transform), conn(transform, filter), conn(filter, awsInsert), conn(filter, azureInsert)];

  return {
    id: uuidv4(), name: "Cloud-to-Cloud ETL", description: "Extract from Google BigQuery, transform and filter, load into AWS Redshift and Azure Cosmos DB.",
    processors: [gcpQuery, transform, filter, awsInsert, azureInsert], connections,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft",
    tags: ["gcp", "bigquery", "aws", "redshift", "azure", "cosmos", "cloud"], category: "Cloud ETL",
    documentation: "## Workflow: Cloud-to-Cloud ETL\n\n### Scenario\nExtract order data from Google BigQuery, add metadata fields (region, source), filter for high-value orders (> $100), and load into both AWS Redshift and Azure Cosmos DB.\n\n### Data Flow\n```\n[GCP BigQuery] → [Add Region] → [Filter: price > 100] → [AWS Redshift]\n                                                      ↓ → [Azure Cosmos DB]\n```\n\n### Cloud Services\n- Source: Google BigQuery\n- Targets: Amazon Redshift, Azure Cosmos DB\n\n### Use Cases\n- Multi-cloud data distribution\n- Cross-platform analytics\n- Disaster recovery data replication",
  };
}

// ===== WORKFLOW 6: Excel to JSON + Email =====
function createExcelToEmail(): FlowDefinition {
  const src = node("excel-input", "Read Excel Report", { filePath: "data/samples/excel/sales_report.xlsx.json", sheetName: "Orders" }, 50, 50);
  const aggregate = node("aggregate", "Group by Region", { groupBy: "region", operation: "sum", field: "totalPrice" }, 300, 50);
  const toCsv = node("csv-output", "Export Summary", { filePath: "data/outputs/csv/regional_summary.csv" }, 550, 50);
  const email = node("email-send", "Email Report", { to: "sales@company.com", subject: "Regional Sales Summary", body: "Attached is the regional sales summary report.", format: "csv" }, 550, 200);

  const connections = [conn(src, aggregate), conn(aggregate, toCsv), conn(aggregate, email)];

  return {
    id: uuidv4(), name: "Excel Report to Email", description: "Read Excel workbook, aggregate by region, export summary CSV, and send via email.",
    processors: [src, aggregate, toCsv, email], connections,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft",
    tags: ["excel", "aggregate", "email", "reporting"], category: "Reporting",
    documentation: "## Workflow: Excel Report to Email\n\n### Scenario\nRead order data from an Excel workbook, aggregate sales by region (sum of totalPrice), export the summary to CSV, and send it as an email attachment.\n\n### Data Flow\n```\n[Excel Input] → [Aggregate: by region] → [CSV Output]\n                                    ↓ → [Send Email]\n```\n\n### Use Cases\n- Automated report distribution\n- Sales dashboard data preparation\n- Scheduled reporting pipeline",
  };
}

// ===== WORKFLOW 7: Parquet + JSON Enrichment =====
function createParquetEnrichment(): FlowDefinition {
  const parquetSrc = node("parquet-input", "Read Parquet Orders", { filePath: "data/samples/parquet/orders.parquet.json" }, 50, 50);
  const lookup = node("lookup", "Enrich with Products", { referencePath: "data/samples/json/products.json", joinKey: "productId", referenceKey: "id" }, 300, 50);
  const sort = node("sort", "Sort by Date", { field: "orderDate", order: "desc" }, 500, 50);
  const toParquet = node("parquet-output", "Write Enriched Parquet", { filePath: "data/outputs/parquet/enriched_orders.parquet.json" }, 700, 50);
  const toExcel = node("excel-output", "Write to Excel", { filePath: "data/outputs/excel/enriched_orders.xlsx.json", sheetName: "Enriched Orders" }, 700, 200);

  const connections = [conn(parquetSrc, lookup), conn(lookup, sort), conn(sort, toParquet), conn(sort, toExcel)];

  return {
    id: uuidv4(), name: "Parquet Data Enrichment", description: "Read Parquet orders, enrich with product data via lookup, sort, and export to Parquet and Excel.",
    processors: [parquetSrc, lookup, sort, toParquet, toExcel], connections,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft",
    tags: ["parquet", "lookup", "enrichment", "excel"], category: "Data Enrichment",
    documentation: "## Workflow: Parquet Data Enrichment\n\n### Scenario\nRead order data from a Parquet file, enrich each order with product details using a JSON lookup reference, sort by order date (descending), and export to both Parquet and Excel formats.\n\n### Data Flow\n```\n[Parquet Input] → [Lookup: products] → [Sort: date desc] → [Parquet Output]\n                                                          ↓ → [Excel Output]\n```\n\n### Use Cases\n- Data lake enrichment\n- Preparing enriched datasets for analytics\n- Cross-format data distribution",
  };
}

// ===== WORKFLOW 8: XML Processing Pipeline =====
function createXmlPipeline(): FlowDefinition {
  const xmlSrc = node("xml-input", "Read XML Products", { filePath: "data/samples/json/products.xml", rootTag: "products", itemTag: "product" }, 50, 50);
  const filter = node("filter", "Filter Electronics", { field: "category", operator: "equals", value: "Electronics" }, 300, 50);
  const transform = node("json-transform", "Normalize Fields", { mappings: "name:product_name\nprice:unit_price", removeFields: "weight,supplier" }, 500, 50);
  const toCsv = node("csv-output", "Export to CSV", { filePath: "data/outputs/csv/electronics_products.csv" }, 700, 50);
  const toXml = node("xml-output", "Export to XML", { filePath: "data/outputs/xml/electronics_products.xml", rootTag: "electronics", itemTag: "product" }, 700, 200);
  const toJson = node("json-output", "Export to JSON", { filePath: "data/outputs/json/electronics_products.json" }, 700, 350);

  const connections = [conn(xmlSrc, filter), conn(filter, transform), conn(transform, toCsv), conn(transform, toXml), conn(transform, toJson)];

  return {
    id: uuidv4(), name: "XML Processing Pipeline", description: "Read XML products, filter electronics, normalize field names, export to CSV, XML, and JSON.",
    processors: [xmlSrc, filter, transform, toCsv, toXml, toJson], connections,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft",
    tags: ["xml", "filter", "transform", "multi-format"], category: "File Processing",
    documentation: "## Workflow: XML Processing Pipeline\n\n### Scenario\nRead product data from XML, filter for Electronics category, normalize field names (name→product_name, price→unit_price), remove unnecessary fields, and export to CSV, XML, and JSON formats.\n\n### Data Flow\n```\n[XML Input] → [Filter: Electronics] → [Transform] → [CSV Output]\n                                               ↓ → [XML Output]\n                                               ↓ → [JSON Output]\n```\n\n### Use Cases\n- XML data normalization\n- Product catalog processing\n- Multi-format data distribution",
  };
}

// ===== WORKFLOW 9: Multi-DB Aggregation =====
function createMultiDbAggregation(): FlowDefinition {
  const pgOrders = node("db-query", "PostgreSQL Orders", { connectionId: "pg-main", tableName: "orders" }, 50, 50);
  const mssqlOrders = node("db-query", "MSSQL Orders", { connectionId: "mssql-main", tableName: "orders" }, 50, 250);
  const cassandraOrders = node("db-query", "Cassandra Orders", { connectionId: "cassandra-main", tableName: "orders" }, 50, 450);
  const merge1 = node("merge", "Merge 1+2", { strategy: "concat" }, 300, 150);
  const merge2 = node("merge", "Merge All", { strategy: "concat" }, 500, 250);
  const dedup = node("deduplicate", "Deduplicate by ID", { keyField: "id" }, 700, 250);
  const agg = node("aggregate", "Group by Status", { groupBy: "status", operation: "count", field: "" }, 900, 250);
  const toCsv = node("csv-output", "Export Summary", { filePath: "data/outputs/csv/order_status_summary.csv" }, 1100, 250);
  const toDb = node("db-insert", "Insert to Neo4J", { connectionId: "neo4j-main", tableName: "order_summary" }, 1100, 400);

  const connections = [conn(pgOrders, merge1), conn(mssqlOrders, merge1), conn(merge1, merge2), conn(cassandraOrders, merge2), conn(merge2, dedup), conn(dedup, agg), conn(agg, toCsv), conn(agg, toDb)];

  return {
    id: uuidv4(), name: "Multi-Database Aggregation", description: "Query orders from PostgreSQL, MSSQL, and Cassandra, merge, deduplicate, aggregate by status, and export.",
    processors: [pgOrders, mssqlOrders, cassandraOrders, merge1, merge2, dedup, agg, toCsv, toDb], connections,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft",
    tags: ["postgresql", "mssql", "cassandra", "neo4j", "aggregation", "merge"], category: "Multi-DB Analytics",
    documentation: "## Workflow: Multi-Database Aggregation\n\n### Scenario\nQuery order data from three different databases (PostgreSQL, MSSQL, Cassandra), merge all streams, deduplicate by order ID, aggregate counts by status, and export the summary to CSV and Neo4J.\n\n### Data Flow\n```\n[PostgreSQL] ──→\n[MSSQL]     ──→ [Merge] → [Merge All] → [Deduplicate] → [Aggregate] → [CSV]\n[Cassandra] ──→                                       ↓ → [Neo4J]\n```\n\n### Databases Involved\n- Sources: PostgreSQL, Microsoft SQL Server, Apache Cassandra\n- Target: Neo4j Graph Database\n\n### Use Cases\n- Enterprise data consolidation\n- Cross-platform analytics\n- Data warehouse population",
  };
}

// ===== WORKFLOW 10: AWS + Azure Cloud ETL =====
function createAwsAzureEtl(): FlowDefinition {
  const awsDyn = node("db-query", "AWS DynamoDB", { connectionId: "aws-dynamodb-main", tableName: "transactions" }, 50, 50);
  const azureSql = node("db-query", "Azure SQL", { connectionId: "azure-sql-main", tableName: "customers" }, 50, 250);
  const lookup = node("lookup", "Enrich Transactions", { referencePath: "data/samples/json/customers.json", joinKey: "customerId", referenceKey: "id" }, 300, 50);
  const merge = node("merge", "Merge Enriched", { strategy: "concat" }, 500, 150);
  const filter = node("filter", "Filter Completed", { field: "status", operator: "equals", value: "completed" }, 700, 150);
  const toRedshift = node("db-insert", "AWS Redshift", { connectionId: "aws-redshift-main", tableName: "completed_transactions" }, 900, 150);
  const toCosmos = node("db-insert", "Azure Cosmos DB", { connectionId: "azure-cosmos-main", tableName: "completed_transactions" }, 900, 300);
  const email = node("email-send", "Email Alert", { to: "ops@company.com", subject: "Daily Transaction Report", body: "Daily completed transactions report attached.", format: "json" }, 900, 450);

  const connections = [conn(awsDyn, lookup), conn(azureSql, merge), conn(lookup, merge), conn(merge, filter), conn(filter, toRedshift), conn(filter, toCosmos), conn(filter, email)];

  return {
    id: uuidv4(), name: "AWS + Azure Cloud ETL", description: "Extract from DynamoDB and Azure SQL, enrich, merge, filter completed transactions, load to Redshift, Cosmos, and email.",
    processors: [awsDyn, azureSql, lookup, merge, filter, toRedshift, toCosmos, email], connections,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft",
    tags: ["aws", "dynamodb", "redshift", "azure", "cosmos", "sql", "email"], category: "Cloud ETL",
    documentation: "## Workflow: AWS + Azure Cloud ETL\n\n### Scenario\nExtract transaction data from AWS DynamoDB, enrich with customer data from Azure SQL, merge streams, filter for completed transactions only, and load into AWS Redshift, Azure Cosmos DB, and send an email alert.\n\n### Data Flow\n```\n[AWS DynamoDB] → [Lookup: customers] →\n                                       [Merge] → [Filter: completed] → [AWS Redshift]\n[Azure SQL] ──→                                     ↓ → [Azure Cosmos DB]\n                                                     ↓ → [Email Alert]\n```\n\n### Cloud Services\n- AWS: DynamoDB (source), Redshift (target)\n- Azure: SQL Database (source), Cosmos DB (target)\n\n### Use Cases\n- Multi-cloud data integration\n- Real-time transaction processing\n- Cross-cloud data distribution",
  };
}

// Export all templates
export function getAllWorkflowTemplates(): FlowDefinition[] {
  return [
    createJsonToMultiDb(),
    createCsvToDb(),
    createDbToFiles(),
    createCrossDbMigration(),
    createCloudToCloud(),
    createExcelToEmail(),
    createParquetEnrichment(),
    createXmlPipeline(),
    createMultiDbAggregation(),
    createAwsAzureEtl(),
  ];
}
