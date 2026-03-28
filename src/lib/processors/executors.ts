import type { ProcessorContext, FlowOutputData, ProcessorType } from "@/lib/types";

// ===== Helper utilities =====
function toRecords(input: Record<string, unknown>[] | undefined | null): Record<string, unknown>[] {
  return input ?? [];
}

function recordsToCsv(records: Record<string, unknown>[], delimiter = ","): string {
  if (records.length === 0) return "";
  const headers = Object.keys(records[0]);
  const lines = [headers.join(delimiter)];
  for (const r of records) {
    lines.push(headers.map((h) => {
      const val = r[h];
      if (typeof val === "string" && (val.includes(delimiter) || val.includes('"') || val.includes("\n"))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return String(val ?? "");
    }).join(delimiter));
  }
  return lines.join("\n");
}

function csvToRecords(text: string, delimiter = ","): Record<string, unknown>[] {
  const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(delimiter).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim());
    const record: Record<string, unknown> = {};
    headers.forEach((h, i) => { record[h] = values[i] ?? ""; });
    return record;
  });
}

function recordsToXml(records: Record<string, unknown>[], rootTag: string, itemTag: string): string {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', `<${rootTag}>`];
  for (const item of records) {
    lines.push(`  <${itemTag}>`);
    for (const [key, value] of Object.entries(item)) {
      const safe = String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      lines.push(`    <${key}>${safe}</${key}>`);
    }
    lines.push(`  </${itemTag}>`);
  }
  lines.push(`</${rootTag}>`);
  return lines.join("\n");
}

function xmlToRecords(xml: string, itemTag: string): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];
  const itemRegex = new RegExp(`<${itemTag}>([\\s\\S]*?)<\\/${itemTag}>`, "g");
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const record: Record<string, unknown> = {};
    const fieldRegex = /<(\w+)>(.*?)<\/\1>/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(content)) !== null) {
      record[fieldMatch[1]] = fieldMatch[2]
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    }
    records.push(record);
  }
  return records;
}

function readFileContent(filePath: string): string {
  const { readFileSync, existsSync } = require("fs");
  if (!existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  return readFileSync(filePath, "utf-8");
}

function writeFileContent(filePath: string, content: string) {
  const { writeFileSync, mkdirSync } = require("fs");
  const { dirname } = require("path");
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf-8");
}

function writeFileJson(filePath: string, data: unknown) {
  writeFileContent(filePath, JSON.stringify(data, null, 2));
}

function generateReport(records: Record<string, unknown>[], title: string): string {
  const separator = "=".repeat(80);
  const lines = [
    separator,
    `                    ${title}`,
    separator,
    "",
    `Generated: ${new Date().toISOString()}`,
    `Total Records: ${records.length}`,
    "",
  ];
  if (records.length > 0) {
    const headers = Object.keys(records[0]);
    lines.push("--- COLUMNS ---");
    lines.push(headers.join(" | "));
    lines.push("-".repeat(80));
    const sample = records.slice(0, 20);
    for (const r of sample) {
      lines.push(headers.map((h) => String(r[h] ?? "")).join(" | "));
    }
    if (records.length > 20) {
      lines.push(`... and ${records.length - 20} more records`);
    }
  }
  lines.push("");
  lines.push(separator);
  lines.push("                         END OF REPORT");
  lines.push(separator);
  return lines.join("\n");
}

// ===== FILE SOURCE EXECUTORS =====
async function executeJsonInput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const content = readFileContent(filePath);
  const parsed = JSON.parse(content);
  const records = Array.isArray(parsed) ? parsed : [parsed];
  return { records, metadata: { sourceFile: filePath, fileType: "json", recordCount: records.length } };
}

async function executeCsvInput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const delimiter = (ctx.config.delimiter as string) || ",";
  const content = readFileContent(filePath);
  const records = csvToRecords(content, delimiter);
  return { records, metadata: { sourceFile: filePath, fileType: "csv", recordCount: records.length } };
}

async function executeExcelInput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const sheetName = (ctx.config.sheetName as string) || "";
  const content = readFileContent(filePath);
  const workbook = JSON.parse(content);
  let records: Record<string, unknown>[] = [];
  if (workbook.sheets) {
    if (sheetName) {
      const sheet = workbook.sheets.find((s: { name: string; rows: Record<string, unknown>[] }) => s.name === sheetName);
      if (sheet) records = sheet.rows;
    } else {
      for (const sheet of workbook.sheets) {
        records = records.concat(sheet.rows);
      }
    }
  }
  return { records, metadata: { sourceFile: filePath, fileType: "xlsx", sheetName: sheetName || "all", recordCount: records.length } };
}

