# EXP-GGR-02 — Solution Space Classification Report

**Document ID:** `EXP-GGR-02-REPORT`  
**Date:** October 2026  
**Status:** AUDIT COMPLETE (HYPOTHESIS GATE)  

---

## 1. Executive Summary

This report evaluates the current capability of the experimental geometric reasoning framework (`/src/experimental/reasoning/`) to classify solution spaces according to the proposed general geometric reasoning principle. The audit distinguishes between existing implementations and required conceptual expansions.

## 2. Audit of Implementation Status

The current implementation uses a four-class taxonomy defined in `/src/experimental/reasoning/types.ts`:

```typescript
export type SolutionType = 'EMPTY' | 'UNIQUE' | 'DISCRETE_FINITE' | 'CONTINUOUS_FAMILY';
```

| Classification Class | Implementation Status | Executable Proof |
| :--- | :--- | :--- |
| **`UNIQUE`** | Modeled in `types.ts` | **NOT IMPLEMENTED** (No solver currently returns this) |
| **`DISCRETE_FINITE`**| Implemented | **CONFIRMED** (2D/3D solvers) |
| **`CONTINUOUS_FAMILY`**| Modeled in `types.ts` | **NOT IMPLEMENTED** |
| **`EMPTY`** | Implemented | **CONFIRMED** |
| **`ALREADY_SATISFIED`**| **NOT IMPLEMENTED** | N/A |
| **`UNDERDETERMINED`** | **NOT IMPLEMENTED** | N/A |

## 3. Analysis of Research Hypothesis

### 3.1 Factually Confirmed Implementation
The framework correctly separates the **Solution Space** (`SolutionSet<T>`) from the **Selection Policy** (`BranchSelector<T>`). Solvers correctly categorize results into `DISCRETE_FINITE` or `EMPTY` before the selector is applied, confirming the fundamental hypothesis that space classification is a distinct reasoning stage.

### 3.2 Conceptual vs. Implementation Gap
1. **`ALREADY_SATISFIED`**: Currently, a solver returning a valid solution does not distinguish between "found a new solution" and "already satisfied."
   * *Requirement:* Solvers need a `checkSatisfied()` predicate that runs *before* `solve()`.
2. **`UNDERDETERMINED`**: Currently, a solver simply does not return enough information, often defaulting to `CONTINUOUS_FAMILY` or `EMPTY`.
   * *Requirement:* Explicit classification for scenarios where constraints are mathematically insufficient to close the system of equations.

## 4. Identified Ambiguities and Defects

1. **Defect (Taxonomy Mismatch):** The lack of `ALREADY_SATISFIED` and `UNDERDETERMINED` in the executable `types.ts` prevents solvers from correctly classifying common geometric scenarios.
2. **Ambiguity (Resolution):** For `CONTINUOUS_FAMILY`, the current contract provides no mechanism to represent the degree of freedom (DOF). A `CONTINUOUS_FAMILY` must be accompanied by an algebraic description of the manifold (e.g., parametric equations).
3. **Architecture/Implementation:** The `SolutionSet` union type in `types.ts` is robust, but the domain solvers do not yet implement the required logic to identify the missing classes.

## 5. Proposed Minimal Experiment (EXP-GGR-02-FIX)

1. **Extend `SolutionType`:** Add `ALREADY_SATISFIED` and `UNDERDETERMINED` to `/src/experimental/reasoning/types.ts`.
2. **Update Solver Contracts:** Require `GeometricProblem<T>` to expose a `checkSatisfied()` method.
3. **Implement 2D Refinement:** Modify `ReflectionProblem` to return `UNDERDETERMINED` if the reflection axis is not fully constrained (e.g., $P$ lies on $L_{target}$).
4. **Implement 3D Refinement:** Modify `TetrahedronProblem` to return `ALREADY_SATISFIED` if the input vertices already form a tetrahedron congruent to the target within tolerance.

---

## 6. Final Verdict: PARTIAL

*   **Logic:** The 6-stage framework holds.
*   **Implementation:** The solution space classification is partially implemented; core structural patterns exist, but the advanced taxonomy required by the hypothesis is incomplete.
*   **Result:** The experimental framework is structurally sound but lacks the full resolution capability to verify the hypothesis for more complex cases (non-finite or already-satisfied spaces).

---
*End of Report.*
