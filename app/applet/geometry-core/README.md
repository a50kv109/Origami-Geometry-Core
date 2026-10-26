# Geometry Reasoning Core

Deterministic geometric reasoning engine and cross-domain constraint-resolution framework.

## Purpose
This project provides a robust, self-contained implementation of a geometric reasoning pipeline based on the separation of constraints, solution sets, and independent verification. It is designed to be domain-agnostic and supports deterministic branch selection in geometric configurations.

## Features
- **Geometric Reasoning Pipeline:** Separation of constraints, solver output, disambiguation policies, and independent verification.
- **Branch Disambiguation:** Generic `BranchSelector` supporting `PARITY`, `MINIMAL_DISPLACEMENT`, and `EXPLICIT_INDEX` policies.
- **Independent Verification:** Decoupled residual norm evaluation.
- **Modular Architecture:** Core mathematical engine separated from experimental modules.

## Installation
```bash
npm install
```

## Running Tests
```bash
npm test
```

## Documentation
- [Architecture](ARCHITECTURE.md)
- [Status](STATUS.md)
- [Testing](TESTING.md)
- [Known Limitations](KNOWN_LIMITATIONS.md)

## License
License pending definition by the project owner.
