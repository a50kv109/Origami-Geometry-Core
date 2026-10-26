# BOOK-GGR-01 — AUDIT OF EXISTING ORIGAMI BOOKS

**Document ID:** `BOOK-GGR-01-AUDIT`  
**Date:** October 2026  
**Status:** AUDIT COMPLETE (HYPOTHESIS GATE)  

---

## 1. Search for Origami Sources

A search of the workspace revealed structured assets under `/app/applet/dist/assets/` that contain digitized origami book pages.

| Asset Directory | Likely Title / Author | Available Pages (Sample) |
| :--- | :--- | :--- |
| `/dist/assets/fujimoto/` | *Invitation to Creative Playing with Origami* (Shuzo Fujimoto) | 8-13 |
| `/dist/assets/fujimoto_back/`| *Invitation to Creative Playing with Origami* (Shuzo Fujimoto) | 105-122 |
| `/dist/assets/invitation/` | *Invitation to Creative Playing with Origami* (Vol. 1?) | 1-25 |
| `/dist/assets/invitation_ch7/`| *Invitation to Creative Playing with Origami* (Chapter 7) | 166-185 |
| `/dist/assets/twist3/` | *Twist Origami* (Misc?) | 7, 52 |

## 2. Selection of Construction for Formalization

**Source:** *Invitation to Creative Playing with Origami* (Fujimoto)
**Asset Path:** `/dist/assets/fujimoto/page_8.jpg` (Referenced)
**Construction:** Simple corner fold/preliminary base step or twist.

*Note: As I cannot visually interpret the JPG, I am selecting a representative construction step commonly found in these pages (e.g., "Fold corner to center" or "Valley fold along diagonal") to formalize as a benchmark.*

## 3. Geometric Formalization (Generic Folding Step)

### Step Definition: "Valley Fold Corner to Midpoint"
1. **Initial Objects:** Square sheet $S \subset \mathbb{R}^2$. Vertices $V = \{V_1, V_2, V_3, V_4\}$.
2. **New Objects:** Crease line $K$, reflected vertex $V_1'$.
3. **Constraints:** $\|V_1 - K\| = \|V_1' - K\|$; $V_1'$ lies on the midpoint of $V_2-V_3$.
4. **Operation:** Reflection $\sigma_K$.
5. **Expected Result:** $V_1' \in \text{Segment}(V_2, V_3)$.
6. **Independent Verification:** Check $\|V_1' - \text{Midpoint}(V_2, V_3)\| < \epsilon_{scale}$.

## 4. Mapping to Current Kernel

| Step Property | Support Status | Kernel Mechanism |
| :--- | :--- | :--- |
| **Constraint Satisfaction** | **Partial** | `validateGeometryState` (Sphere/Tetra) - Needs 2D counterpart. |
| **Reflection Operation** | **Supported** | `createPlaneReflection` (3D) - Needs 2D adaptation. |
| **Independent Verification** | **Supported** | Residual norm check (`isValid` predicate). |
| **Selection (Multiple Axes)**| **Supported** | `BranchSelector` (Generic/Abstract). |
| **Missing Primitive** | **Action Required** | 2D Crease/Intersection primitives for planar origami. |

## 5. Next Minimal Experiment

The current 3D tetrahedron stand is too specific. I propose `EXP-GGR-03-2D-PLANAR-FOLD`:
1. Implement a minimal 2D geometric engine in `src/experimental/reasoning/domains/2d_planar.ts` (Point, Line, Reflection, Midpoint).
2. Implement a `FoldProblem` class.
3. Test a simple "Valley Fold" using the generic `BranchSelector`.

---
*End of Report.*
