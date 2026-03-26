import { NextResponse } from "next/server";
import { getAllWorkflowTemplates } from "@/lib/workflows/templates";
import { createFlow } from "@/lib/store";
import { generateAllSampleFiles } from "@/lib/data/sample-files";
import { createConnection } from "@/lib/data/database-manager";
import type { DatabaseType } from "@/lib/data/database-manager";

const defaultDatabases: { name: string; type: DatabaseType; database: string }[] = [
  { name: "MySQL Production", type: "mysql", database: "ecommerce" },
  { name: "PostgreSQL Analytics", type: "postgresql", database: "analytics" },
  { name: "MSSQL Enterprise", type: "mssql", database: "enterprise" },
  { name: "Oracle Warehouse", type: "oracle", database: "warehouse" },
  { name: "MongoDB NoSQL", type: "mongodb", database: "documents" },
  { name: "Cassandra TimeSeries", type: "cassandra", database: "timeseries" },
  { name: "Neo4j Graph", type: "neo4j", database: "graphdb" },
  { name: "Google Cloud SQL", type: "gcp-sql", database: "gcp_ecommerce" },
  { name: "Google BigQuery", type: "gcp-bigquery", database: "analytics_lake" },
  { name: "AWS RDS PostgreSQL", type: "aws-rds", database: "rds_analytics" },
  { name: "AWS DynamoDB", type: "aws-dynamodb", database: "nosql_store" },
  { name: "AWS Redshift", type: "aws-redshift", database: "data_warehouse" },
  { name: "Azure SQL Database", type: "azure-sql", database: "azure_ecommerce" },
  { name: "Azure Cosmos DB", type: "azure-cosmos", database: "cosmos_store" },
];

export async function POST() {
  try {
    // 1. Generate sample files
    const files = await generateAllSampleFiles();

    // 2. Create database connections
    const connections = [];
    for (const db of defaultDatabases) {
      const conn = await createConnection({
        ...db,
        host: "",
        port: 0,
        username: "",
        password: "",
        ssl: false,
        metadata: {},
      });
      connections.push(conn);
    }

    // 3. Create workflow templates
    const templates = getAllWorkflowTemplates();
    const workflows = [];
    for (const template of templates) {
      const flow = await createFlow(template);
      workflows.push(flow);
    }

    return NextResponse.json({
      message: "Environment setup complete",
      sampleFiles: files.length,
      databases: connections.length,
      workflows: workflows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Setup failed" },
      { status: 500 }
    );
  }
}
