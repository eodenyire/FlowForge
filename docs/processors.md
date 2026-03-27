# Processor Reference

Complete reference for all 30+ processors available in FlowForge, organized by category.

Each processor has:
- **Type**: The string identifier used in flow definitions
- **Category**: source, transform, sink, database, communication, or utility
- **Config Schema**: Fields the user can configure
- **Input Ports**: Where data enters the processor
- **Output Ports**: Where data exits the processor

---

## Source Processors

Source processors generate data from external sources. They have no input ports.

### JSON Input

| Property | Value |
|----------|-------|
| Type | `json-input` |
| Category | source |
| Description | Reads and parses a JSON data file into records |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| filePath | text | Yes | Path to JSON file (e.g., `data/samples/json/customers.json`) |

**Behavior:** Reads the file, parses JSON. If the root is an array, each element becomes a record. If it's an object, it becomes a single record.

---

### CSV Input

| Property | Value |
|----------|-------|
| Type | `csv-input` |
| Category | source |
| Description | Reads and parses a CSV data file into records |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| filePath | text | Yes | — | Path to CSV file (e.g., `data/samples/csv/customers.csv`) |
| delimiter | text | No | `,` | Column delimiter character |

**Behavior:** First row is treated as column headers. Each subsequent row becomes a record with header-mapped fields.

---

### Excel Input

| Property | Value |
|----------|-------|
| Type | `excel-input` |
| Category | source |
| Description | Reads Excel workbook files (.xlsx format stored as JSON) |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| filePath | text | Yes | Path to Excel workbook JSON (e.g., `data/samples/excel/sales_report.xlsx.json`) |
| sheetName | text | No | Specific sheet name; leave blank to read all sheets |

**Behavior:** Parses the workbook JSON structure. If sheetName is specified, reads only that sheet's rows. Otherwise, concatenates rows from all sheets.

---

### Parquet Input

| Property | Value |
|----------|-------|
| Type | `parquet-input` |
| Category | source |
| Description | Reads Parquet columnar data files (stored as JSON representation) |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| filePath | text | Yes | Path to Parquet JSON file (e.g., `data/samples/parquet/customers.parquet.json`) |

**Behavior:** Reads the JSON file and extracts the `.data` array as records.

---

### XML Input

| Property | Value |
|----------|-------|
| Type | `xml-input` |
| Category | source |
| Description | Reads and parses XML data files into records |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| filePath | text | Yes | — | Path to XML file (e.g., `data/samples/json/customers.xml`) |
| rootTag | text | Yes | `customers` | Root element tag name |
| itemTag | text | Yes | `customer` | Item element tag name |

**Behavior:** Finds all `<itemTag>...</itemTag>` elements within the file, extracts child elements as record fields.

---

### PDF/Report Input

| Property | Value |
|----------|-------|
| Type | `pdf-input` |
| Category | source |
| Description | Reads PDF text reports (stored as text files) |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| filePath | text | Yes | Path to PDF text file (e.g., `data/samples/pdf/sales_report_q4.pdf.txt`) |

**Behavior:** Reads the entire text file as a single record with fields: `text` (content), `source` (path), `type` ("pdf-text").

---

### File Input (Generic)

| Property | Value |
|----------|-------|
| Type | `file-input` |
| Category | source |
| Description | Generic file reader that supports JSON and CSV |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| filePath | text | Yes | — | Path to data file |
| fileType | select | Yes | `json` | File format: `json` or `csv` |

---

### Data Generator

| Property | Value |
|----------|-------|
| Type | `data-generator` |
| Category | utility |
| Description | Generates sample data from built-in datasets |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| dataset | select | Yes | `customers` | Dataset: `customers`, `products`, `orders`, `employees`, `transactions`, `inventory` |

---

## Transform Processors

Transform processors modify data flowing through the pipeline. They have one or more input ports and one or more output ports.

### JSON Transform

| Property | Value |
|----------|-------|
| Type | `json-transform` |
| Category | transform |
| Description | Rename, add, or remove fields from records |
| Inputs | `in` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mappings | textarea | No | Field rename mappings, one per line: `oldName:newName` |
| addFields | textarea | No | Fields to add, one per line: `fieldName:defaultValue` |
| removeFields | text | No | Comma-separated field names to remove |

