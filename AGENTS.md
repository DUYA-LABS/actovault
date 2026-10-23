# Instructions for coding agents

## Project state

This repository is a specification/scaffold. Do not describe planned modules as implemented. Read README.md, docs/ARCHITECTURE.md, docs/CONTRACTS.md, docs/THREAT_MODEL.md, and docs/MVP_ACCEPTANCE.md before implementation.

## Scope

Work on the assigned issue. Do not add a dashboard, hosted service, billing, generic rollback engine, model provider dependency, or additional integration without an explicit requirement.

Preserve the MIT license. Do not introduce a contributor agreement or change licensing without owner direction.

## Boundaries

- Core cannot depend on Verify or Runtime.
- Verify and Runtime cannot depend on each other.
- Authenticate context outside model-supplied arguments.
- Validate runtime inputs and resolve resource ownership through trusted adapters.
- Deny unknown tools and block policy errors.
- Enforce tenant scope at the actual storage operation.
- Unsupported approval-required actions must not execute.
- Do not claim exactly-once execution, immutable evidence, compliance, or universal recovery.
- Keep unsafe fixtures confined to examples/tests.

## Validation and reporting

Run the available repository checks. Once code is implemented, run relevant tests for actual effects, missing identity, cross-tenant access, concurrency where applicable, and negative controls. Report exactly what ran and what remains untested.

Do not add dependencies without checking necessity and documenting their purpose. Never commit credentials, personal data, node_modules, build output, or logs.

Do not publish packages, create releases, or deploy services unless explicitly instructed.
