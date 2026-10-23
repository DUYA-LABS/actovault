# Draft contracts

Status: design specification, not a stable API. All incoming data requires runtime validation; TypeScript types alone do not establish trust.

## Action

| Field | Meaning | Authority |
| --- | --- | --- |
| schemaVersion | Event format version | Validated protocol |
| actionId | Unique execution attempt identifier | Executor |
| principalId | Authenticated initiating identity | Trusted authentication |
| agentId | Agent identity, when available | Trusted registration |
| tenantId | Authenticated tenant scope | Trusted authentication |
| tool | Allowlisted tool identifier | Validated request |
| parameters | Tool-specific normalized arguments | Untrusted until validated |
| resourceTenantId | Actual ownership of target resource | Trusted adapter |
| policyVersion | Policy evaluated for this action | Policy store |
| idempotencyKey | Optional logical operation identifier | Validated and tenant-scoped |

Never treat a tenant ID supplied by the model as authenticated context. Namespace operation identifiers by tenant and principal to avoid cross-tenant collisions.

## Policy

Each policy has an ID, immutable version identifier, supported tools, and deterministic rules. First policy: deny by default; permit same-tenant record reads and updates only when authenticated scope matches trusted resource ownership.

Missing or malformed ownership data is a denial or explicit evaluation error that blocks execution. Unknown tools are denied.

## Decision

Required fields: actionId, policyId, policyVersion, outcome, reasonCode, evaluatedAt.

Outcomes: allow, deny, require_approval. Evaluation errors block execution and are recorded distinctly. Initial implementation supports allow and deny only; require_approval must block until an approval implementation exists.

Reason codes must be stable machine-readable values. Human-readable explanations must not expose another tenant's data.

## Verification result

Required fields: scenarioId, detectorVersion, policyVersion, status, observedAt, reproduction, evidence.

Status: pass, violation, error. Reproduction uses synthetic identifiers. The report must identify the adapter and revision tested.

## Execution event

Required fields: eventId, schemaVersion, actionId, policyVersion, timestamp, stage, status.

Stages distinguish decision, execution, and compensation. Execution states should distinguish not_started, started, succeeded, failed, and unknown. Decision events must not imply successful execution.

## Compatibility

Version serialized formats explicitly. Add compatibility checks before publishing packages. No cryptographic authenticity, append-only durability, or remote attestation is implied by these field definitions.
