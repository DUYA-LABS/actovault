# Contributing to Actovault

Actovault is at the specification/scaffold stage. Read the [brief](docs/PROJECT_BRIEF.md), [architecture](docs/ARCHITECTURE.md), and [threat model](docs/THREAT_MODEL.md) first.

## Workflow

1. Open an issue describing the problem, observable result, and proposed scope.
2. Discuss contract or security-boundary changes before implementing them.
3. Create a focused branch and pull request.
4. Run `npm test` with Node.js 24.19.0 and `python scripts/check_repository.py` with Python 3.11+. No npm install is required.
5. Include relevant evidence and update affected documentation.

A maintainer should review security-sensitive changes before merging. Do not submit production credentials or real customer data.

## Implementation expectations

Core must remain independent of Verify and Runtime. Verify and Runtime must remain independently adoptable. Prefer deterministic controls for authorization. Fail closed on missing identity or policy errors.

When implementation begins, add meaningful tests for trust boundaries, adversarial inputs, observable side effects, and uncertain outcomes. A test that repeats the implementation's assumptions is insufficient.

## AI-assisted contributions

AI-assisted work is welcome. The contributor remains responsible for understanding the change, checking generated dependencies and licenses, reviewing security-sensitive code, and providing reproducible validation. Never give an agent production credentials to reproduce an issue.

## Licensing

Contributions are accepted under the repository's existing MIT license. Only contribute material you have the right to submit. There is no separate contributor agreement at this stage.

## Conduct

Be respectful, explain technical disagreements with evidence, and protect private information. Maintainers may remove harassment, spam, or disclosed secrets. Security concerns should follow [SECURITY.md](SECURITY.md).
