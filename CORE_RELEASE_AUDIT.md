# Geometry Reasoning Core — Release Audit

## Release status

The standalone package is being published on a dedicated branch of the existing `Origami-Geometry-Core` repository because the available GitHub integration does not expose a repository-creation operation. The existing `main` branch and parent application are left unchanged.

**Verification status: INCOMPLETE.** Package structure was inspected. The local shell could not resolve `registry.npmjs.org`, so dependency installation, baseline tests, experimental tests, and TypeScript validation have not completed. No passing test status is claimed.

## Package contents

- `src/core/` — geometry model, operations, metrics, interfaces, topology, transformations.
- `src/experimental/` — branch selector, sample 2D/3D domains, experiment tests.
- `src/verifier/` — independent reflection verifier.
- `src/tests/` and `scripts/` — deterministic/schema tests and runner.
- `schemas/` — pattern passport JSON Schema.
- `docs/` — architecture, status, testing guidance, and limitations.
- `README.md`, `LICENSE`, `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`.

## License

MIT License. Copyright line: `Copyright (c) 2026 Andrii Artsybashev`.

## Checks

| Check | Status | Evidence |
|---|---|---|
| Required package paths | PASS | Inspected source archive and the release package tree |
| Excludes parent UI and media | PASS | Only standalone package paths are in the release branch |
| npm install / npm ci | BLOCKED | `npm ping` failed with `ENOTFOUND registry.npmjs.org` |
| Baseline tests | NOT RUN | Dependencies unavailable |
| Experimental tests | NOT RUN | Dependencies unavailable |
| TypeScript check | NOT RUN | Required type packages were not installed |

Static checks are not a proof of mathematical correctness or passing runtime tests.
