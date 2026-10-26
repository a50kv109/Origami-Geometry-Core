# Geometry Reasoning Core

A deterministic geometric reasoning engine and cross-domain constraint-resolution framework.

## Purpose
This project provides a robust, self-contained implementation of a geometric reasoning pipeline based on the separation of constraints, solution sets, and independent verification. It is domain-agnostic and supports deterministic branch selection in geometric configurations.

## Features
- **Geometric Reasoning Pipeline:** Separation of constraints, solver output, disambiguation policies, and independent verification.
- **Branch Disambiguation:** Generic `BranchSelector` supporting `PARITY`, `MINIMAL_DISPLACEMENT`, and `EXPLICIT_INDEX` policies.
- **Independent Verification:** Decoupled residual norm evaluation.

## Installation
```bash
npm install
```

## Running Tests
- **Core Baseline Tests:** `npm test`
- **Experimental Tests:** `npm run test:exp`

## Adding a New Geometry Domain
To extend the reasoning engine to a new domain:
1.  **Define the Problem:** Create a class implementing the `GeometricProblem<T>` interface.
2.  **Implement `solve()`:** The solver should return a `SolutionSet<T>` classifying the outcomes.
3.  **Implement `verify()`:** Create an independent `Verifier<T>` to audit chosen solutions.
4.  **Selection:** Use the `BranchSelector<T>` with an appropriate policy to pick a solution branch.

## Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [Status](docs/STATUS.md)
- [Testing](docs/TESTING.md)
- [Known Limitations](docs/KNOWN_LIMITATIONS.md)

## License
[MIT License](LICENSE).
