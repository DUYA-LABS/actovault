# Project brief

## User and problem

First user: a developer maintaining a multi-tenant SaaS application and adding agent-operated tools.

AI-written changes can weaken tenant isolation; agents can also propose actions outside the authority of the authenticated user. Actovault explores independent verification and execution controls for these boundaries.

## Product hypothesis

Developers will adopt a small, inspectable tool that reproduces access violations and blocks supported unauthorized actions with clear evidence. This hypothesis requires user validation; a working demo is not proof of market demand.

## First scope

- Core uses TypeScript executed directly by pinned Node.js 24.19.0. It has no third-party dependencies; native type stripping does not perform static type checking.
- Local synthetic tenant data and deterministic policy checks.
- One read tool and one update tool.
- Verify checks against an explicitly unsafe adapter.
- Runtime enforcement around a safe adapter.
- Machine-readable evidence and a readable CLI summary.
- No model-provider dependency for the first milestone.

## Out of scope initially

Dashboards, SaaS hosting, billing, broad connector catalogues, model-based injection classifiers, generalized sagas, payment execution, shell execution, compliance certifications, and production credential management.

## Success

A new developer can run the documented demo without maintainer help, understand exactly what was tested, and distinguish an observed violation from an infrastructure error.

## Open decisions

Add a pinned static TypeScript checker before publishing packages. Define durable execution storage before promising retry safety. Choose one real design partner workflow before adding integrations.
