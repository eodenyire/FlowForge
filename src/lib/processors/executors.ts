import type {
  ProcessorContext,
  FlowOutputData,
  ProcessorType,
} from "@/lib/types";

async function executeFileInput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const fileType = ctx.config.fileType as string;

  if (!filePath) {
    throw new Error("File path is required for File Input processor");
  }

  const { readFileSync, existsSync } = await import("fs");
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = readFileSync(filePath, "utf-8");
  let records: Record<string, unknown>[];

  if (fileType === "json") {
    const parsed = JSON.parse(content);
    records = Array.isArray(parsed) ? parsed : [parsed];
  } else if (fileType === "csv") {
    const lines = content.trim().split("\n");
    if (lines.length < 2) {
      records = [];
    } else {
      const headers = lines[0].split(",").map((h) => h.trim());
      records = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const record: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          record[h] = values[i] ?? "";
        });
        return record;
      });
    }
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  return {
    records,
    metadata: {
      sourceFile: filePath,
      fileType,
      recordCount: records.length,
    },
  };
}

async function executeFileOutput(ctx: ProcessorContext): Promise<FlowOutputData> {
  const filePath = ctx.config.filePath as string;
  const fileType = ctx.config.fileType as string;
  const records = ctx.inputData?.records ?? [];

  if (!filePath) {
    throw new Error("File path is required for File Output processor");
  }

  const { writeFileSync, mkdirSync } = await import("fs");
  const { dirname } = await import("path");
  mkdirSync(dirname(filePath), { recursive: true });

  let content: string;
  if (fileType === "json") {
    content = JSON.stringify(records, null, 2);
  } else if (fileType === "csv") {
    if (records.length === 0) {
      content = "";
    } else {
      const headers = Object.keys(records[0]);
      const csvLines = [
        headers.join(","),
        ...records.map((r) =>
          headers
            .map((h) => {
              const val = r[h];
              if (typeof val === "string" && val.includes(",")) {
                return `"${val}"`;
              }
              return String(val ?? "");
            })
            .join(",")
        ),
      ];
      content = csvLines.join("\n");
    }
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  writeFileSync(filePath, content, "utf-8");

  return {
    records,
    metadata: {
      destinationFile: filePath,
      fileType,
      recordCount: records.length,
    },
  };
}

async function executeJsonTransform(
  ctx: ProcessorContext
): Promise<FlowOutputData> {
  const records = ctx.inputData?.records ?? [];
  const mappingsStr = (ctx.config.mappings as string) || "";
  const addFieldsStr = (ctx.config.addFields as string) || "";
  const removeFieldsStr = (ctx.config.removeFields as string) || "";

  const mappings: Record<string, string> = {};
  if (mappingsStr.trim()) {
    for (const line of mappingsStr.split("\n")) {
      const [old, newKey] = line.split(":").map((s) => s.trim());
      if (old && newKey) mappings[old] = newKey;
    }
  }

  const addFields: Record<string, string> = {};
  if (addFieldsStr.trim()) {
    for (const line of addFieldsStr.split("\n")) {
      const [key, val] = line.split(":").map((s) => s.trim());
      if (key) addFields[key] = val ?? "";
    }
  }

  const removeFields = removeFieldsStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const transformed = records.map((record) => {
    const newRecord: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(record)) {
      if (removeFields.includes(key)) continue;
      const newKey = mappings[key] || key;
      newRecord[newKey] = value;
    }

    for (const [key, value] of Object.entries(addFields)) {
      if (!(key in newRecord)) {
        newRecord[key] = value;
      }
    }

    return newRecord;
  });

  return {
    records: transformed,
    metadata: {
      transformType: "json",
      recordCount: transformed.length,
    },
  };
}

async function executeCsvTransform(
  ctx: ProcessorContext
): Promise<FlowOutputData> {
  const direction = ctx.config.direction as string;
  const records = ctx.inputData?.records ?? [];

  if (direction === "csv-to-json") {
    if (records.length === 0) {
      return { records: [], metadata: { transformType: "csv-to-json" } };
    }
    const firstRecord = records[0] as Record<string, unknown>;
    const text =
      typeof firstRecord === "object" && "csv" in firstRecord
        ? String(firstRecord.csv)
        : String(firstRecord);
    const lines = text
      .split("\n")
      .map((l: string) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      return { records: [], metadata: { transformType: "csv-to-json" } };
    }
    const headers = lines[0].split(",").map((h: string) => h.trim());
    const parsed = lines.slice(1).map((line: string) => {
      const values = line.split(",").map((v: string) => v.trim());
      const record: Record<string, unknown> = {};
      headers.forEach((h: string, i: number) => {
        record[h] = values[i] ?? "";
      });
      return record;
    });
    return {
      records: parsed,
      metadata: { transformType: "csv-to-json", recordCount: parsed.length },
    };
  } else {
    if (records.length === 0) {
      return {
        records: [],
        metadata: { transformType: "json-to-csv" },
      };
    }
    const firstRec = records[0] as Record<string, unknown>;
    const headers = Object.keys(firstRec);
    const csvLines = [
      headers.join(","),
      ...records.map((r) => {
        const rec = r as Record<string, unknown>;
        return headers
          .map((h) => {
            const val = rec[h];
            if (typeof val === "string" && val.includes(",")) {
              return `"${val}"`;
            }
            return String(val ?? "");
          })
          .join(",");
      }),
    ];
    return {
      records: [{ csv: csvLines.join("\n") }],
      metadata: {
        transformType: "json-to-csv",
        recordCount: records.length,
      },
    };
  }
}

async function executeFilter(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = ctx.inputData?.records ?? [];
  const field = ctx.config.field as string;
  const operator = ctx.config.operator as string;
  const value = ctx.config.value as string;

  if (!field) throw new Error("Field name is required for Filter processor");

  const matched: Record<string, unknown>[] = [];
  const unmatched: Record<string, unknown>[] = [];

  for (const record of records) {
    const fieldValue = String((record as Record<string, unknown>)[field] ?? "");
    let passes = false;

    switch (operator) {
      case "equals":
        passes = fieldValue === value;
        break;
      case "not-equals":
        passes = fieldValue !== value;
        break;
      case "contains":
        passes = fieldValue.includes(value);
        break;
      case "gt":
        passes = Number(fieldValue) > Number(value);
        break;
      case "lt":
        passes = Number(fieldValue) < Number(value);
        break;
      default:
        passes = true;
    }

    if (passes) {
      matched.push(record);
    } else {
      unmatched.push(record);
    }
  }

  return {
    records: matched,
    metadata: {
      filterField: field,
      filterOperator: operator,
      filterValue: value,
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
    },
  };
}

async function executeMerge(ctx: ProcessorContext): Promise<FlowOutputData> {
  const records = ctx.inputData?.records ?? [];
  return {
    records,
    metadata: {
      mergeStrategy: (ctx.config.strategy as string) || "concat",
      recordCount: records.length,
    },
  };
}

const executors: Record<
  ProcessorType,
  (ctx: ProcessorContext) => Promise<FlowOutputData>
> = {
  "file-input": executeFileInput,
  "file-output": executeFileOutput,
  "json-transform": executeJsonTransform,
  "csv-transform": executeCsvTransform,
  filter: executeFilter,
  merge: executeMerge,
};

export function getProcessorExecutor(
  type: ProcessorType
): (ctx: ProcessorContext) => Promise<FlowOutputData> {
  const executor = executors[type];
  if (!executor) {
    throw new Error(`No executor found for processor type: ${type}`);
  }
  return executor;
}