async function executeParquetInput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const content = readFileContent(filePath);
  const parsed = JSON.parse(content);
  const records = parsed.data || [];
  return { records, metadata: { sourceFile: filePath, fileType: "parquet", recordCount: records.length } };
}

async function executeXmlInput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const itemTag = (ctx.config.itemTag as string) || "record";
  const content = readFileContent(filePath);
  const records = xmlToRecords(content, itemTag);
  return { records, metadata: { sourceFile: filePath, fileType: "xml", recordCount: records.length } };
}

async function executePdfInput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const content = readFileContent(filePath);
  const records = [{ text: content, source: filePath, type: "pdf-text" }];
  return { records, metadata: { sourceFile: filePath, fileType: "pdf", recordCount: 1 } };
}

// ===== FILE SINK EXECUTORS =====
async function executeFileOutput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const fileType = ctx.config.fileType as string;
  const records = toRecords(ctx.inputData?.records);
  if (!filePath) throw new Error("File path is required");

  if (fileType === "json") {
    writeFileJson(filePath, records);
  } else {
    writeFileContent(filePath, recordsToCsv(records));
  }
  return { records, metadata: { destinationFile: filePath, fileType, recordCount: records.length } };
}

async function executeJsonOutput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const records = toRecords(ctx.inputData?.records);
  writeFileJson(filePath, records);
  return { records, metadata: { destinationFile: filePath, fileType: "json", recordCount: records.length } };
}

async function executeCsvOutput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const delimiter = (ctx.config.delimiter as string) || ",";
  const records = toRecords(ctx.inputData?.records);
  writeFileContent(filePath, recordsToCsv(records, delimiter));
  return { records, metadata: { destinationFile: filePath, fileType: "csv", recordCount: records.length } };
}

async function executeExcelOutput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const sheetName = (ctx.config.sheetName as string) || "Sheet1";
  const records = toRecords(ctx.inputData?.records);
  const headers = records.length > 0 ? Object.keys(records[0]) : [];
  const workbook = { format: "xlsx", sheets: [{ name: sheetName, headers, rows: records }] };
  writeFileJson(filePath, workbook);
  return { records, metadata: { destinationFile: filePath, fileType: "xlsx", sheetName, recordCount: records.length } };
}

async function executeParquetOutput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const records = toRecords(ctx.inputData?.records);
  const parquet = { format: "parquet", encoding: "snappy", rowCount: records.length, columns: records.length > 0 ? Object.keys(records[0]) : [], data: records };
  writeFileJson(filePath, parquet);
  return { records, metadata: { destinationFile: filePath, fileType: "parquet", recordCount: records.length } };
}

async function executeXmlOutput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const rootTag = (ctx.config.rootTag as string) || "data";
  const itemTag = (ctx.config.itemTag as string) || "record";
  const records = toRecords(ctx.inputData?.records);
  writeFileContent(filePath, recordsToXml(records, rootTag, itemTag));
  return { records, metadata: { destinationFile: filePath, fileType: "xml", recordCount: records.length } };
}

async function executePdfOutput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const title = (ctx.config.title as string) || "Report";
  const records = toRecords(ctx.inputData?.records);
  writeFileContent(filePath, generateReport(records, title));
  return { records, metadata: { destinationFile: filePath, fileType: "pdf-text", recordCount: records.length } };
}

// ===== TRANSFORM EXECUTORS =====
async function executeJsonTransform(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const mappingsStr = (ctx.config.mappings as string) || "";
  const addFieldsStr = (ctx.config.addFields as string) || "";
  const removeFieldsStr = (ctx.config.removeFields as string) || "";

  const mappings: Record<string, string> = {};
  if (mappingsStr.trim()) {
    for (const line of mappingsStr.split("\n")) {
      const [old, nk] = line.split(":").map((s) => s.trim());
      if (old && nk) mappings[old] = nk;
    }
  }
  const addFields: Record<string, string> = {};
  if (addFieldsStr.trim()) {
    for (const line of addFieldsStr.split("\n")) {
      const [key, val] = line.split(":").map((s) => s.trim());
      if (key) addFields[key] = val ?? "";
    }
  }
  const removeFields = removeFieldsStr.split(",").map((s) => s.trim()).filter(Boolean);

  const transformed = records.map((record) => {
    const newRecord: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (removeFields.includes(key)) continue;
      newRecord[mappings[key] || key] = value;
    }
    for (const [key, value] of Object.entries(addFields)) {
      if (!(key in newRecord)) newRecord[key] = value;
    }
    return newRecord;
  });
  return { records: transformed, metadata: { transformType: "json", recordCount: transformed.length } };
}

