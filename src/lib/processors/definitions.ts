import type { ProcessorDefinition, ProcessorType } from "@/lib/types";

export const processorDefinitions: Record<ProcessorType, ProcessorDefinition> = {
  "file-input": {
    type: "file-input",
    name: "File Input",
    description: "Reads data from JSON or CSV files",
    category: "source",
    icon: "file-input",
    defaultConfig: {
      filePath: "",
      fileType: "json",
    },
    configSchema: [
      {
        key: "filePath",
        label: "File Path",
        type: "text",
        required: true,
        placeholder: "/path/to/input.json",
      },
      {
        key: "fileType",
        label: "File Type",
        type: "select",
        required: true,
        defaultValue: "json",
        options: [
          { label: "JSON", value: "json" },
          { label: "CSV", value: "csv" },
        ],
      },
    ],
    inputs: [],
    outputs: [{ id: "out", name: "Output", type: "output" }],
  },
  "file-output": {
    type: "file-output",
    name: "File Output",
    description: "Writes data to JSON or CSV files",
    category: "sink",
    icon: "file-output",
    defaultConfig: {
      filePath: "",
      fileType: "json",
    },
    configSchema: [
      {
        key: "filePath",
        label: "File Path",
        type: "text",
        required: true,
        placeholder: "/path/to/output.json",
      },
      {
        key: "fileType",
        label: "File Type",
        type: "select",
        required: true,
        defaultValue: "json",
        options: [
          { label: "JSON", value: "json" },
          { label: "CSV", value: "csv" },
        ],
      },
    ],
    inputs: [{ id: "in", name: "Input", type: "input" }],
    outputs: [],
  },
  "json-transform": {
    type: "json-transform",
    name: "JSON Transform",
    description: "Transform JSON data by renaming, adding, or removing fields",
    category: "transform",
    icon: "json-transform",
    defaultConfig: {
      mappings: "",
    },
    configSchema: [
      {
        key: "mappings",
        label: "Field Mappings",
        type: "textarea",
        required: false,
        placeholder: "oldField:newField\nanotherOld:anotherNew",
      },
      {
        key: "addFields",
        label: "Add Fields",
        type: "textarea",
        required: false,
        placeholder: "newField:defaultValue",
      },
      {
        key: "removeFields",
        label: "Remove Fields",
        type: "text",
        required: false,
        placeholder: "field1,field2",
      },
    ],
    inputs: [{ id: "in", name: "Input", type: "input" }],
    outputs: [{ id: "out", name: "Output", type: "output" }],
  },
  "csv-transform": {
    type: "csv-transform",
    name: "CSV Transform",
    description: "Convert between CSV and JSON formats",
    category: "transform",
    icon: "csv-transform",
    defaultConfig: {
      direction: "csv-to-json",
      delimiter: ",",
    },
    configSchema: [
      {
        key: "direction",
        label: "Direction",
        type: "select",
        required: true,
        defaultValue: "csv-to-json",
        options: [
          { label: "CSV to JSON", value: "csv-to-json" },
          { label: "JSON to CSV", value: "json-to-csv" },
        ],
      },
      {
        key: "delimiter",
        label: "Delimiter",
        type: "text",
        required: false,
        defaultValue: ",",
      },
    ],
    inputs: [{ id: "in", name: "Input", type: "input" }],
    outputs: [{ id: "out", name: "Output", type: "output" }],
  },
  filter: {
    type: "filter",
    name: "Filter",
    description: "Filter records based on field conditions",
    category: "transform",
    icon: "filter",
    defaultConfig: {
      field: "",
      operator: "equals",
      value: "",
    },
    configSchema: [
      {
        key: "field",
        label: "Field Name",
        type: "text",
        required: true,
        placeholder: "status",
      },
      {
        key: "operator",
        label: "Operator",
        type: "select",
        required: true,
        defaultValue: "equals",
        options: [
          { label: "Equals", value: "equals" },
          { label: "Not Equals", value: "not-equals" },
          { label: "Contains", value: "contains" },
          { label: "Greater Than", value: "gt" },
          { label: "Less Than", value: "lt" },
        ],
      },
      {
        key: "value",
        label: "Value",
        type: "text",
        required: true,
        placeholder: "active",
      },
    ],
    inputs: [{ id: "in", name: "Input", type: "input" }],
    outputs: [
      { id: "matched", name: "Matched", type: "output" },
      { id: "unmatched", name: "Unmatched", type: "output" },
    ],
  },
  merge: {
    type: "merge",
    name: "Merge",
    description: "Merge records from multiple inputs into a single stream",
    category: "transform",
    icon: "merge",
    defaultConfig: {
      strategy: "concat",
    },
    configSchema: [
      {
        key: "strategy",
        label: "Merge Strategy",
        type: "select",
        required: true,
        defaultValue: "concat",
        options: [
          { label: "Concatenate", value: "concat" },
          { label: "Deep Merge", value: "deep-merge" },
        ],
      },
    ],
    inputs: [
      { id: "in-a", name: "Input A", type: "input" },
      { id: "in-b", name: "Input B", type: "input" },
    ],
    outputs: [{ id: "out", name: "Output", type: "output" }],
  },
};

export function getProcessorDefinition(
  type: ProcessorType
): ProcessorDefinition {
  return processorDefinitions[type];
}

export function getAllProcessorDefinitions(): ProcessorDefinition[] {
  return Object.values(processorDefinitions);
}
