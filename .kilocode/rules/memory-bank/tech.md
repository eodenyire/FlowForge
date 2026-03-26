# Technical Context: FlowForge

## Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 16.x    | React framework with App Router |
| React        | 19.x    | UI library                      |
| TypeScript   | 5.9.x   | Type-safe JavaScript            |
| Tailwind CSS | 4.x     | Utility-first CSS               |
| Bun          | Latest  | Package manager & runtime       |
| uuid         | 13.x    | ID generation                   |
| papaparse    | 5.x     | CSV parsing (available)         |

## Development Commands

```bash
bun install        # Install dependencies
bun dev            # Start dev server (http://localhost:3000)
bun build          # Production build
bun start          # Start production server
bun lint           # Run ESLint
bun typecheck      # Run TypeScript type checking
```

## Project Configuration

- Next.js App Router with Server Components
- TypeScript strict mode enabled
- Path alias: `@/*` → `src/*`
- Tailwind CSS 4 with `@import "tailwindcss"`

## Data Architecture

### Flow Definition
```typescript
interface FlowDefinition {
  id: string;
  name: string;
  description: string;
  processors: ProcessorNode[];
  connections: Connection[];
  status: "draft" | "running" | "completed" | "failed";
}
```

### Processor Types
| Type | Category | Purpose |
|------|----------|---------|
| file-input | source | Read JSON/CSV files |
| file-output | sink | Write JSON/CSV files |
| json-transform | transform | Rename/add/remove fields |
| csv-transform | transform | Convert CSV↔JSON |
| filter | transform | Filter by field conditions |
| merge | transform | Combine data streams |

### Execution Flow
1. Build adjacency list from connections
2. Topological sort processors
3. Execute each processor in order
4. Pass output data downstream
5. Log provenance events
6. Update flow status

## Browser Support

- Modern browsers (ES2020+)
- No IE11 support

## Performance Considerations

- Canvas uses absolute positioning for nodes (DOM-based)
- SVG paths for connections (efficient rendering)
- In-memory store (no database latency)
- Server Components for listing pages
- Client Components only for interactive editor