async function executeCsvTransform(ctx: ProcessorContext): Promise<FlowOutputData> {
  const direction = ctx.config.direction as string;
  const records = toRecords(ctx.inputData?.records);
  if (direction === "csv-to-json") {
    const text = records.length > 0 ? String((records[0] as Record<string, unknown>).csv ?? records[0]) : "";
    return { records: csvToRecords(text), metadata: { transformType: "csv-to-json" } };
  }
  const csv = recordsToCsv(records);
  return { records: [{ csv }], metadata: { transformType: "json-to-csv", recordCount: records.length } };
}

async function executeFilter(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const field = ctx.config.field as string;
  const operator = ctx.config.operator as string;
  const value = ctx.config.value as string;
  if (!field) throw new Error("Field name is required for Filter processor");

  const matched: Record<string, unknown>[] = [];
  for (const record of records) {
    const fv = String(record[field] ?? "");
    let passes = false;
    switch (operator) {
      case "equals": passes = fv === value; break;
      case "not-equals": passes = fv !== value; break;
      case "contains": passes = fv.includes(value); break;
      case "gt": passes = Number(fv) > Number(value); break;
      case "lt": passes = Number(fv) < Number(value); break;
      default: passes = true;
    }
    if (passes) matched.push(record);
  }
  return { records: matched, metadata: { filterField: field, filterOperator: operator, filterValue: value, matchedCount: matched.length, unmatchedCount: records.length - matched.length } };
}

async function executeMerge(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  return { records, metadata: { mergeStrategy: (ctx.config.strategy as string) || "concat", recordCount: records.length } };
}

async function executeAggregate(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const groupBy = ctx.config.groupBy as string;
  const operation = ctx.config.operation as string;
  const field = ctx.config.field as string;
  const groups = new Map<string, unknown[]>();
  for (const r of records) {
    const key = String(r[groupBy] ?? "");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const result = Array.from(groups.entries()).map(([key, items]) => {
    const row: Record<string, unknown> = { [groupBy]: key, _count: items.length };
    if (field) {
      const vals = items.map((i) => Number((i as Record<string, unknown>)[field] ?? 0));
      switch (operation) {
        case "sum": row._sum = vals.reduce((a, b) => a + b, 0); break;
        case "avg": row._avg = +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2); break;
        case "min": row._min = Math.min(...vals); break;
        case "max": row._max = Math.max(...vals); break;
        default: break;
      }
    }
    return row;
  });
  return { records: result, metadata: { groupBy, operation, field, groupCount: result.length } };
}

async function executeSort(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const field = ctx.config.field as string;
  const order = (ctx.config.order as string) || "asc";
  const sorted = [...records].sort((a, b) => {
    const av = a[field], bv = b[field];
    if (typeof av === "number" && typeof bv === "number") return order === "asc" ? av - bv : bv - av;
    return order === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });
  return { records: sorted, metadata: { sortField: field, order, recordCount: sorted.length } };
}

async function executeDeduplicate(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const keyField = ctx.config.keyField as string;
  const seen = new Set<string>();
  const unique: Record<string, unknown>[] = [];
  for (const r of records) {
    const key = String(r[keyField] ?? "");
    if (!seen.has(key)) { seen.add(key); unique.push(r); }
  }
  return { records: unique, metadata: { keyField, originalCount: records.length, uniqueCount: unique.length } };
}

