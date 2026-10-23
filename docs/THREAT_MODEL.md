# Threat model

Status: initial design review, not a security certification.

## Assets and trust boundaries

Protected assets include tenant records, adapter credentials, policy definitions, approval authority, and evidence. Treat model output, prompts, retrieved content, tool arguments, and ordinary client claims as untrusted.

Authentication and trusted resource ownership cross into the enforcement boundary through explicitly reviewed adapters. A compromised host, administrator, or underlying database is outside the initial protection boundary.

## Threats and proposed controls

| Threat | Required control | Initial coverage |
| --- | --- | --- |
| Cross-tenant resource ID | Resolve ownership and enforce tenant scope in the database operation | MVP target |
| Forged tenant or role | Derive context from trusted authentication | MVP target |
| Unknown tool or malformed arguments | Allowlist and strict runtime validation | MVP target |
| Policy evaluation failure | Block execution; report error | MVP target |
| Direct service access | Separate agent permissions from adapter credentials and restrict reachability | Required deployment assumption |
| Changed request after approval | Bind approval to exact action and expiry | Later |
| Duplicate or uncertain writes | Durable operation state, adapter idempotency, reconciliation | Later |
| Sensitive data in evidence | Metadata-first reporting and redaction | MVP target |
| Concurrent ownership changes | Atomic tenant predicate or validated resource version | MVP target |
| Tampered local evidence | External integrity and retention controls | Not implemented |

## Limits

No implementation exists yet. Even after implementation, protected actions must pass through the controlled executor. An LLM response proxy is not sufficient when the agent has independent database, API, browser, or shell access.

Testing cannot establish absence of all vulnerabilities. Prompt-injection detection is not an authorization boundary. Policy correctness and authentication correctness remain operator responsibilities.

Do not claim formal security guarantees, universal rollback, exactly-once delivery, immutable logs, or compliance certification.

## Evidence handling

Use synthetic data in public reproductions. Never commit credentials, production payloads, personal information, or another tenant's records. Avoid leaking record existence in denial explanations.

## Security reporting

Follow [SECURITY.md](../SECURITY.md). Before implementing external integrations, update this threat model and document deployment assumptions and bypass paths.
