# Tenant demo specification

This directory contains synthetic fixtures only. There is no runnable demo yet.

## Intended application

A tiny SaaS exposes record.read and record.update through a trusted adapter. Each record belongs to one tenant. Caller identity is passed through trusted authentication context, separately from untrusted tool arguments.

The fixture contains tenant-a and tenant-b with one record each. All names and values are fictional.

## Adapters to implement

- Safe adapter: reads and updates apply an atomic tenant predicate.
- Unsafe adapter: deliberately omits tenant scoping so Verify can reproduce a leak. Keep it confined to the demo and label it unsafe in every entry point.

The Runtime demonstration must reject cross-tenant access before executing a write. Verify must separately expose the unsafe application's behavior.

## Evidence

Report pass, violation, or error with a scenario identifier, tested revision, policy version, and synthetic reproduction. Do not record credentials or real customer data.

See [MVP acceptance criteria](../../docs/MVP_ACCEPTANCE.md). No LLM, GPU, hosted account, or paid API should be required for the first demo.