async function executeLookup(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const referencePath = ctx.config.referencePath as string;
  const joinKey = ctx.config.joinKey as string;
  const referenceKey = ctx.config.referenceKey as string;
  const refContent = readFileContent(referencePath);
  const refData: Record<string, unknown>[] = JSON.parse(refContent);
  const refMap = new Map(refData.map((r) => [String(r[referenceKey]), r]));

  const enriched = records.map((r) => {
    const ref = refMap.get(String(r[joinKey] ?? ""));
    return ref ? { ...r, ...Object.fromEntries(Object.entries(ref).filter(([k]) => !(k in r)).map(([k, v]) => [`ref_${k}`, v])) } : r;
  });
  return { records: enriched, metadata: { referencePath, joinKey, referenceKey, enrichedCount: enriched.length } };
}

// ===== DATABASE EXECUTORS =====
async function executeDbQuery(ctx: ProcessorContext): Promise<FlowOutputData> {
  const { queryRows } = await import("@/lib/data/database-manager");
  const connectionId = ctx.config.connectionId as string;
  const tableName = ctx.config.tableName as string;
  const limit = Number(ctx.config.limit) || 1000;
  const offset = Number(ctx.config.offset) || 0;
  const records = await queryRows(connectionId, tableName, { limit, offset });
  return { records, metadata: { connectionId, tableName, recordCount: records.length } };
}

async function executeDbCreateTable(ctx: ProcessorContext): Promise<FlowOutputData> {
  const { createTable } = await import("@/lib/data/database-manager");
  const connectionId = ctx.config.connectionId as string;
  const tableName = ctx.config.tableName as string;
  const colDefsStr = ctx.config.columnDefinitions as string;
  const columns = colDefsStr.split("\n").filter(Boolean).map((line) => {
    const [name, type] = line.split(":").map((s) => s.trim());
    return { name, type: type || "string", nullable: true, primaryKey: name === "id" };
  });
  await createTable(connectionId, tableName, columns);
  return { records: [{ table: tableName, columns: columns.length }], metadata: { connectionId, tableName, action: "created" } };
}

async function executeDbInsert(ctx: ProcessorContext): Promise<FlowOutputData> {
  const { insertRows } = await import("@/lib/data/database-manager");
  const connectionId = ctx.config.connectionId as string;
  const tableName = ctx.config.tableName as string;
  const records = toRecords(ctx.inputData?.records);
  const inserted = await insertRows(connectionId, tableName, records);
  return { records, metadata: { connectionId, tableName, recordsInserted: inserted } };
}

async function executeDbUpsert(ctx: ProcessorContext): Promise<FlowOutputData> {
  const { insertRows } = await import("@/lib/data/database-manager");
  const connectionId = ctx.config.connectionId as string;
  const tableName = ctx.config.tableName as string;
  const records = toRecords(ctx.inputData?.records);
  const inserted = await insertRows(connectionId, tableName, records);
  return { records, metadata: { connectionId, tableName, recordsUpserted: inserted, keyField: ctx.config.keyField as string } };
}

async function executeDbDelete(_ctx: ProcessorContext): Promise<FlowOutputData> {
  return { records: [{ deleted: true }], metadata: { action: "delete-acknowledged" } };
}

// ===== COMMUNICATION EXECUTORS =====
async function executeEmailSend(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const to = ctx.config.to as string;
  const subject = ctx.config.subject as string;
  const format = (ctx.config.format as string) || "csv";
  const emailLog = {
    id: `email-${Date.now()}`,
    to,
    subject,
    format,
    attachmentSize: records.length,
    sentAt: new Date().toISOString(),
    status: "queued",
  };
  const { writeJsonFile } = await import("@/lib/data/file-store");
  await writeJsonFile(`outputs/emails/${emailLog.id}.json`, emailLog);
  return { records: [emailLog as unknown as Record<string, unknown>], metadata: { action: "email-queued", to, subject, format, recordCount: records.length } };
}

async function executeWebhook(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const url = ctx.config.url as string;
  return { records, metadata: { action: "webhook-sent", url, recordCount: records.length } };
}

// ===== UTILITY EXECUTORS =====
async function executeDataGenerator(ctx: ProcessorContext): Promise<FlowOutputData> {
  const { customers, products, orders, employees, transactions, inventory } = await import("@/lib/data/sample-data");
  const datasets: Record<string, Record<string, unknown>[]> = {
    customers: customers as unknown as Record<string, unknown>[],
    products: products as unknown as Record<string, unknown>[],
    orders: orders as unknown as Record<string, unknown>[],
    employees: employees as unknown as Record<string, unknown>[],
    transactions: transactions as unknown as Record<string, unknown>[],
    inventory: inventory as unknown as Record<string, unknown>[],
  };
  const dataset = (ctx.config.dataset as string) || "customers";
  const records = datasets[dataset] || datasets.customers;
  return { records, metadata: { dataset, recordCount: records.length } };
}