---

### CSV Transform

| Property | Value |
|----------|-------|
| Type | `csv-transform` |
| Category | transform |
| Description | Convert between CSV text and JSON records |
| Inputs | `in` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| direction | select | Yes | `csv-to-json` | `csv-to-json` or `json-to-csv` |
| delimiter | text | No | `,` | Column delimiter |

---

### Filter

| Property | Value |
|----------|-------|
| Type | `filter` |
| Category | transform |
| Description | Filter records based on field conditions |
| Inputs | `in` |
| Outputs | `matched`, `unmatched` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| field | text | Yes | Field name to filter on |
| operator | select | Yes | `equals`, `not-equals`, `contains`, `gt`, `lt` |
| value | text | Yes | Value to compare against |

**Outputs:** Records passing the filter go to `matched`. Records failing go to `unmatched`.

---

### Sort

| Property | Value |
|----------|-------|
| Type | `sort` |
| Category | transform |
| Description | Sort records by a field |
| Inputs | `in` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| field | text | Yes | — | Field to sort by |
| order | select | Yes | `asc` | `asc` (ascending) or `desc` (descending) |

---

### Aggregate

| Property | Value |
|----------|-------|
| Type | `aggregate` |
| Category | transform |
| Description | Group records and compute aggregates |
| Inputs | `in` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| groupBy | text | Yes | — | Field to group by |
| operation | select | Yes | `count` | `count`, `sum`, `avg`, `min`, `max` |
| field | text | No | — | Field to aggregate (not needed for count) |

**Output:** Each group becomes a record with fields: `{groupBy}`, `_count`, and optionally `_sum`, `_avg`, `_min`, `_max`.

---

### Merge

| Property | Value |
|----------|-------|
| Type | `merge` |
| Category | transform |
| Description | Merge records from multiple input streams |
| Inputs | `in-a`, `in-b` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| strategy | select | Yes | `concat` | `concat` (concatenate) or `deep-merge` |

---

### Deduplicate

| Property | Value |
|----------|-------|
| Type | `deduplicate` |
| Category | transform |
| Description | Remove duplicate records by a key field |
| Inputs | `in` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| keyField | text | Yes | Field to use as uniqueness key |

**Output Metadata:** `originalCount`, `uniqueCount`

---

### Lookup/Enrich

| Property | Value |
|----------|-------|
| Type | `lookup` |
| Category | transform |
| Description | Enrich records by joining with a reference file |
| Inputs | `in` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| referencePath | text | Yes | Path to reference JSON file |
| joinKey | text | Yes | Field in input records to join on |
| referenceKey | text | Yes | Field in reference data to join on |

**Behavior:** Matches each input record to a reference record by key. Reference fields are prefixed with `ref_` and added to the input record.

---

### Script

| Property | Value |
|----------|-------|
| Type | `script` |
| Category | utility |
| Description | Execute a custom JavaScript expression on records |
| Inputs | `in` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| expression | textarea | Yes | JavaScript expression using `records` variable |

**Example:** `return records.filter(r => r.status === 'active')`

---

## Sink Processors

Sink processors write data to external destinations. They have input ports and no output ports.

### JSON Output

| Property | Value |
|----------|-------|
| Type | `json-output` |
| Category | sink |
| Description | Writes records to a JSON file |
| Inputs | `in` |
| Outputs | None |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| filePath | text | Yes | Output file path (e.g., `data/outputs/json/output.json`) |

---

### CSV Output

| Property | Value |
|----------|-------|
| Type | `csv-output` |
| Category | sink |
| Description | Writes records to a CSV file |
| Inputs | `in` |
| Outputs | None |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| filePath | text | Yes | — | Output file path |
| delimiter | text | No | `,` | Column delimiter |

---

### Excel Output

| Property | Value |
|----------|-------|
| Type | `excel-output` |
| Category | sink |
| Description | Writes records to an Excel workbook (JSON representation) |
| Inputs | `in` |
| Outputs | None |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| filePath | text | Yes | — | Output file path |
| sheetName | text | No | `Sheet1` | Sheet name |

