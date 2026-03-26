# Product Context: FlowForge

## Why This Exists

FlowForge provides a visual, intuitive way to build data pipelines without writing code. Inspired by Apache NiFi, it brings enterprise-grade data flow orchestration concepts to a modern web interface.

## Problems It Solves

1. **Complexity**: Visual designer eliminates the need to write pipeline code
2. **Visibility**: Canvas shows the entire data flow at a glance
3. **Debugging**: Provenance logs track every transformation step
4. **Iteration**: Quickly modify flows by reconnecting and reconfiguring processors

## User Flow

1. Navigate to `/flows` to see existing flows or create new ones
2. Click "Create Flow" to open the visual editor
3. Drag processors from the sidebar palette onto the canvas
4. Connect processors by clicking output ports and dropping on input ports
5. Configure each processor via the properties panel
6. Click "Execute" to run the flow
7. View provenance logs to monitor execution

## Key User Experience Goals

- **Instant Visual Feedback**: Canvas updates in real-time as users build flows
- **Clear Data Flow**: Color-coded processor categories (source=green, transform=blue, sink=amber)
- **Execution Transparency**: Provenance log shows input/output counts, timing, errors
- **Minimal Configuration**: Sensible defaults for all processor settings

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page with feature overview |
| `/flows` | Flow listing and creation |
| `/flows/[id]` | Visual flow editor |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/flows` | GET | List all flows |
| `/api/flows` | POST | Create new flow |
| `/api/flows/[id]` | GET | Get flow details |
| `/api/flows/[id]` | PUT | Update flow |
| `/api/flows/[id]` | DELETE | Delete flow |
| `/api/flows/[id]/execute` | POST | Execute flow |
| `/api/flows/[id]/provenance` | GET | Get provenance events |
| `/api/processors` | GET | List processor definitions |
