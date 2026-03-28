import type { ProcessorDefinition, ProcessorType } from "@/lib/types";

function inputPort(id = "in") { return [{ id, name: "Input", type: "input" as const }]; }
function outputPort(id = "out") { return [{ id, name: "Output", type: "output" as const }]; }
function noPorts() { return []; }

export const processorDefinitions: Record<ProcessorType, ProcessorDefinition> = {
  "file-input": {
    type: "file-input", name: "File Input", description: "Reads data from JSON or CSV files",
    category: "source", icon: "file-input",
    defaultConfig: { filePath: "", fileType: "json" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/samples/json/customers.json" },
      { key: "fileType", label: "File Type", type: "select", required: true, defaultValue: "json", options: [{ label: "JSON", value: "json" }, { label: "CSV", value: "csv" }] },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "json-input": {
    type: "json-input", name: "JSON Input", description: "Reads JSON data files",
    category: "source", icon: "json",
    defaultConfig: { filePath: "data/samples/json/customers.json" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/samples/json/customers.json" },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "csv-input": {
    type: "csv-input", name: "CSV Input", description: "Reads CSV data files",
    category: "source", icon: "csv",
    defaultConfig: { filePath: "data/samples/csv/customers.csv", delimiter: "," },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/samples/csv/customers.csv" },
      { key: "delimiter", label: "Delimiter", type: "text", required: false, defaultValue: "," },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "excel-input": {
    type: "excel-input", name: "Excel Input", description: "Reads Excel workbook files (.xlsx)",
    category: "source", icon: "excel",
    defaultConfig: { filePath: "data/samples/excel/sales_report.xlsx.json", sheetName: "" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/samples/excel/sales_report.xlsx.json" },
      { key: "sheetName", label: "Sheet Name (blank=all)", type: "text", required: false, placeholder: "Customers" },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "parquet-input": {
    type: "parquet-input", name: "Parquet Input", description: "Reads Parquet columnar data files",
    category: "source", icon: "parquet",
    defaultConfig: { filePath: "data/samples/parquet/customers.parquet.json" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/samples/parquet/customers.parquet.json" },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "xml-input": {
    type: "xml-input", name: "XML Input", description: "Reads XML data files",
    category: "source", icon: "xml",
    defaultConfig: { filePath: "data/samples/json/customers.xml", rootTag: "customers", itemTag: "customer" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/samples/json/customers.xml" },
      { key: "rootTag", label: "Root Tag", type: "text", required: true, defaultValue: "customers" },
      { key: "itemTag", label: "Item Tag", type: "text", required: true, defaultValue: "customer" },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "pdf-input": {
    type: "pdf-input", name: "PDF/Report Input", description: "Reads PDF text reports",
    category: "source", icon: "pdf",
    defaultConfig: { filePath: "data/samples/pdf/sales_report_q4.pdf.txt" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/samples/pdf/sales_report_q4.pdf.txt" },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "file-output": {
    type: "file-output", name: "File Output", description: "Writes data to JSON or CSV files",
    category: "sink", icon: "file-output",
    defaultConfig: { filePath: "", fileType: "json" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/outputs/json/output.json" },
      { key: "fileType", label: "File Type", type: "select", required: true, defaultValue: "json", options: [{ label: "JSON", value: "json" }, { label: "CSV", value: "csv" }] },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "json-output": {
    type: "json-output", name: "JSON Output", description: "Writes data to JSON files",
    category: "sink", icon: "json",
    defaultConfig: { filePath: "data/outputs/json/output.json" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/outputs/json/output.json" },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "csv-output": {
    type: "csv-output", name: "CSV Output", description: "Writes data to CSV files",
    category: "sink", icon: "csv",
    defaultConfig: { filePath: "data/outputs/csv/output.csv", delimiter: "," },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/outputs/csv/output.csv" },
      { key: "delimiter", label: "Delimiter", type: "text", required: false, defaultValue: "," },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "excel-output": {
    type: "excel-output", name: "Excel Output", description: "Writes data to Excel workbook files",
    category: "sink", icon: "excel",
    defaultConfig: { filePath: "data/outputs/excel/output.xlsx.json", sheetName: "Sheet1" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/outputs/excel/output.xlsx.json" },
      { key: "sheetName", label: "Sheet Name", type: "text", required: false, defaultValue: "Sheet1" },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "parquet-output": {
    type: "parquet-output", name: "Parquet Output", description: "Writes data to Parquet columnar files",
    category: "sink", icon: "parquet",
    defaultConfig: { filePath: "data/outputs/parquet/output.parquet.json" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/outputs/parquet/output.parquet.json" },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "xml-output": {
    type: "xml-output", name: "XML Output", description: "Writes data to XML files",
    category: "sink", icon: "xml",
    defaultConfig: { filePath: "data/outputs/xml/output.xml", rootTag: "data", itemTag: "record" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/outputs/xml/output.xml" },
      { key: "rootTag", label: "Root Tag", type: "text", required: true, defaultValue: "data" },
      { key: "itemTag", label: "Item Tag", type: "text", required: true, defaultValue: "record" },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "pdf-output": {
    type: "pdf-output", name: "PDF Report Output", description: "Generates text-based report files",
    category: "sink", icon: "pdf",
    defaultConfig: { filePath: "data/outputs/pdf/report.pdf.txt", title: "Report" },
    configSchema: [
      { key: "filePath", label: "File Path", type: "text", required: true, placeholder: "data/outputs/pdf/report.pdf.txt" },
      { key: "title", label: "Report Title", type: "text", required: true, defaultValue: "Report" },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "json-transform": {
    type: "json-transform", name: "JSON Transform", description: "Rename, add, or remove JSON fields",
    category: "transform", icon: "json-transform",
    defaultConfig: { mappings: "", addFields: "", removeFields: "" },
    configSchema: [
      { key: "mappings", label: "Field Mappings (old:new)", type: "textarea", required: false, placeholder: "oldField:newField\nanotherOld:anotherNew" },
      { key: "addFields", label: "Add Fields (key:value)", type: "textarea", required: false, placeholder: "newField:defaultValue" },
      { key: "removeFields", label: "Remove Fields", type: "text", required: false, placeholder: "field1,field2" },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  "csv-transform": {
    type: "csv-transform", name: "CSV Transform", description: "Convert between CSV and JSON formats",
    category: "transform", icon: "csv-transform",
    defaultConfig: { direction: "csv-to-json", delimiter: "," },
    configSchema: [
      { key: "direction", label: "Direction", type: "select", required: true, defaultValue: "csv-to-json", options: [{ label: "CSV to JSON", value: "csv-to-json" }, { label: "JSON to CSV", value: "json-to-csv" }] },
      { key: "delimiter", label: "Delimiter", type: "text", required: false, defaultValue: "," },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  filter: {
    type: "filter", name: "Filter", description: "Filter records based on field conditions",
    category: "transform", icon: "filter",
    defaultConfig: { field: "", operator: "equals", value: "" },
    configSchema: [
      { key: "field", label: "Field Name", type: "text", required: true, placeholder: "status" },
      { key: "operator", label: "Operator", type: "select", required: true, defaultValue: "equals", options: [{ label: "Equals", value: "equals" }, { label: "Not Equals", value: "not-equals" }, { label: "Contains", value: "contains" }, { label: "Greater Than", value: "gt" }, { label: "Less Than", value: "lt" }] },
      { key: "value", label: "Value", type: "text", required: true, placeholder: "active" },
    ],
    inputs: inputPort(), outputs: [{ id: "matched", name: "Matched", type: "output" }, { id: "unmatched", name: "Unmatched", type: "output" }],
  },
  merge: {
    type: "merge", name: "Merge", description: "Merge records from multiple inputs",
    category: "transform", icon: "merge",
    defaultConfig: { strategy: "concat" },
    configSchema: [
      { key: "strategy", label: "Strategy", type: "select", required: true, defaultValue: "concat", options: [{ label: "Concatenate", value: "concat" }, { label: "Deep Merge", value: "deep-merge" }] },
    ],
    inputs: [{ id: "in-a", name: "Input A", type: "input" }, { id: "in-b", name: "Input B", type: "input" }],
    outputs: outputPort(),
  },
  aggregate: {
    type: "aggregate", name: "Aggregate", description: "Aggregate data with group-by and sum/count/avg",
    category: "transform", icon: "aggregate",
    defaultConfig: { groupBy: "", operation: "count", field: "" },
    configSchema: [
      { key: "groupBy", label: "Group By Field", type: "text", required: true, placeholder: "category" },
      { key: "operation", label: "Operation", type: "select", required: true, defaultValue: "count", options: [{ label: "Count", value: "count" }, { label: "Sum", value: "sum" }, { label: "Average", value: "avg" }, { label: "Min", value: "min" }, { label: "Max", value: "max" }] },
      { key: "field", label: "Value Field", type: "text", required: false, placeholder: "amount" },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  sort: {
    type: "sort", name: "Sort", description: "Sort records by a field",
    category: "transform", icon: "sort",
    defaultConfig: { field: "", order: "asc" },
    configSchema: [
      { key: "field", label: "Sort Field", type: "text", required: true, placeholder: "name" },
      { key: "order", label: "Order", type: "select", required: true, defaultValue: "asc", options: [{ label: "Ascending", value: "asc" }, { label: "Descending", value: "desc" }] },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  deduplicate: {
    type: "deduplicate", name: "Deduplicate", description: "Remove duplicate records by key field",
    category: "transform", icon: "deduplicate",
    defaultConfig: { keyField: "" },
    configSchema: [
      { key: "keyField", label: "Key Field", type: "text", required: true, placeholder: "id" },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  lookup: {
    type: "lookup", name: "Lookup/Enrich", description: "Enrich records by looking up values from a reference file",
    category: "transform", icon: "lookup",
    defaultConfig: { referencePath: "", joinKey: "", referenceKey: "" },
    configSchema: [
      { key: "referencePath", label: "Reference File", type: "text", required: true, placeholder: "data/samples/json/products.json" },
      { key: "joinKey", label: "Join Key (input)", type: "text", required: true, placeholder: "productId" },
      { key: "referenceKey", label: "Reference Key", type: "text", required: true, placeholder: "id" },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  "db-query": {
    type: "db-query", name: "Database Query", description: "Query data from a database table",
    category: "database", icon: "database",
    defaultConfig: { connectionId: "", tableName: "", limit: "1000", offset: "0" },
    configSchema: [
      { key: "connectionId", label: "Connection ID", type: "text", required: true, placeholder: "Database connection UUID" },
      { key: "tableName", label: "Table Name", type: "text", required: true, placeholder: "customers" },
      { key: "limit", label: "Limit", type: "number", required: false, defaultValue: "1000" },
      { key: "offset", label: "Offset", type: "number", required: false, defaultValue: "0" },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "db-create-table": {
    type: "db-create-table", name: "Create Table", description: "Create a database table from input schema",
    category: "database", icon: "database",
    defaultConfig: { connectionId: "", tableName: "", columnDefinitions: "" },
    configSchema: [
      { key: "connectionId", label: "Connection ID", type: "text", required: true, placeholder: "Database connection UUID" },
      { key: "tableName", label: "Table Name", type: "text", required: true, placeholder: "customers" },
      { key: "columnDefinitions", label: "Columns (name:type per line)", type: "textarea", required: true, placeholder: "id:string\nname:string\nemail:string" },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "db-insert": {
    type: "db-insert", name: "Insert to Database", description: "Insert records into a database table",
    category: "database", icon: "database",
    defaultConfig: { connectionId: "", tableName: "" },
    configSchema: [
      { key: "connectionId", label: "Connection ID", type: "text", required: true, placeholder: "Database connection UUID" },
      { key: "tableName", label: "Table Name", type: "text", required: true, placeholder: "customers" },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  "db-upsert": {
    type: "db-upsert", name: "Upsert to Database", description: "Insert or update records in a database table",
    category: "database", icon: "database",
    defaultConfig: { connectionId: "", tableName: "", keyField: "" },
    configSchema: [
      { key: "connectionId", label: "Connection ID", type: "text", required: true, placeholder: "Database connection UUID" },
      { key: "tableName", label: "Table Name", type: "text", required: true, placeholder: "customers" },
      { key: "keyField", label: "Key Field", type: "text", required: true, placeholder: "id" },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  "db-delete": {
    type: "db-delete", name: "Delete from Database", description: "Delete records from a database table",
    category: "database", icon: "database",
    defaultConfig: { connectionId: "", tableName: "", keyField: "", keyValue: "" },
    configSchema: [
      { key: "connectionId", label: "Connection ID", type: "text", required: true, placeholder: "Database connection UUID" },
      { key: "tableName", label: "Table Name", type: "text", required: true, placeholder: "customers" },
      { key: "keyField", label: "Key Field", type: "text", required: true, placeholder: "id" },
      { key: "keyValue", label: "Key Value", type: "text", required: true, placeholder: "C001" },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "email-send": {
    type: "email-send", name: "Send Email", description: "Send data via email as attachment",
    category: "communication", icon: "email",
    defaultConfig: { to: "", subject: "", body: "", format: "csv" },
    configSchema: [
      { key: "to", label: "Recipient", type: "text", required: true, placeholder: "user@example.com" },
      { key: "subject", label: "Subject", type: "text", required: true, placeholder: "Data Export" },
      { key: "body", label: "Body", type: "textarea", required: false, placeholder: "Please find attached the data export." },
      { key: "format", label: "Attachment Format", type: "select", required: true, defaultValue: "csv", options: [{ label: "CSV", value: "csv" }, { label: "JSON", value: "json" }, { label: "Excel", value: "xlsx" }] },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  webhook: {
    type: "webhook", name: "Webhook", description: "Send data to a webhook URL",
    category: "communication", icon: "webhook",
    defaultConfig: { url: "", method: "POST" },
    configSchema: [
      { key: "url", label: "URL", type: "text", required: true, placeholder: "https://api.example.com/webhook" },
      { key: "method", label: "Method", type: "select", required: true, defaultValue: "POST", options: [{ label: "POST", value: "POST" }, { label: "PUT", value: "PUT" }] },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "data-generator": {
    type: "data-generator", name: "Data Generator", description: "Generate sample data for testing",
    category: "utility", icon: "generator",
    defaultConfig: { dataset: "customers" },
    configSchema: [
      { key: "dataset", label: "Dataset", type: "select", required: true, defaultValue: "customers", options: [
        { label: "Customers", value: "customers" }, { label: "Products", value: "products" },
        { label: "Orders", value: "orders" }, { label: "Employees", value: "employees" },
        { label: "Transactions", value: "transactions" }, { label: "Inventory", value: "inventory" },
      ] },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  log: {
    type: "log", name: "Log", description: "Log data to console for debugging",
    category: "utility", icon: "log",
    defaultConfig: { label: "Data Log" },
    configSchema: [
      { key: "label", label: "Log Label", type: "text", required: false, defaultValue: "Data Log" },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  script: {
    type: "script", name: "Script", description: "Run a custom JavaScript expression on data",
    category: "utility", icon: "script",
    defaultConfig: { expression: "return records" },
    configSchema: [
      { key: "expression", label: "Expression (use 'records')", type: "textarea", required: true, placeholder: "return records.map(r => ({ ...r, processed: true }))" },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  // Multi-language script transforms
  "sql-transform": {
    type: "sql-transform", name: "SQL Transform", description: "Transform data using SQL queries against a database connection",
    category: "transform", icon: "sql",
    defaultConfig: { connectionId: "", query: "", outputTable: "_flowforge_result" },
    configSchema: [
      { key: "connectionId", label: "Database Connection", type: "text", required: true, placeholder: "Select or enter connection ID" },
      { key: "query", label: "SQL Query", type: "textarea", required: true, placeholder: "SELECT * FROM input_data WHERE amount > 1000\n-- Use :input to reference input data\n-- SELECT * FROM :input WHERE status = 'active'" },
      { key: "outputTable", label: "Output Table Name", type: "text", required: false, defaultValue: "_flowforge_result", placeholder: "_flowforge_result" },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  "python-script": {
    type: "python-script", name: "Python Script", description: "Transform data using Python code (pandas-compatible)",
    category: "transform", icon: "python",
    defaultConfig: { code: "import pandas as pd\n\ndef transform(records):\n    df = pd.DataFrame(records)\n    # Add your transformation logic here\n    return df.to_dict('records')", timeout: 60 },
    configSchema: [
      { key: "code", label: "Python Code", type: "textarea", required: true, placeholder: "import pandas as pd\n\ndef transform(records):\n    df = pd.DataFrame(records)\n    df['processed'] = True\n    return df.to_dict('records')" },
      { key: "timeout", label: "Timeout (seconds)", type: "number", required: false, defaultValue: 60 },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  "ruby-script": {
    type: "ruby-script", name: "Ruby Script", description: "Transform data using Ruby code",
    category: "transform", icon: "ruby",
    defaultConfig: { code: "# Transform records array\nrecords.map do |record|\n  record.merge('processed' => true)\nend", timeout: 60 },
    configSchema: [
      { key: "code", label: "Ruby Code", type: "textarea", required: true, placeholder: "# records is an array of hashes\nrecords.map do |record|\n  record.merge('transformed' => true)\nend" },
      { key: "timeout", label: "Timeout (seconds)", type: "number", required: false, defaultValue: 60 },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  "scala-script": {
    type: "scala-script", name: "Scala Script", description: "Transform data using Scala code (Spark-compatible)",
    category: "transform", icon: "scala",
    defaultConfig: { code: "// Transform using Scala\nval transformed = records.map(r => r + (\"processed\" -> true))", timeout: 120 },
    configSchema: [
      { key: "code", label: "Scala Code", type: "textarea", required: true, placeholder: "// records: List[Map[String, Any]]\nval transformed = records.map(r => r + (\"processed\" -> true))\ntransformed" },
      { key: "connectionId", label: "Spark Connection (optional)", type: "text", required: false, placeholder: "Spark cluster connection ID" },
      { key: "timeout", label: "Timeout (seconds)", type: "number", required: false, defaultValue: 120 },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  "java-script": {
    type: "java-script", name: "Java Script", description: "Transform data using Java code",
    category: "transform", icon: "java",
    defaultConfig: { code: "// Transform records using Java\nfor (Map<String, Object> record : records) {\n    record.put(\"processed\", true);\n}", timeout: 120 },
    configSchema: [
      { key: "code", label: "Java Code", type: "textarea", required: true, placeholder: "// records is List<Map<String, Object>>\nfor (Map<String, Object> record : records) {\n    record.put(\"transformed\", true);\n}\nreturn records;" },
      { key: "timeout", label: "Timeout (seconds)", type: "number", required: false, defaultValue: 120 },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  "r-script": {
    type: "r-script", name: "R Script", description: "Transform data using R code (tidyverse-compatible)",
    category: "transform", icon: "r",
    defaultConfig: { code: "library(dplyr)\n\ntransform <- function(records) {\n  records %>% mutate(processed = TRUE)\n}", timeout: 60 },
    configSchema: [
      { key: "code", label: "R Code", type: "textarea", required: true, placeholder: "library(dplyr)\n\ntransform <- function(records) {\n  records %>%\n    mutate(processed = TRUE) %>%\n    filter(!is.na(value))\n}" },
      { key: "timeout", label: "Timeout (seconds)", type: "number", required: false, defaultValue: 60 },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  // Remote file operations
  "ftp-upload": {
    type: "ftp-upload", name: "FTP Upload", description: "Upload data as a file to an FTP server",
    category: "sink", icon: "ftp",
    defaultConfig: { connectionId: "", remotePath: "/output/data.csv", format: "csv" },
    configSchema: [
      { key: "connectionId", label: "FTP Connection", type: "text", required: true, placeholder: "FTP connection ID" },
      { key: "remotePath", label: "Remote Path", type: "text", required: true, placeholder: "/output/data.csv" },
      { key: "format", label: "File Format", type: "select", required: true, defaultValue: "csv", options: [{ label: "CSV", value: "csv" }, { label: "JSON", value: "json" }, { label: "Excel", value: "xlsx" }] },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "ftp-download": {
    type: "ftp-download", name: "FTP Download", description: "Download a file from an FTP server",
    category: "source", icon: "ftp",
    defaultConfig: { connectionId: "", remotePath: "/input/data.csv", fileType: "csv" },
    configSchema: [
      { key: "connectionId", label: "FTP Connection", type: "text", required: true, placeholder: "FTP connection ID" },
      { key: "remotePath", label: "Remote Path", type: "text", required: true, placeholder: "/input/data.csv" },
      { key: "fileType", label: "File Type", type: "select", required: true, defaultValue: "csv", options: [{ label: "CSV", value: "csv" }, { label: "JSON", value: "json" }] },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "sftp-upload": {
    type: "sftp-upload", name: "SFTP Upload", description: "Upload data as a file to an SFTP server",
    category: "sink", icon: "sftp",
    defaultConfig: { connectionId: "", remotePath: "/output/data.csv", format: "csv" },
    configSchema: [
      { key: "connectionId", label: "SFTP Connection", type: "text", required: true, placeholder: "SFTP connection ID" },
      { key: "remotePath", label: "Remote Path", type: "text", required: true, placeholder: "/output/data.csv" },
      { key: "format", label: "File Format", type: "select", required: true, defaultValue: "csv", options: [{ label: "CSV", value: "csv" }, { label: "JSON", value: "json" }, { label: "Excel", value: "xlsx" }] },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "sftp-download": {
    type: "sftp-download", name: "SFTP Download", description: "Download a file from an SFTP server",
    category: "source", icon: "sftp",
    defaultConfig: { connectionId: "", remotePath: "/input/data.csv", fileType: "csv" },
    configSchema: [
      { key: "connectionId", label: "SFTP Connection", type: "text", required: true, placeholder: "SFTP connection ID" },
      { key: "remotePath", label: "Remote Path", type: "text", required: true, placeholder: "/input/data.csv" },
      { key: "fileType", label: "File Type", type: "select", required: true, defaultValue: "csv", options: [{ label: "CSV", value: "csv" }, { label: "JSON", value: "json" }] },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "s3-read": {
    type: "s3-read", name: "S3 Read", description: "Read data from an S3 bucket",
    category: "source", icon: "s3",
    defaultConfig: { connectionId: "", objectKey: "data/input.csv", fileType: "csv" },
    configSchema: [
      { key: "connectionId", label: "S3 Connection", type: "text", required: true, placeholder: "S3 connection ID" },
      { key: "objectKey", label: "Object Key", type: "text", required: true, placeholder: "data/input.csv" },
      { key: "fileType", label: "File Type", type: "select", required: true, defaultValue: "csv", options: [{ label: "CSV", value: "csv" }, { label: "JSON", value: "json" }, { label: "Parquet", value: "parquet" }] },
    ],
    inputs: noPorts(), outputs: outputPort(),
  },
  "s3-write": {
    type: "s3-write", name: "S3 Write", description: "Write data to an S3 bucket",
    category: "sink", icon: "s3",
    defaultConfig: { connectionId: "", objectKey: "data/output.csv", format: "csv" },
    configSchema: [
      { key: "connectionId", label: "S3 Connection", type: "text", required: true, placeholder: "S3 connection ID" },
      { key: "objectKey", label: "Object Key", type: "text", required: true, placeholder: "data/output.csv" },
      { key: "format", label: "Format", type: "select", required: true, defaultValue: "csv", options: [{ label: "CSV", value: "csv" }, { label: "JSON", value: "json" }, { label: "Parquet", value: "parquet" }] },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
  "api-call": {
    type: "api-call", name: "API Call", description: "Call an API endpoint and process the response",
    category: "communication", icon: "api",
    defaultConfig: { connectionId: "", endpoint: "/data", method: "GET", bodyTemplate: "" },
    configSchema: [
      { key: "connectionId", label: "API Connection", type: "text", required: true, placeholder: "API connection ID" },
      { key: "endpoint", label: "Endpoint Path", type: "text", required: true, placeholder: "/api/v1/data" },
      { key: "method", label: "HTTP Method", type: "select", required: true, defaultValue: "GET", options: [{ label: "GET", value: "GET" }, { label: "POST", value: "POST" }, { label: "PUT", value: "PUT" }, { label: "DELETE", value: "DELETE" }] },
      { key: "bodyTemplate", label: "Request Body Template (JSON)", type: "textarea", required: false, placeholder: '{"data": {{records}} }' },
    ],
    inputs: inputPort(), outputs: outputPort(),
  },
  "api-response": {
    type: "api-response", name: "API Response", description: "Return data as an API response",
    category: "communication", icon: "api",
    defaultConfig: { statusCode: 200, contentType: "application/json" },
    configSchema: [
      { key: "statusCode", label: "Status Code", type: "number", required: false, defaultValue: 200 },
      { key: "contentType", label: "Content Type", type: "select", required: true, defaultValue: "application/json", options: [{ label: "JSON", value: "application/json" }, { label: "CSV", value: "text/csv" }, { label: "XML", value: "application/xml" }] },
    ],
    inputs: inputPort(), outputs: noPorts(),
  },
};

export function getProcessorDefinition(type: ProcessorType): ProcessorDefinition {
  return processorDefinitions[type];
}

export function getAllProcessorDefinitions(): ProcessorDefinition[] {
  return Object.values(processorDefinitions);
}
