# System Patterns: FlowForge

## Architecture Overview

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── flows/
│   │   ├── page.tsx                # Flow listing
│   │   └── [id]/page.tsx           # Flow editor
│   └── api/
│       ├── processors/route.ts     # Processor definitions API
│       └── flows/
│           ├── route.ts            # Flow CRUD
│           └── [id]/
│               ├── route.ts        # Single flow CRUD
│               ├── execute/route.ts # Execute flow
│               └── provenance/route.ts # Provenance data
├── components/
│   └── flow-editor/
│       ├── FlowEditor.tsx          # Main editor (orchestrator)
│       ├── FlowCanvas.tsx          # Canvas with nodes and SVG connections
│       ├── ProcessorPalette.tsx    # Sidebar processor list
│       ├── PropertiesPanel.tsx     # Node config editor
│       ├── FlowToolbar.tsx         # Top toolbar with actions
│       └── ProvenanceLog.tsx       # Execution log panel
└── lib/
    ├── types/index.ts              # All TypeScript types
    ├── store/index.ts              # In-memory data store
    ├── engine/index.ts             # Flow execution engine
    └── processors/
        ├── index.ts                # Barrel export
        ├── definitions.ts          # Processor type definitions
        └── executors.ts            # Processor execution logic
```

## Key Design Patterns

### 1. Client-Server Split
- **Server**: API routes handle flow CRUD and execution
- **Client**: `"use client"` components for the visual editor
- **Shared**: Types and processor definitions are isomorphic

### 2. In-Memory Store Pattern
```typescript
const flows = new Map<string, FlowDefinition>();
// CRUD operations: createFlow, getFlow, listFlows, updateFlow, deleteFlow
```
- Simple Map-based storage for MVP
- Could be replaced with database persistence later

### 3. Flow Execution Engine
- Topological sort determines execution order
- Processes flow as a directed acyclic graph (DAG)
- Each processor receives input from upstream, produces output for downstream
- Provenance events logged at each step

### 4. Processor Plugin Pattern
```typescript
// Each processor has: definition (schema) + executor (logic)
processorDefinitions[type] → ProcessorDefinition
getProcessorExecutor(type) → (ctx) => FlowOutputData
```
- Definitions describe UI (config schema, ports)
- Executors contain runtime logic
- Easy to add new processors

### 5. Canvas Interaction Pattern
- HTML elements for processor nodes (better text rendering)
- SVG for connection lines (Bezier curves)
- Mouse event handlers for drag-and-drop
- Port-based connection model (output → input)

## Styling Conventions

- Dark theme (neutral-950 base)
- Color-coded categories:
  - Source: emerald tones
  - Transform: blue tones
  - Sink: amber tones
- Tailwind utility classes throughout
- Status indicators: green (success), blue (running), red (error), gray (idle)
