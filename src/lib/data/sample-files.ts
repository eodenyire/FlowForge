import { writeJsonFile, writeTextFile } from "./file-store";
import { customers, products, orders, employees, transactions, inventory } from "./sample-data";

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      headers
        .map((h) => {
          const val = row[h];
          if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return String(val ?? "");
        })
        .join(",")
    );
  }
  return lines.join("\n");
}

function toXml(rootTag: string, items: Record<string, unknown>[], itemTag: string): string {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', `<${rootTag}>`];
  for (const item of items) {
    lines.push(`  <${itemTag}>`);
    for (const [key, value] of Object.entries(item)) {
      const safeValue = String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      lines.push(`    <${key}>${safeValue}</${key}>`);
    }
    lines.push(`  </${itemTag}>`);
  }
  lines.push(`</${rootTag}>`);
  return lines.join("\n");
}

function toParquetJson(data: Record<string, unknown>[]): string {
  return JSON.stringify({ format: "parquet", encoding: "snappy", rowCount: data.length, columns: data.length > 0 ? Object.keys(data[0]) : [], data }, null, 2);
}

export async function generateAllSampleFiles() {
  const results: string[] = [];

  // === JSON Files ===
  await writeJsonFile("samples/json/customers.json", customers);
  results.push("samples/json/customers.json");

  await writeJsonFile("samples/json/products.json", products);
  results.push("samples/json/products.json");

  await writeJsonFile("samples/json/orders.json", orders);
  results.push("samples/json/orders.json");

  await writeJsonFile("samples/json/employees.json", employees);
  results.push("samples/json/employees.json");

  await writeJsonFile("samples/json/transactions.json", transactions);
  results.push("samples/json/transactions.json");

  await writeJsonFile("samples/json/inventory.json", inventory);
  results.push("samples/json/inventory.json");

  // === CSV Files ===
  const customerHeaders = ["id", "name", "email", "city", "country", "totalOrders", "totalSpent", "segment", "joinDate"];
  await writeTextFile("samples/csv/customers.csv", toCsv(customerHeaders, customers as unknown as Record<string, unknown>[]));
  results.push("samples/csv/customers.csv");

  const productHeaders = ["id", "name", "category", "price", "stock", "supplier", "weight"];
  await writeTextFile("samples/csv/products.csv", toCsv(productHeaders, products as unknown as Record<string, unknown>[]));
  results.push("samples/csv/products.csv");

  const orderHeaders = ["id", "customerId", "customerName", "productId", "productName", "quantity", "unitPrice", "totalPrice", "status", "orderDate", "region", "paymentMethod"];
  await writeTextFile("samples/csv/orders.csv", toCsv(orderHeaders, orders as unknown as Record<string, unknown>[]));
  results.push("samples/csv/orders.csv");

  const employeeHeaders = ["id", "name", "department", "role", "salary", "hireDate", "manager", "performance"];
  await writeTextFile("samples/csv/employees.csv", toCsv(employeeHeaders, employees as unknown as Record<string, unknown>[]));
  results.push("samples/csv/employees.csv");

  const txnHeaders = ["id", "customerId", "type", "amount", "currency", "timestamp", "status", "reference"];
  await writeTextFile("samples/csv/transactions.csv", toCsv(txnHeaders, transactions as unknown as Record<string, unknown>[]));
  results.push("samples/csv/transactions.csv");

  // === Excel-style JSON (structured as sheets) ===
  const excelWorkbook = {
    format: "xlsx",
    sheets: [
      { name: "Customers", headers: customerHeaders, rows: customers },
      { name: "Products", headers: productHeaders, rows: products },
      { name: "Orders", headers: orderHeaders, rows: orders },
    ],
  };
  await writeJsonFile("samples/excel/sales_report.xlsx.json", excelWorkbook);
  results.push("samples/excel/sales_report.xlsx.json");

  const hrWorkbook = {
    format: "xlsx",
    sheets: [
      { name: "Employees", headers: employeeHeaders, rows: employees },
      { name: "Transactions", headers: txnHeaders, rows: transactions },
    ],
  };
  await writeJsonFile("samples/excel/hr_data.xlsx.json", hrWorkbook);
  results.push("samples/excel/hr_data.xlsx.json");

  // === Parquet-style JSON ===
  await writeTextFile("samples/parquet/customers.parquet.json", toParquetJson(customers as unknown as Record<string, unknown>[]));
  results.push("samples/parquet/customers.parquet.json");

  await writeTextFile("samples/parquet/orders.parquet.json", toParquetJson(orders as unknown as Record<string, unknown>[]));
  results.push("samples/parquet/orders.parquet.json");

  await writeTextFile("samples/parquet/transactions.parquet.json", toParquetJson(transactions as unknown as Record<string, unknown>[]));
  results.push("samples/parquet/transactions.parquet.json");

  // === XML Files ===
  await writeTextFile("samples/json/customers.xml", toXml("customers", customers as unknown as Record<string, unknown>[], "customer"));
  results.push("samples/json/customers.xml");

  await writeTextFile("samples/json/products.xml", toXml("products", products as unknown as Record<string, unknown>[], "product"));
  results.push("samples/json/products.xml");

  // === PDF-style text report ===
  const pdfReport = `
================================================================================
                        SALES PERFORMANCE REPORT - Q4 2024
================================================================================

Generated: ${new Date().toISOString()}

--- EXECUTIVE SUMMARY ---
Total Customers: ${customers.length}
Total Products: ${products.length}
Total Orders: ${orders.length}
Total Transactions: ${transactions.length}

--- CUSTOMER SEGMENTS ---
VIP: ${customers.filter(c => c.segment === "VIP").length} customers
Premium: ${customers.filter(c => c.segment === "Premium").length} customers
Standard: ${customers.filter(c => c.segment === "Standard").length} customers

--- ORDER STATUS BREAKDOWN ---
Pending: ${orders.filter(o => o.status === "pending").length}
Processing: ${orders.filter(o => o.status === "processing").length}
Shipped: ${orders.filter(o => o.status === "shipped").length}
Delivered: ${orders.filter(o => o.status === "delivered").length}
Cancelled: ${orders.filter(o => o.status === "cancelled").length}

--- TOP PRODUCTS BY REVENUE ---
${products.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} - $${p.price} (Stock: ${p.stock})`).join("\n")}