---

### Parquet Output

| Property | Value |
|----------|-------|
| Type | `parquet-output` |
| Category | sink |
| Description | Writes records to a Parquet file (JSON representation) |
| Inputs | `in` |
| Outputs | None |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| filePath | text | Yes | Output file path |

---

### XML Output

| Property | Value |
|----------|-------|
| Type | `xml-output` |
| Category | sink |
| Description | Writes records to an XML file |
| Inputs | `in` |
| Outputs | None |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| filePath | text | Yes | — | Output file path |
| rootTag | text | Yes | `data` | Root element tag |
| itemTag | text | Yes | `record` | Item element tag |

---

### PDF Report Output

| Property | Value |
|----------|-------|
| Type | `pdf-output` |
| Category | sink |
| Description | Generates a text-based report file from records |
| Inputs | `in` |
| Outputs | None |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| filePath | text | Yes | — | Output file path |
| title | text | Yes | `Report` | Report title |

**Output Format:** Text file with header, column names, row data (up to 20 rows), and summary.

---

## Database Processors

Database processors interact with the file-backed database system.

### Database Query

| Property | Value |
|----------|-------|
| Type | `db-query` |
| Category | database |
| Description | Query rows from a database table |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| connectionId | text | Yes | — | Database connection UUID |
| tableName | text | Yes | — | Table to query |
| limit | number | No | 1000 | Max rows to return |
| offset | number | No | 0 | Row offset |

---

### Create Table

| Property | Value |
|----------|-------|
| Type | `db-create-table` |
| Category | database |
| Description | Create a database table with column definitions |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| connectionId | text | Yes | Database connection UUID |
| tableName | text | Yes | Table name to create |
| columnDefinitions | textarea | Yes | Column definitions, one per line: `name:type` (e.g., `id:string\nname:string\nemail:string`) |

---

### Insert to Database

| Property | Value |
|----------|-------|
| Type | `db-insert` |
| Category | database |
| Description | Insert input records into a database table |
| Inputs | `in` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| connectionId | text | Yes | Database connection UUID |
| tableName | text | Yes | Target table name |

---

### Upsert to Database

| Property | Value |
|----------|-------|
| Type | `db-upsert` |
| Category | database |
| Description | Insert or update records in a database table |
| Inputs | `in` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| connectionId | text | Yes | Database connection UUID |
| tableName | text | Yes | Target table name |
| keyField | text | Yes | Field to match for updates |

---

### Delete from Database

| Property | Value |
|----------|-------|
| Type | `db-delete` |
| Category | database |
| Description | Delete records from a database table |
| Inputs | None |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| connectionId | text | Yes | Database connection UUID |
| tableName | text | Yes | Target table name |
| keyField | text | Yes | Field to match |
| keyValue | text | Yes | Value to match |

---

## Communication Processors

### Send Email

| Property | Value |
|----------|-------|
| Type | `email-send` |
| Category | communication |
| Description | Queue an email with data attachment |
| Inputs | `in` |
| Outputs | None |

**Configuration:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| to | text | Yes | Recipient email address |
| subject | text | Yes | Email subject |
| body | textarea | No | Email body text |
| format | select | Yes | Attachment format: `csv`, `json`, `xlsx` |

**Behavior:** Queues an email log entry to `data/outputs/emails/`. In production, this would trigger an actual email send.

---

### Webhook

| Property | Value |
|----------|-------|
| Type | `webhook` |
| Category | communication |
| Description | Send data to a webhook URL |
| Inputs | `in` |
| Outputs | None |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| url | text | Yes | — | Webhook URL |
| method | select | Yes | `POST` | HTTP method: `POST`, `PUT` |

---

## Utility Processors

### Log

| Property | Value |
|----------|-------|
| Type | `log` |
| Category | utility |
| Description | Log data to console for debugging |
| Inputs | `in` |
| Outputs | `out` |

**Configuration:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| label | text | No | `Data Log` | Label for log output |

**Behavior:** Logs the first 3 records and total count to console. Passes data through unchanged.
