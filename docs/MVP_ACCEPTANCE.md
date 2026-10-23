# MVP acceptance criteria

The first implementation is complete only when these scenarios run locally with documented commands and no model API credentials.

## Fixtures

Two synthetic tenants each own a record. Trusted caller contexts are separate from tool arguments. An intentionally unsafe adapter and a safe adapter are clearly marked and isolated.

## Required scenarios

1. Same-tenant read returns only the caller tenant's record.
2. Same-tenant update changes only the intended record.
3. Cross-tenant read is blocked without disclosing record contents.
4. Cross-tenant update is blocked; compare stored state before and after to demonstrate no mutation.
5. A forged tenant field cannot override authenticated tenant context.
6. Missing principal, missing tenant, unknown tool, and malformed parameters each block execution.
7. Policy evaluation errors and unavailable ownership information block execution.
8. The safe database adapter applies tenant scope atomically when reading or updating.
9. Verify detects a real cross-tenant read through the unsafe adapter.
10. Verify passes the corresponding safe scenario and reports infrastructure failures as errors.
11. Reports identify the scenario, policy version, observed behavior, and reproduction without secrets.
12. Unsupported approval-required decisions block rather than execute.

## Verification independence

Do not test only mocked policy responses. Assert observable database state and actual returned records. Include negative controls: if the verification detector is disabled or the unsafe adapter is substituted, the expected failure must be observable.

## Deferred release gates

Before adding approvals: test expiry, replay, changed arguments, and wrong principal.
Before claiming durable retry protection: test concurrent duplicate requests, process restart, and downstream timeout after a committed write.

## Non-goals

No production-ready gateway, external payment processing, generalized rollback, model classifier, or compliance export is part of this milestone.
