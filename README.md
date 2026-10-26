# Geometry Reasoning Core

Standalone TypeScript research package for representing and checking geometric claims.

## Scope

The package includes a 3D geometry core, a 2D reflection subsystem, experimental solution selection, and an independent verifier. A producer's result is a claim, not a verified fact. The independent verifier covers selected 2D reflection invariants only; it does not prove every operation or every possible input.

This is research software, not a formally verified geometry system. Physical paper thickness, continuous folding kinematics, and general collision behavior are out of scope.

## Structure

- `src/core/` — geometry model, operations, topology, metrics, semantics, and agent interfaces.
- `src/verifier/` — independent checks for supported reflection properties.
- `src/experimental/` — experimental branch selection and sample 2D/3D domains.
- `src/tests/` — deterministic and schema-validation tests.
- `schemas/` — pattern passport JSON Schema.
- `scripts/runTests.ts` — core test runner.
- `docs/` — architecture, status, testing instructions, and known limitations.

## Requirements and checks

Use Node.js 20+ and npm. From this directory, run:

```sh
npm ci
npm test
npm run test:exp
npm run build
```

During publication preparation, npm registry DNS was unavailable, so dependency installation, tests, and compilation were not executed. This upload is not a claim of passing tests.

## Extending a domain

Experimental domains implement `GeometricProblem` in `src/experimental/types.ts` and return a `SolutionSet`. Keep candidate generation, selection policy, and independent checking separate. Add tests for both accepted and rejected cases before relying on a new domain's output.

See `docs/ARCHITECTURE.md`, `docs/STATUS.md`, `docs/TESTING.md`, and `docs/KNOWN_LIMITATIONS.md` for more details.
