# Active Context: FlowForge

## Current State

**Application Status**: ✅ MVP Complete - Visual Data Flow Orchestration Tool

FlowForge is a fully functional Apache NiFi-inspired visual data flow management tool built on Next.js 16.

## Recently Completed

- [x] Core type definitions for flows, processors, connections, provenance
- [x] In-memory data store with CRUD operations
- [x] 6 built-in processors: FileInput, FileOutput, JSONTransform, CSVTransform, Filter, Merge
- [x] Flow execution engine with topological sorting
- [x] REST API for flow CRUD, execution, and provenance
- [x] Visual drag-and-drop flow designer canvas
- [x] Processor palette sidebar
- [x] Properties panel for configuration
- [x] Flow toolbar with execute and save
- [x] Provenance log viewer
- [x] Landing page with feature overview
- [x] Flow listing page with create/delete

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Landing page | ✅ Ready |
| `src/app/flows/page.tsx` | Flow listing | ✅ Ready |
| `src/app/flows/[id]/page.tsx` | Flow editor | ✅ Ready |
| `src/app/api/flows/` | Flow API routes | ✅ Ready |
| `src/app/api/processors/` | Processor definitions API | ✅ Ready |
| `src/components/flow-editor/` | Editor UI components | ✅ Ready |
| `src/lib/types/` | TypeScript definitions | ✅ Ready |
| `src/lib/store/` | In-memory data store | ✅ Ready |
| `src/lib/engine/` | Flow execution engine | ✅ Ready |
| `src/lib/processors/` | Processor definitions & executors | ✅ Ready |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/flows` | Flow listing and creation |
| `/flows/[id]` | Visual flow editor |

## Current Focus

All MVP features are complete. The application passes TypeScript type checking and ESLint with no errors.

## Pending Improvements

- [ ] Add database persistence (currently in-memory)
- [ ] Add more processor types (API connectors, database connectors)
- [ ] Flow import/export (JSON)
- [ ] Execution history and replay
- [ ] Real-time execution status updates
- [ ] Undo/redo in the editor
- [ ] Keyboard shortcuts
- [ ] Flow templates
- [ ] Authentication and access control

## Session History

| Date | Changes |
|------|---------|
| Initial | FlowForge MVP built with visual editor, 6 processors, execution engine, provenance tracking |

## Dependencies Added

| Package | Purpose |
|---------|---------|
| uuid | Unique ID generation for flows, processors, connections |
| papaparse | CSV parsing (available for future use) |
| @types/uuid | TypeScript types for uuid |
| @types/papaparse | TypeScript types for papaparse |
