# Project Brief: FlowForge - Visual Data Flow Orchestration

## Purpose

FlowForge is a custom Apache NiFi-inspired visual data flow management and ETL orchestration tool. It provides a drag-and-drop interface for building, configuring, and executing data pipelines.

## Target Users

- Data engineers building ETL pipelines
- Developers needing visual data flow orchestration
- Teams that want low-code data integration

## Core Use Case

Users design data flows visually by:
1. Adding processors (sources, transforms, sinks) to a canvas
2. Connecting processors to define data flow direction
3. Configuring each processor's settings via a properties panel
4. Executing the flow and monitoring provenance

## Key Requirements

### Must Have

- Visual drag-and-drop flow designer
- Processor palette with source, transform, and sink categories
- Properties panel for processor configuration
- Flow execution engine with topological sorting
- Data provenance tracking
- REST API for flow CRUD and execution

### Built-in Processors

- **File Input**: Read JSON/CSV files
- **File Output**: Write JSON/CSV files
- **JSON Transform**: Rename/add/remove fields
- **CSV Transform**: Convert between CSV and JSON
- **Filter**: Filter records by field conditions
- **Merge**: Combine multiple data streams

### Nice to Have

- Clustering and distributed execution
- AI-assisted data mapping
- Real-time monitoring dashboards
- Additional connector processors (APIs, databases, Kafka)

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 for styling
- In-memory store with UUID-based entities
- uuid for ID generation, papaparse for CSV parsing

## Constraints

- In-memory data store (no database persistence across restarts)
- Single-node execution only
- File-based processors require server-side file access
