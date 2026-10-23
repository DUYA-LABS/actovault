# Architecture

Status: Core contracts and tenant policy are implemented experimentally. Verify, Runtime, storage adapters, approvals, and durable execution remain proposed designs.

Core uses Node.js native TypeScript execution with zero third-party dependencies. Run `npm test` for runtime boundary tests. Static type checking is not configured yet; add a pinned compiler and Node type definitions before package publication.

## Dependency direction

Core has no dependency on Verify or Runtime. Verify and Runtime may depend on Core, but must not depend on each other. The example application integrates them.

Core contains contracts and deterministic policy evaluation. It must not embed service credentials or call an LLM to decide basic authorization.

## Verify

Accepts explicit test scenarios and invokes an isolated test adapter against synthetic data. Compares observed behavior with expected access rules and produces reproducible evidence.

The first detector must observe the application's behavior, not merely call the same policy evaluator and report agreement. An intentionally unsafe application adapter is a negative control proving that the detector can expose an actual leak.

Results distinguish pass, violation, and error. A timeout or broken fixture is an error, never a pass. Verification is bounded testing, not proof that no vulnerability exists.

## Runtime

Proposed flow:
1. Authenticate the caller outside model-controlled inputs.
2. Validate and normalize an allowlisted tool request.
3. Resolve the resource tenant using the trusted adapter.
4. Evaluate the action against a pinned policy version.
5. Deny, require approval, or execute the exact authorized action.
6. Record an outcome, including failures and uncertain results.

A client cannot supply its own authoritative tenant or role. A resource ID in tool arguments must be resolved and checked against trusted ownership data.

The adapter must enforce tenant scope at the actual database operation to avoid time-of-check/time-of-use gaps. Downstream services must not accept bypass credentials from the agent.

## Approval and retries

Approval is a later milestone. It must bind to the principal, tenant, tool, normalized parameters, resource version where relevant, policy version, and expiry. Parameter changes invalidate approval.

Durable retries are also a later milestone. An idempotency key is not an exactly-once guarantee. Cross-process persistence, downstream idempotency support, and reconciliation of uncertain outcomes are necessary. Never retry an unknown write outcome blindly.

## Evidence

Record decision and execution separately: allow does not mean execution succeeded. Store metadata by default; redact secrets and sensitive arguments. Local evidence is neither immutable nor independently trustworthy when the host is compromised.

## Recovery

Only explicitly supported adapters may offer compensation. Compensation can fail and may not restore original state. No universal undo or automatic reversal of external actions is promised.

## Packaging

Start as a single repository with independent packages. Avoid separate services until deployment requirements justify them. Keep the public core usable locally without a hosted account.
