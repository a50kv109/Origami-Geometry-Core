# EXP-GGR-01 — Cross-Domain Branch Selection: Specification Gate

**Document ID:** `EXP-GGR-01-SPEC`  
**Date:** October 2026  
**Status:** PROPOSAL GATE — EXPERIMENTAL SPECIFICATION  

---

## 1. Formalization of General Branch Selection Mechanism `[HYPOTHESIS]`

To achieve domain-agnostic geometric reasoning, we propose the following minimal abstraction for branch selection. This decouples the **Reasoning Protocol** from the **Domain-Specific Mathematics**.

### 1.1 Core Abstractions

```typescript
/** 
 * Minimal Domain-Agnostic Geometric Abstractions 
 */

// Encapsulates the goal and the geometric constraints for a specific problem.
export interface GeometricProblem<T> {
  readonly id: string;
  readonly constraints: ConstraintSet;
  readonly solve: () => SolutionSet<T>;
}

// Immutable representation of the constraints C(X) <= 0.
export interface ConstraintSet {
  readonly predicates: readonly ((x: any) => boolean)[];
  readonly toleranceScale: number;
}

// Result of a geometric solver, distinguishing between solution types.
export type SolutionSet<T> = 
  | { readonly type: 'EMPTY' }
  | { readonly type: 'UNIQUE'; readonly solution: T }
  | { readonly type: 'DISCRETE_FINITE'; readonly solutions: readonly T[] }
  | { readonly type: 'CONTINUOUS_FAMILY'; readonly dimension: number };

// The disambiguation logic decoupled from the solver.
export interface RuleSelector<T> {
  readonly policy: 'PARITY' | 'MINIMAL_DISPLACEMENT' | 'SYMMETRY_PRESERVING' | 'EXPLICIT_INDEX';
  readonly select: (solutions: readonly T[]) => T | null; // null if insufficient data
}

// Domain-specific verification predicate C(X*) <= epsilon.
export interface Verifier<T> {
  readonly verify: (solution: T) => { readonly isValid: boolean; readonly residual: number };
}
```

### 1.2 The Generalized Workflow `[PROPOSAL]`
1. **Instantiate** `GeometricProblem<T>` with constraints.
2. **Execute** `solve()` to obtain `SolutionSet<T>`.
3. **If** `DISCRETE_FINITE`, **Apply** `RuleSelector<T>` based on explicit policy.
4. **Instantiate** chosen solution $T^*$.
5. **Execute** `Verifier<T>.verify(T*)` independently to confirm `isValid`.

---

## 2. Domain-Specific Analysis

### 2.1 Domain A: 2D Geometry (Point onto Line Reflection) `[FACT]`
Based on the definition of reflection across an axis $L_{axis}$ mapping point $P$ to a point $P' \in L_{target}$.

*   **Problem:** Find reflection axis $L_{axis}$ such that $P' = \text{Reflection}(P, L_{axis}) \in L_{target}$.
*   **Geometric Invariant:** The reflection axis $L_{axis}$ must be the angle bisector of $\angle P L_{target} P'$ or a perpendicular bisector path.
*   **Multyplicity:** Depending on the distance of $P$ to $L_{target}$, the solution can be `EMPTY` (if $P$ is too close), `DISCRETE_FINITE` (usually 1 or 2 fold lines), or `CONTINUOUS_FAMILY` (if $P$ is on $L_{target}$).
*   **Rule Selector:** `MINIMAL_DISPLACEMENT` (fold line closest to reference landmark) or `EXPLICIT_INDEX`.
*   **Verifier:** Independent computation of distance $d(P', L_{target}) \le \epsilon$.

### 2.2 Domain B: 3D Geometry (Tetrahedron Reconstruction) `[FACT]`
Based on `src/core/construction.ts` and `src/core/metrics.ts`.

*   **Problem:** Given 6 edge lengths $\{L_{ij}\}$, reconstruct vertices $\{A, B, C, D\}$ on $S^2(O, R)$.
*   **Geometric Invariant:** Cayley-Menger determinant $\Gamma(L) > 0$.
*   **Multyplicity:** `DISCRETE_FINITE` (exactly 2 chiral solutions, $z_D = \pm h$, for $\Gamma(L) > 0$).
*   **Rule Selector:** `PARITY` (Positive Volume Sign vs. Negative Volume Sign).
*   **Verifier:** Independent check of all 6 Euclidean distances via `distance3D` (`src/core/geometryState.ts`) against input lengths $\{L_{ij}\}$.

---

## 3. Structural Comparison Matrix

| Property | Domain A (2D Reflection) | Domain B (3D Tetrahedron) | Common Structure (A & B) |
| :--- | :--- | :--- | :--- |
| **Constraint Source** | Geometry Invariants ($PP' \perp L_{axis}$) | Edge Lengths ($L_{ij}$) | Geometric Equalities |
| **Solution Set** | `DISCRETE_FINITE` | `DISCRETE_FINITE` | Finite Multiplicity |
| **Rule Selector** | Policy (e.g., proximity) | Parity (Volume sign) | Explicit Disambiguation |
| **Verification** | Point-to-line distance $\le \epsilon$ | Edge length residua $\le \epsilon$ | Residual Norm Check |
| **Degeneracy** | Point on line | Coplanar ($V_s = 0$) | Boundary Singularity |

### A. General Structure (Shared) `[HYPOTHESIS]`
The interaction `SolutionSet` $\to$ `RuleSelector` $\to$ `Choice` $\to$ `Independent Verification` is identical in both domains.

### B. Algorithm-Specific (Unique) `[FACT]`
*   **Domain A:** Parabola intersection / Cubic resolvent for H6 Axiom.
*   **Domain B:** Trilateration + Circumcenter centering algorithm in `src/core/construction.ts`.

### C. Non-Unifiable Properties `[FACT]`
*   **Geometric Topology:** 2D reflection axis vs. 3D vertex coordinates.
*   **Realization Rules:** Reflection requires distance bisector properties; Tetrahedron requires Cayley-Menger embedding.

---

## 4. Success Criteria

The experiment succeeds if and only if:
1.  **Ambiguity Retention:** The abstraction correctly returns `DISCRETE_FINITE` (containing both chiral solutions or both fold axes) *before* `RuleSelector` is invoked.
2.  **Constraint Integrity:** The `RuleSelector` never chooses a solution $T^*$ that violates the `Verifier` residual norm $\epsilon_{scale}$.
3.  **Orthogonal Audit:** The `Verifier` successfully detects incorrect branches if the `RuleSelector` is forced to select a solution that fails the predicate (e.g., forcing negative volume when positive is required).
4.  **Failure Mode:** If the `RuleSelector` has no valid policy for the given geometry (e.g., empty policy), the system returns `null` or `error` instead of silently picking index 0.
5.  **Implementation Orthogonality:** The mechanism remains the same, despite completely different underlying primitive solvers (Trilateration vs. Fold Axis construction).

---

## 5. Minimal Implementation Plan

*   **Step 1:** Define the `ReasoningAbstraction` interface in a new isolated experimental file `src/core/reasoning/types.ts`.
*   **Step 2:** Implement a mock `GeometricProblem` for both domains.
*   **Step 3:** Implement the `BranchSelector` that works on the `CandidateSolution<T>` interface.
*   **Step 4:** Run comparative tests:
    *   Injecting 2D reflection candidates.
    *   Injecting 3D chiral tetrahedra candidates.
*   **Step 5:** Assert that the *same* `selectBranch` logic determines the outcome for both.

---
*End of Specification.*
