# Geometry Reasoning Core — Release Audit

## Release status

The standalone package is being prepared on a dedicated branch of the existing `Origami-Geometry-Core` repository because the connected GitHub integration does not expose a repository-creation operation. The existing `main` branch and parent application are unchanged.

**Verification status: INCOMPLETE.** Package structure was inspected. The local shell could not resolve `registry.npmjs.org`, so dependency installation, baseline tests, experimental tests, and TypeScript validation have not completed. No passing test status is claimed.

## Package contents

- `src/core/` — geometry model, operations, metrics, interfaces, topology and transformations.
- `src/experimental/` — branch selector, sample 2D/3D domains and experiment tests.
- `src/verifier/` — independent reflection verifier.
- `src/tests/` and `scripts/` — deterministic/schema test suites and runner.
- `schemas/` — pattern passport JSON Schema.
- `docs/` — architecture, status, testing guidance and limitations.
- `README.md`, `LICENSE`, `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`.

## License

MIT License. Copyright line: `Copyright (c) 2026 Andrii Artsybashev`.

## Checks

| Check | Status | Evidence |
|---|---|---|
| Required source paths | PASS | Existing source tree was inspected |
| Parent application/media excluded from the release package | PASS | Only the standalone package is listed for the release branch |
| npm installation | BLOCKED | `npm ping` failed with `ENOTFOUND registry.npmjs.org` |
| Baseline tests | NOT RUN | Dependencies unavailable |
| Experimental tests | NOT RUN | Dependencies unavailable |
| TypeScript check | NOT RUN | Required type packages were not installed |

Static checks are not a proof of mathematical correctness or passing runtime tests.