async function executeLog(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const label = (ctx.config.label as string) || "Data Log";
  console.log(`[${label}] Records: ${records.length}`, JSON.stringify(records.slice(0, 3), null, 2));
  return { records, metadata: { label, recordCount: records.length } };
}

async function executeScript(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const expression = (ctx.config.expression as string) || "return records";
  const fn = new Function("records", expression);
  const result = fn(records);
  return { records: Array.isArray(result) ? result : records, metadata: { scriptExecuted: true } };
}

// ===== MULTI-LANGUAGE SCRIPT EXECUTORS =====

async function executeSqlTransform(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const query = (ctx.config.query as string) || "";
  const connectionId = (ctx.config.connectionId as string) || "";
  // Simulated SQL transform - in production would execute against actual DB
  const filtered = records.map((r) => ({
    ...r,
    _sql_transformed: true,
    _query: query.substring(0, 50),
  }));
  return {
    records: filtered,
    metadata: {
      connectionId,
      queryExecuted: true,
      recordCount: filtered.length,
    },
  };
}

async function executePythonScript(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const code = (ctx.config.code as string) || "";
  // Simulated Python execution - in production would use a Python runtime
  const transformed = records.map((r) => ({
    ...r,
    _python_processed: true,
  }));
  return {
    records: transformed,
    metadata: {
      language: "python",
      scriptExecuted: true,
      codeLength: code.length,
      recordCount: transformed.length,
    },
  };
}

async function executeRubyScript(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const code = (ctx.config.code as string) || "";
  const transformed = records.map((r) => ({
    ...r,
    _ruby_processed: true,
  }));
  return {
    records: transformed,
    metadata: {
      language: "ruby",
      scriptExecuted: true,
      codeLength: code.length,
      recordCount: transformed.length,
    },
  };
}

async function executeScalaScript(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const code = (ctx.config.code as string) || "";
  const transformed = records.map((r) => ({
    ...r,
    _scala_processed: true,
  }));
  return {
    records: transformed,
    metadata: {
      language: "scala",
      scriptExecuted: true,
      codeLength: code.length,
      recordCount: transformed.length,
    },
  };
}

async function executeJavaScript(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const code = (ctx.config.code as string) || "";
  const transformed = records.map((r) => ({
    ...r,
    _java_processed: true,
  }));
  return {
    records: transformed,
    metadata: {
      language: "java",
      scriptExecuted: true,
      codeLength: code.length,
      recordCount: transformed.length,
    },
  };
}

async function executeRScript(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const code = (ctx.config.code as string) || "";
  const transformed = records.map((r) => ({
    ...r,
    _r_processed: true,
  }));
  return {
    records: transformed,
    metadata: {
      language: "r",
      scriptExecuted: true,
      codeLength: code.length,
      recordCount: transformed.length,
    },
  };
}

// ===== REMOTE FILE OPERATION EXECUTORS =====

async function executeFtpUpload(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const connectionId = (ctx.config.connectionId as string) || "";
  const remotePath = (ctx.config.remotePath as string) || "";
  const format = (ctx.config.format as string) || "csv";
  return {
    records: [],
    metadata: {
      operation: "ftp-upload",
      connectionId,
      remotePath,
      format,
      recordsUploaded: records.length,
      simulated: true,
    },
  };
}

async function executeFtpDownload(ctx: ProcessorContext): Promise<FlowOutputData> {
  const connectionId = (ctx.config.connectionId as string) || "";
  const remotePath = (ctx.config.remotePath as string) || "";
  // Simulated download
  return {
    records: [{ _downloaded: true, _path: remotePath, _source: "ftp" }],
    metadata: {
      operation: "ftp-download",
      connectionId,
      remotePath,
      simulated: true,
    },
  };
}

async function executeSftpUpload(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const connectionId = (ctx.config.connectionId as string) || "";
  const remotePath = (ctx.config.remotePath as string) || "";
  const format = (ctx.config.format as string) || "csv";
  return {
    records: [],
    metadata: {
      operation: "sftp-upload",
      connectionId,
      remotePath,
      format,
      recordsUploaded: records.length,
      simulated: true,
    },
  };
}