--- EMPLOYEE SUMMARY ---
Total Employees: ${employees.length}
Departments: ${[...new Set(employees.map(e => e.department))].join(", ")}
Average Salary: $${Math.round(employees.reduce((s, e) => s + e.salary, 0) / employees.length).toLocaleString()}

================================================================================
                              END OF REPORT
================================================================================
`;
  await writeTextFile("samples/pdf/sales_report_q4.pdf.txt", pdfReport);
  results.push("samples/pdf/sales_report_q4.pdf.txt");

  const hrReport = `
================================================================================
                          HR DEPARTMENT REPORT - 2024
================================================================================

--- EMPLOYEE ROSTER ---
${employees.map(e => `${e.id} | ${e.name} | ${e.department} | ${e.role} | $${e.salary.toLocaleString()} | Perf: ${e.performance}`).join("\n")}

--- DEPARTMENT BREAKDOWN ---
${[...new Set(employees.map(e => e.department))].map(dept => {
  const deptEmps = employees.filter(e => e.department === dept);
  const avgSalary = Math.round(deptEmps.reduce((s, e) => s + e.salary, 0) / deptEmps.length);
  const avgPerf = +(deptEmps.reduce((s, e) => s + e.performance, 0) / deptEmps.length).toFixed(1);
  return `${dept}: ${deptEmps.length} employees | Avg Salary: $${avgSalary.toLocaleString()} | Avg Performance: ${avgPerf}`;
}).join("\n")}

================================================================================
`;
  await writeTextFile("samples/pdf/hr_report_2024.pdf.txt", hrReport);
  results.push("samples/pdf/hr_report_2024.pdf.txt");

  return results;
}
