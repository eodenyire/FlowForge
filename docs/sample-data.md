# Sample Data Reference

FlowForge includes 6 pre-built datasets with 225+ records across all supported file formats.

## Datasets

### Customers (20 records)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique customer ID | `C001` |
| name | string | Full name | `Alice Johnson` |
| email | string | Email address | `alice@example.com` |
| city | string | City | `New York` |
| country | string | Country | `USA` |
| totalOrders | number | Lifetime order count | `47` |
| totalSpent | number | Lifetime spend (USD) | `12450.50` |
| segment | string | Customer segment | `Premium`, `Standard`, `VIP` |
| joinDate | string | Registration date | `2022-03-15` |

**Segments:** 5 VIP, 7 Premium, 8 Standard

### Products (20 records)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique product ID | `P001` |
| name | string | Product name | `Laptop Pro 15` |
| category | string | Product category | `Electronics` |
| price | number | Price (USD) | `1299.99` |
| stock | number | Current stock | `150` |
| supplier | string | Supplier name | `TechCorp` |
| weight | number | Weight (kg) | `2.1` |

**Categories:** Electronics (9), Furniture (3), Appliances (2), Office (2), Accessories (2)
**Suppliers:** TechCorp (6), AudioMax (2), ComfortPlus (2), and 8 others

### Orders (50 records)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Order ID | `ORD-00001` |
| customerId | string | Customer who placed order | `C001` |
| customerName | string | Customer name | `Alice Johnson` |
| productId | string | Product ordered | `P001` |
| productName | string | Product name | `Laptop Pro 15` |
| quantity | number | Quantity ordered | `3` |
| unitPrice | number | Unit price | `1299.99` |
| totalPrice | number | Total price | `3899.97` |
| status | string | Order status | `delivered` |
| orderDate | string | Order date | `2024-03-15` |
| region | string | Customer country | `USA` |
| paymentMethod | string | Payment method | `Credit Card` |

**Statuses:** pending, processing, shipped, delivered, cancelled (randomly distributed)
**Payment Methods:** Credit Card, PayPal, Bank Transfer, Crypto

### Employees (15 records)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Employee ID | `E001` |
| name | string | Full name | `Sarah Mitchell` |
| department | string | Department | `Engineering` |
| role | string | Job title | `Senior Developer` |
| salary | number | Annual salary (USD) | `125000` |
| hireDate | string | Hire date | `2020-03-15` |
| manager | string/null | Manager employee ID | `E010` |
| performance | number | Performance rating (1-5) | `4.8` |

**Departments:** Engineering (5), Sales (3), Finance (2), Marketing (2), HR (1), Executive (1)

### Transactions (100 records)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Transaction ID | `TXN-000001` |
| customerId | string | Customer | `C001` |
| type | string | Transaction type | `purchase` |
| amount | number | Amount (USD, negative for refunds) | `245.50` |
| currency | string | Currency | `USD` |
| timestamp | string | ISO timestamp | `2024-03-15T14:30:00Z` |
| status | string | Transaction status | `completed` |
| reference | string | Reference code | `A1B2C3D4` |

**Types:** purchase, refund, subscription, adjustment
**Statuses:** completed (90%), pending (10%)

### Inventory (20 records)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| productId | string | Product ID | `P001` |
| productName | string | Product name | `Laptop Pro 15` |
| warehouse | string | Warehouse location | `WH-East` |
| quantity | number | Current quantity | `150` |
| reorderLevel | number | Reorder threshold | `30` |
| lastRestocked | string | Last restock date | `2024-03-15` |
| unitCost | number | Unit cost (USD) | `779.99` |

**Warehouses:** WH-East, WH-West, WH-Central, WH-Intl

## File Formats

Sample data is generated in multiple formats:

### JSON Files (`data/samples/json/`)

| File | Records | Description |
|------|---------|-------------|
| `customers.json` | 20 | Array of customer objects |
| `products.json` | 20 | Array of product objects |
| `orders.json` | 50 | Array of order objects |
| `employees.json` | 15 | Array of employee objects |
| `transactions.json` | 100 | Array of transaction objects |
| `inventory.json` | 20 | Array of inventory objects |
| `customers.xml` | 20 | XML representation |
| `products.xml` | 20 | XML representation |

### CSV Files (`data/samples/csv/`)

| File | Records | Description |
|------|---------|-------------|
| `customers.csv` | 20 | Header row + 20 data rows |
| `products.csv` | 20 | Header row + 20 data rows |
| `orders.csv` | 50 | Header row + 50 data rows |
| `employees.csv` | 15 | Header row + 15 data rows |
| `transactions.csv` | 100 | Header row + 100 data rows |

### Excel Workbooks (`data/samples/excel/`)

| File | Sheets | Description |
|------|--------|-------------|
| `sales_report.xlsx.json` | Customers, Products, Orders | Sales data workbook |
| `hr_data.xlsx.json` | Employees, Transactions | HR and finance workbook |

Excel files are stored as JSON with structure:
```json
{
  "format": "xlsx",
  "sheets": [
    { "name": "Customers", "headers": [...], "rows": [...] },
    ...
  ]
}
```

### Parquet Files (`data/samples/parquet/`)

| File | Records | Description |
|------|---------|-------------|
| `customers.parquet.json` | 20 | Columnar customer data |
| `orders.parquet.json` | 50 | Columnar order data |
| `transactions.parquet.json` | 100 | Columnar transaction data |

Parquet files are stored as JSON with structure:
```json
{
  "format": "parquet",
  "encoding": "snappy",
  "rowCount": 20,
  "columns": ["id", "name", ...],
  "data": [...]
}
```

### PDF Reports (`data/samples/pdf/`)

| File | Description |
|------|-------------|
| `sales_report_q4.pdf.txt` | Q4 sales performance report |
| `hr_report_2024.pdf.txt` | HR department employee report |

PDF files are stored as formatted text with headers, sections, and data tables.

## Generating Sample Data

### Via UI

Click "Quick Setup" on the home page.

### Via API

```
POST /api/samples/generate
```

### Via Data Generator Processor

Use the `data-generator` processor in any workflow:
- `dataset: customers`
- `dataset: products`
- `dataset: orders`
- `dataset: employees`
- `dataset: transactions`
- `dataset: inventory`

## Output Directories

Generated outputs are stored in `data/outputs/`:

```
data/outputs/
├── json/         # JSON output files
├── csv/          # CSV output files
├── excel/        # Excel workbook JSON files
├── parquet/      # Parquet JSON files
├── xml/          # XML output files
├── pdf/          # PDF text report files
└── emails/       # Email queue logs
```
