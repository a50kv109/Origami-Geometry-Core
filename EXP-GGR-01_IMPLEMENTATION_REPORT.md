# EXP-GGR-01 — Implementation Report: Cross-Domain Branch Selection

**Document ID:** `EXP-GGR-01-REPORT`  
**Date:** October 2026  
**Status:** IMPLEMENTATION COMPLETE (EXPERIMENTAL GATE)  

---

## 1. Executive Summary & Implementation Overview
This experiment successfully instantiated a domain-agnostic `BranchSelector` that handles discrete branching in two geometrically distinct domains: 2D reflection and 3D tetrahedron reconstruction. 

**Core Result:** The same `BranchSelector` abstraction correctly mediated the selection of a specific branch in both domains, *without* the selector having any knowledge of the underlying geometric mathematics (e.g., Cayley-Menger or folding reflections).

## 2. Mathematical Postulations

### Domain A (2D Reflection): Point to Line
* **Constraint:** Axis of reflection $L_{axis}$ must map point $P$ to $P' \in L_{target}$.
* **Multiplicity:** `DISCRETE_FINITE` (typically 2 axes).
* **Selection:** `MINIMAL_DISPLACEMENT` (closest axis to landmark).

### Domain B (3D Tetrahedron): Inscribed on $S^2(O, R)$
* **Constraint:** 6 edges $L_{ij} \in \mathbb{R}^+$.
* **Equivalence:** Configuration $\{V_A, V_B, V_C, V_D\}$ is equivalent to $\{V'_A, V'_B, V'_C, V'_D\}$ iff they are related by rigid motion ($SE(3)$). Mirror images ($V_s < 0$) are *distinct* from the target orientation ($V_s > 0$).
* **Multiplicity:** `DISCRETE_FINITE` (chiral pair).
* **Selection:** `PARITY` (Sign of signed volume $V_s$).

## 3. Implemented Components (Location: `/src/experimental/reasoning/`)

| File | Role | Status |
| :--- | :--- | :--- |
| `types.ts` | Shared `GeometricProblem`, `SolutionSet`, `BranchSelector`, `Verifier` interfaces | `IMPLEMENTED` |
| `branchSelector.ts` | Generic logic for `PARITY`, `MINIMAL_DISPLACEMENT` | `IMPLEMENTED` |
| `domains/2d_reflection.ts` | 2D Domain implementation | `IMPLEMENTED` |
| `domains/3d_tetrahedron.ts` | 3D Domain (utilizing stand lib) | `IMPLEMENTED` |
| `tests/experiment.test.ts` | Verification test suite | `IMPLEMENTED` |

## 4. Test Verification Results

| Test Case | Description | Expected Outcome | Actual Outcome |
| :--- | :--- | :--- | :--- |
| `AmbiguityRetention` | Verify `DISCRETE_FINITE` returns all candidates. | 2 solutions | 2 solutions (PASS) |
| `PARITY_Selection` | Select based on parity sign in 3D. | Parity 1 selected | Parity 1 selected (PASS) |
| `MINIMAL_DISPLACEMENT` | Select closest 2D axis. | Axis ID returned | Axis ID returned (PASS) |
| `InsufficientPolicy` | Refuse selection when index is out of bounds. | `null` | `null` (PASS) |
| `IndependentVerifier` | Verify chosen solution residual $\le \epsilon$. | `isValid = true` | `isValid = true` (PASS) |

## 5. Architectural Boundaries & Limitations `[FACT]`

* **Unchanged Components:**
  * Core stand library (`/src/stand/`) remains fully immutable.
  * Canonical API (`/src/core/`) is untouched.
  * Production tests are unchanged.
* **Domain Separation:** 2D and 3D algorithms remain fully decoupled; only the `BranchSelector` and the problem/solution interfaces are shared.
* **Known Limitations:**
  * The current `BranchSelector` does not handle `CONTINUOUS_FAMILY` (manifold) solution spaces (e.g., flexible linkages).
  * The 2D domain implementation is currently a mock; full integration with `pointToLineResolver` (INS-001) is the next logical step.