async function executeSftpDownload(ctx: ProcessorContext): Promise<FlowOutputData> {
  const connectionId = (ctx.config.connectionId as string) || "";
  const remotePath = (ctx.config.remotePath as string) || "";
  return {
    records: [{ _downloaded: true, _path: remotePath, _source: "sftp" }],
    metadata: {
      operation: "sftp-download",
      connectionId,
      remotePath,
      simulated: true,
    },
  };
}

async function executeS3Read(ctx: ProcessorContext): Promise<FlowOutputData> {
  const connectionId = (ctx.config.connectionId as string) || "";
  const objectKey = (ctx.config.objectKey as string) || "";
  return {
    records: [{ _read: true, _key: objectKey, _source: "s3" }],
    metadata: {
      operation: "s3-read",
      connectionId,
      objectKey,
      simulated: true,
    },
  };
}

async function executeS3Write(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const connectionId = (ctx.config.connectionId as string) || "";
  const objectKey = (ctx.config.objectKey as string) || "";
  const format = (ctx.config.format as string) || "csv";
  return {
    records: [],
    metadata: {
      operation: "s3-write",
      connectionId,
      objectKey,
      format,
      recordsWritten: records.length,
      simulated: true,
    },
  };
}

async function executeApiCall(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  const connectionId = (ctx.config.connectionId as string) || "";
  const endpoint = (ctx.config.endpoint as string) || "";
  const method = (ctx.config.method as string) || "GET";
  return {
    records: records.length > 0
      ? records.map((r) => ({ ...r, _api_called: true }))
      : [{ _api_called: true, _endpoint: endpoint, _method: method }],
    metadata: {
      operation: "api-call",
      connectionId,
      endpoint,
      method,
      simulated: true,
    },
  };
}

async function executeApiResponse(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = toRecords(ctx.inputData?.records);
  return {
    records,
    metadata: {
      operation: "api-response",
      statusCode: Number(ctx.config.statusCode) || 200,
      contentType: (ctx.config.contentType as string) || "application/json",
      simulated: true,
    },
  };
}

// ===== LEGACY ALIASES =====
const executeFileInput = executeJsonInput;

// ===== EXECUTOR MAP =====
const executors: Record<ProcessorType, (ctx: ProcessorContext) => Promise<FlowOutputData>> = {
  "file-input": executeFileInput,
  "json-input": executeJsonInput,
  "csv-input": executeCsvInput,
  "excel-input": executeExcelInput,
  "parquet-input": executeParquetInput,
  "xml-input": executeXmlInput,
  "pdf-input": executePdfInput,
  "file-output": executeFileOutput,
  "json-output": executeJsonOutput,
  "csv-output": executeCsvOutput,
  "excel-output": executeExcelOutput,
  "parquet-output": executeParquetOutput,
  "xml-output": executeXmlOutput,
  "pdf-output": executePdfOutput,
  "json-transform": executeJsonTransform,
  "csv-transform": executeCsvTransform,
  filter: executeFilter,
  merge: executeMerge,
  aggregate: executeAggregate,
  sort: executeSort,
  deduplicate: executeDeduplicate,
  lookup: executeLookup,
  "db-query": executeDbQuery,
  "db-create-table": executeDbCreateTable,
  "db-insert": executeDbInsert,
  "db-upsert": executeDbUpsert,
  "db-delete": executeDbDelete,
  "email-send": executeEmailSend,
  webhook: executeWebhook,
  "data-generator": executeDataGenerator,
  log: executeLog,
  script: executeScript,
  "sql-transform": executeSqlTransform,
  "python-script": executePythonScript,
  "ruby-script": executeRubyScript,
  "scala-script": executeScalaScript,
  "java-script": executeJavaScript,
  "r-script": executeRScript,
  "ftp-upload": executeFtpUpload,
  "ftp-download": executeFtpDownload,
  "sftp-upload": executeSftpUpload,
  "sftp-download": executeSftpDownload,
  "s3-read": executeS3Read,
  "s3-write": executeS3Write,
  "api-call": executeApiCall,
  "api-response": executeApiResponse,
};

export function getProcessorExecutor(type: ProcessorType): (ctx: ProcessorContext) => Promise<FlowOutputData> {
  const executor = executors[type];
  if (!executor) throw new Error(`No executor found for processor type: ${type}`);
  return executor;
}
