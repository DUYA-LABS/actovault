# Actovault

**Verify changes. Govern actions.**

Actovault is an early-stage, MIT-licensed project for verifying critical application rules before deployment and enforcing rules when AI agents execute supported actions.

**Status: specification and repository scaffold. There is no working SDK, verification engine, or production runtime yet.** Names and interfaces may change. Do not use this scaffold as a security control.

## Two modules, one foundation

| Module | Planned responsibility | First target |
| --- | --- | --- |
| Verify | Run checks and produce reproducible evidence of rule violations | Cross-tenant access regressions in a sample SaaS |
| Runtime | Authorize and control supported tool execution | Tenant-scoped reads and updates |
| Core | Shared action, policy, decision, and evidence contracts | Explicit identity and tenant boundaries |

Modules should be independently useful. Passing verification does not guarantee safe future execution.

## First milestone

A developer can run a local example with synthetic data and see:
1. A legitimate same-tenant action succeed.
2. Verify reproduce an intentionally introduced tenant-isolation bug.
3. Runtime reject an equivalent cross-tenant action before side effects.
4. Missing identity, malformed input, and policy errors fail closed.
5. Evidence explain each result without exposing secrets.

The MVP uses deterministic rules and local fixtures. It does not require an LLM API key or a GPU.

## Start here

- [Project brief](docs/PROJECT_BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Draft contracts](docs/CONTRACTS.md)
- [Threat model and limitations](docs/THREAT_MODEL.md)
- [MVP acceptance criteria](docs/MVP_ACCEPTANCE.md)
- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## Repository layout

- `packages/core/`: planned contracts and policy evaluation
- `packages/verify/`: planned verification runner
- `packages/runtime/`: planned controlled executor
- `examples/tenant-demo/`: first integration specification and synthetic fixtures
- `docs/`: design and security boundaries
- `scripts/`: repository checks

## Repository checks

Install Python 3.11 or newer, clone this repository, then run:

```sh
python scripts/check_repository.py
```

This checks repository files, local Markdown file links, and JSON fixtures. It does **not** test an implemented security engine. No application installation or execution commands are available yet.

## Security boundaries

Runtime protection applies only to actions routed through an enforcement path whose credentials and network access prevent bypass. Tenant and principal identities must come from trusted authentication, not model-supplied arguments. Logs alone do not enforce policy.

Universal rollback, guaranteed prompt-injection prevention, formal verification, immutable audit storage, and regulatory compliance are not provided. See the [threat model](docs/THREAT_MODEL.md).

## Community and licensing

Small, reviewed contributions are welcome; start with [contribution guidance](CONTRIBUTING.md). Report vulnerabilities using [SECURITY.md](SECURITY.md).

The contents of this repository are licensed under [MIT](LICENSE). No proprietary enterprise module or dual-license arrangement exists in this repository. Potential hosted or enterprise offerings are future product decisions.
