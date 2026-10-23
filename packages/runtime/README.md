# Runtime

Planned home for controlled, tenant-scoped tool execution.

No implementation or published package exists yet.

The first slice supports allow/deny for record reads and updates. It derives identity from trusted context, validates arguments, and enforces tenant scope at storage operations. Approval and durable retry handling are later work.

See [architecture](../../docs/ARCHITECTURE.md) and [threat model](../../docs/THREAT_MODEL.md).
