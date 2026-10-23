# Roadmap

This is a sequence of evidence-based milestones, not delivery dates.

## M0 — Repository foundation

- [x] Project brief, architecture, threat model, and draft contracts
- [x] Module boundaries and synthetic fixture
- [x] Contribution and security guidance
- [x] Automated repository integrity checks
- [ ] Review design with developers maintaining multi-tenant applications

## M1 — Local vertical slice

- [x] Pin Node.js for native TypeScript execution (static type checking remains pending)
- [x] Implement validated Core action contracts and deterministic tenant policy
- [ ] Add pinned static type checking before publishing packages
- [ ] Implement safe and deliberately unsafe local adapters
- [ ] Implement observable Verify scenarios
- [ ] Implement Runtime allow/deny execution
- [ ] Pass all [MVP acceptance criteria](docs/MVP_ACCEPTANCE.md)
- [ ] Document one-command demo and machine-readable reports

## M2 — First external users

- [ ] Observe installation without maintainer assistance
- [ ] Validate one real workflow with a design partner
- [ ] Document failure modes, integration effort, and runtime overhead
- [ ] Add one external integration selected from observed demand
- [ ] Publish a tagged experimental release with compatibility notes

## M3 — Consequential execution

- [ ] Exact-action approval binding and expiry
- [ ] Durable operation tracking and adapter-specific idempotency
- [ ] Crash, concurrency, timeout, and reconciliation tests
- [ ] Explicit compensation for a supported reversible operation
- [ ] Independent review before production-security claims

## Later, only if demanded

Central management, organization policy distribution, hosted operations, enterprise identity, and support. No enterprise edition exists yet; the public repository remains MIT-licensed.
