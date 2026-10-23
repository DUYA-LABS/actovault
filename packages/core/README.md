# Core

Experimental, dependency-free TypeScript contracts and deterministic tenant policy. No package has been published.

## Run tests

Use Node.js 24.19.0 (see `.nvmrc`) and run `npm test` from the repository root. Native TypeScript type stripping runs the source without a build step. It does not perform static type checking; a compiler check remains a release prerequisite.

## Usage

```typescript
import { assessAction } from './packages/core/src/index.ts';

// Supplied by your trusted host after authenticating the caller.
const authenticatedContext = { principalId: 'user-a', tenantId: 'tenant-a' };
const toolRequest = { tool: 'record.read', parameters: { recordId: 'record-a' } };
const assessment = await assessAction(
  authenticatedContext,
  toolRequest,
  async (recordId, context) => {
    // Demo only. A real trusted adapter must resolve actual ownership.
    return recordId === 'record-a' ? 'tenant-a' : undefined;
  },
);
console.log(assessment.decision);
```

Allowed assessments contain a frozen action. Denied/error assessments contain only a decision. Stable reason codes explain outcomes without including submitted record values or adapter exception text. Invalid input is rejected before ownership lookup.

The initial policy allows only same-tenant record.read and record.update. Requests reject extra fields, including tenant or role claims. Updates accept strings up to 4096 UTF-16 code units; identifiers use a bounded ASCII format.

## Trust boundary

This API does not authenticate caller context, execute tools, stop direct database access, or prevent ownership changes after assessment. Anyone with in-process access can construct context. The host must supply trusted context and ownership adapters. The future Runtime must enforce tenant scope again at the actual storage operation and execute the assessed snapshot.

Inputs must be parsed JSON-like data. Arbitrary JavaScript objects and proxies are not a sandboxed input format. An ownership resolver that never settles will keep assessment pending; cancellation and timeout behavior remain integration work.

No model classifier, approval implementation, durable retry handling, or compensation is provided. Core remains independent of Verify and Runtime.

Read [contracts](../../docs/CONTRACTS.md), [architecture](../../docs/ARCHITECTURE.md), and [acceptance criteria](../../docs/MVP_ACCEPTANCE.md).
