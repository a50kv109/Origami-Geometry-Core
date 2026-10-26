# Architecture of Geometry Reasoning Core

## Core Components
- `src/core/`: Contains the stable geometric engine, primitive 3D operations (distances, volume, symmetries, tolerances), and canonical state management.
- `src/experimental/`: Contains reasoning modules that build upon the core, specifically the `BranchSelector` and domain-specific problem solvers (2D reflection, 3D tetrahedron).
- `tests/`: Contains test suites for reproducing geometric reasoning results.

## Reasoning Contract
The architecture enforces a strict separation:
1. **GeometricProblem<T>:** Encapsulates the domain-specific constraints and the `solve()` method.
2. **SolutionSet<T>:** Classifies outcomes (EMPTY, UNIQUE, DISCRETE_FINITE, CONTINUOUS_FAMILY).
3. **BranchSelector<T>:** Applies selection policies (e.g., PARITY) independent of the underlying geometry.
4. **Verifier<T>:** Independently audits the residual error of a chosen solution.
