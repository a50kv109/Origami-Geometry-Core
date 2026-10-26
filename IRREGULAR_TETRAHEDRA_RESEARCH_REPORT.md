# Research Mission Report: From Regular to Irregular Tetrahedra
**Autonomous Geometric & Architectural Investigation**  
**Target Repository:** `geometry-reasoning-stand-3d-v2` (`public/assets/aistudio/geometry-reasoning-stand-3d-v2-main__5__1f2923be.zip`)  
**Investigator:** AI Studio Reasoning Engine  
**Date:** October 2026  
**Status:** COMPLETE RESEARCH AUDIT & ARCHITECTURAL SPECIFICATION (PROPOSAL / HYPOTHESIS GATE)  

---

## Executive Summary & Epistemic Framework

### Core Research Question
Can the existing 3D Geometric Reasoning Stand (`geometry-reasoning-stand-3d-v2`), currently validated primarily on canonical regular tetrahedra inscribed in a sphere $S^2(O, R)$, be utilized as a deterministic experimental testbed for:
1. **Irregular and asymmetric tetrahedra** (disphenoids, scalene, orthocentric, and near-degenerate configurations);
2. **Inverse geometric design** (determining 3D vertex coordinates from given edge lengths, face areas, or dihedral constraints);
3. **Origami crease pattern synthesis and rigid folding translation** (flat net generation, seam compatibility, angle defects, and dihedral folding paths)?

### Epistemic Status Discipline
In strict compliance with Package 05 (`docs/architecture-packages/PACKAGE_05_VERIFICATION_RESEARCH_AND_AGENT_INTERFACE.md`) and the project charter, all findings in this report are categorized under explicit epistemic classifications:
* **`[FACT]`**: Direct, empirical truth verified in existing code files, mathematical definitions, or executing test suites in `src/`.
* **`[HYPOTHESIS]`**: Mathematical theorem, invariant, or conjectural behavior subject to empirical verification on the stand.
* **`[PROPOSAL]`**: Forward-looking architectural design, data contract, or algorithmic extension not yet committed to the canonical core.

---

## Stage 1: Current 3D Stand Model Audit

### 1.1 Sphere Constraint vs. Polyhedral Regularity: The Fundamental Distinction

A central question is whether the Stand's foundational object—an inscribed tetrahedron on $S^2(O, R)$—is inherently tied to regularity, or whether it naturally accommodates general irregular tetrahedra.

#### The Mathematical Truth `[FACT]`
1. **Circumscribed Sphere Universality for 3D Simplices:**  
   Every non-degenerate tetrahedron $T = (A, B, C, D)$ in Euclidean space $\mathbb{R}^3$ possesses a **unique circumscribed sphere** $S^2(C, R_{circ})$.  
   The circumcenter $C$ is the unique intersection of the six perpendicular bisector planes of its edges. The circumradius $R_{circ} = \|A - C\| = \|B - C\| = \|C - C\| = \|D - C\|$ is strictly positive if and only if the signed volume $V_s \ne 0$.
2. **Regularity is an Extreme Submanifold:**  
   A regular tetrahedron requires all six Euclidean edge lengths (chords) to be identical:
   $$L_{AB} = L_{AC} = L_{AD} = L_{BC} = L_{BD} = L_{CD} = R \sqrt{\frac{8}{3}} \approx 1.63299316 \cdot R$$
   In the 5-dimensional intrinsic configuration manifold of sphere-inscribed tetrahedra (8 spherical degrees of freedom minus 3 global rotation degrees in $SO(3)$), the regular tetrahedron is a single isolated point with point group $T_d$ (order 24).
3. **Irregular Tetrahedra on $S^2(O, R)$:**  
   Any four non-coplanar points chosen on the sphere $S^2(O, R)$ define a valid inscribed tetrahedron. These points do not need equal angular spacing or equal edge lengths. The edge chords $L_{ij} \in (0, 2R]$ can take arbitrarily unequal values as long as the vertices reside on the sphere surface.

#### The Implementation Reality in Code `[FACT]`
1. **Canonical State Contract (`src/core/types.ts` & `src/core/geometryState.ts`):**  
   The canonical state definition is:
   ```typescript
   export interface CanonicalGeometryState {
     readonly sphere: Sphere3D;
     readonly vertices: Readonly<Record<VertexId, Point3D>>;
   }
   ```
   The validator `validateGeometryState` in `src/core/geometryState.ts` enforces:
   - Finiteness of coordinates.
   - Positivity of radius $R > 0$.
   - **Sphere membership:** $\forall v \in \{A, B, C, D\}: |\|v - sphere.center\| - R| \le \epsilon_{sphere}$.
   - **Vertex coincidence:** $\|v_i - v_j\| > \epsilon_{coincident}$.
   - **Volume evaluation:** Computes signed volume $V_s = \frac{1}{6}(B - A) \cdot ((C - A) \times (D - A))$.
   **Crucially:** `validateGeometryState` does **NOT** require $T$ to be regular. If $|V_s| > \epsilon_{volume}$ and vertices are on the sphere, it assigns `RealizationStatus.VALID_POSITIVE` or `VALID_NEGATIVE`, regardless of edge equality.
2. **Regularity as a Derived Predicate (`src/core/metrics.ts`):**  
   Regularity is computed purely as a derived global flag:
   ```typescript
   const regularityRatio = sphere.radius > 0 ? (maxEdge - minEdge) / sphere.radius : 0;
   const isRegular = regularityRatio <= tol.epsRegularity && orientation !== 'COPLANAR';
   ```
   If edges differ, `isRegular` evaluates to `false`, but the state remains 100% valid.
3. **Existing Irregular Test Evidence (`src/tests/scale_dependency_irregular.test.ts`):**  
   The repository already includes an automated test, `PAT-27: Scale-Dependency Consistency on Arbitrary Irregular Valid Tetrahedron`, which defines:
   ```typescript
   const normA = { x: 0.2, y: 0.4, z: Math.sqrt(1 - 0.2*0.2 - 0.4*0.4) };
   const normB = { x: -0.5, y: -0.5, z: Math.sqrt(1 - 0.5*0.5 - 0.5*0.5) };
   const normC = { x: 0.6, y: -0.3, z: -Math.sqrt(1 - 0.6*0.6 - 0.3*0.3) };
   const normD = { x: -0.4, y: 0.7, z: -Math.sqrt(1 - 0.4*0.4 - 0.7*0.7) };
   ```
   The test asserts that this irregular tetrahedron passes validation, scales strictly as $L \propto R$, Area $\propto R^2$, Volume $\propto R^3$, and maintains `isRegular === false` invariant under scaling.
4. **Circumscribed Sphere Solver in `src/core/construction.ts`:**  
   The function `constructExplicitTetrahedron(inputVertices, explicitSphere?)` contains an analytical solver `fitCircumscribedSphere(v)`:
   $$2(v_i - v_A) \cdot C = \|v_i\|^2 - \|v_A\|^2 \quad \text{for } i \in \{B, C, D\}$$
   If an explicit sphere is omitted, it automatically calculates the exact circumcenter and circumradius of any non-coplanar input vertices.

### 1.2 Evaluation of Metrics & Validation Layers `[FACT]`

| Module | Regular-Specific Assumptions | Irregular Support Status | Location / Reference |
| :--- | :--- | :--- | :--- |
| **`geometryState.ts`** | None. Base object is general tetrahedron. | **Full Support.** Evaluates general signed volume $V_s$, non-coincidence, and sphere tolerance. | `src/core/geometryState.ts:35-120` |
| **`metrics.ts`** | `computeRegularTetrahedronMetric(radius)` calculates ideal values. | **Full Support.** `computeDerivedMetrics` calculates all 6 chord lengths, 4 planar face areas, normals, perimeters, centroid $G$, and volume independently. | `src/core/metrics.ts:100-190` |
| **`tolerances.ts`** | Dimensionless regularity threshold `epsRegularity = 1e-4`. | **Full Support.** All tolerances are scale-resolved dynamically from characteristic scale $R$ ($L \sim R, \text{Area} \sim R^2, \text{Vol} \sim R^3$). | `src/core/tolerances.ts:40-65` |
| **`lvg.ts` (Local Vertex Geometry)** | None. Computes Gram matrix, dihedral angles, and solid angles via Oosterom-Strackee for arbitrary vertices. | **Full Support.** Classifies degeneracies into D0 (valid), D1 (collinear), D2 (coplanar), D3 (near-degenerate), D4 (inverted), D5 (numerical fault). | `src/core/lvg.ts:30-150` |
| **`dlvm.ts` (Directed Local Vertex Manifold)** | None. Verifies pairwise anti-parallelism of shared edge unit vectors ($u_{AB}^{(A)} + u_{BA}^{(B)} = 0$). | **Full Support.** Edge anti-parallelism is topologically universal for any straight Euclidean edge. | `src/core/dlvm.ts:40-110` |
| **`symmetry.ts`** | Tests high-symmetry generators ($T_d$: 4 $C_3$, 3 $C_2$, 6 $\sigma_d$, 6 $S_4$, inversion). | **Partial Support.** For irregular tetrahedra, it correctly refutes the symmetries and finds $C_1$ or $D_2$. However, it does not yet contain generators for lower subgroups like $C_s, C_2, C_{2v}, D_{2d}$ if not aligned with canonical axes. | `src/core/symmetry.ts:130-240` |
| **`agentGateway.ts`** | None. Exposes `query_metric`, `verify_claim`, `perturb_geometry`, `inspect_passport`. | **Full Support.** Supports arbitrary vertex coordinates via `construct_object` with `EXPLICIT_TETRAHEDRON`. | `src/core/agentGateway.ts:330-410` |

### 1.3 Code vs. Documentation Discrepancies `[FACT]`
1. **Terminology Bias:** Several overview documents (`README.md`, `3D_OBJECT_PASSPORT_ARCHITECTURE_REPORT.md`) colloquially refer to the stand as the "Regular Tetrahedron Stand". However, architectural contract `PACKAGE_02_GEOMETRIC_CONTRACT_AND_REPRESENTATION.md` and `GEOMETRIC_MODEL.md` Section 3 explicitly clarify:
   > *"The base object of the stand is the general inscribed tetrahedron $T = (A, B, C, D)$ with $A, B, C, D \in S^2(O, R)$... The regular tetrahedron is NOT a distinct geometric primitive. It is merely an infinitesimal singular point in the 5-dimensional intrinsic configuration manifold."*
2. **Spherical Coordinates vs. Edge Chords:** While the UI offers spherical coordinate sliders $(\phi, \lambda)$, the edges rendered and measured are straight 3D chords (1-simplices), not spherical arcs. This design is mathematically appropriate for polyhedral geometry and origami.
3. **Fixed Radius Constraint in Viewport:** The current UI and `validateGeometryState` default to a fixed sphere $S^2(O, R)$ (usually $R=1$ or $2$). When testing arbitrary irregular tetrahedra, one must either:
   - Scale the tetrahedron such that its circumradius equals $R$; or
   - Pass the adapted sphere $S^2(C, R_{circ})$ to the canonical state.

---

## Stage 2: Experimental Irregular Configurations Taxonomy

To systematically investigate non-regular geometry on the stand, we define six benchmark classes of tetrahedra spanning symmetry breaking, chirality, and boundary degeneracies.

```
+-----------------------------------------------------------------------------------+
|                        TETRAHEDRON SYMMETRY LANDSCAPE                            |
|                                                                                   |
|  [Regular Tetrahedron] (Point Group Td, Order 24)                                 |
|         |                                                                         |
|         +---> [Tetragonal Disphenoid] (Point Group D2d, Order 8)                  |
|         |            | (Opposite edges equal in pairs, 4 congruent isosceles)     |
|         |            v                                                            |
|         +---> [Rhombic Disphenoid] (Point Group D2, Order 4)                      |
|         |            | (Opposite edges equal in pairs, 4 congruent scalene)       |
|         |            v                                                            |
|         +---> [Tri-rectangular / Corner] (Point Group C3v or C1)                  |
|         |            | (Three mutual right angles at one apex)                    |
|         |            v                                                            |
|         +---> [General Scalene] (Point Group C1, Order 1)                         |
|         |            | (All 6 edges distinct, all 4 faces distinct)               |
|         |            v                                                            |
|         +---> [Near-Degenerate & Degenerate] (Volume -> 0, Coplanar, Collinear)   |
+-----------------------------------------------------------------------------------+
```

### 2.1 Baseline: Canonical Regular Tetrahedron (`REG-00`) `[FACT]`
* **Symmetry:** Point Group $T_d$ (Order 24), Rotational Subgroup $T \cong A_4$ (Order 12).
* **Edge Metric:** All 6 edges equal: $L_{ij} = R \frac{4}{\sqrt{6}} \approx 1.632993 \cdot R$.
* **Face Metric:** 4 equilateral triangles, each area $S_F = \frac{2\sqrt{3}}{3} R^2 \approx 1.154701 \cdot R^2$.
* **Volume:** $V_s = \frac{8\sqrt{3}}{27} R^3 \approx 0.513200 \cdot R^3$.
* **Centroid:** $G = (0, 0, 0) = O$.
* **Canonical Coordinates ($R=1$):**
  $$A = (0, 0, 1), \quad B = \left(\frac{2\sqrt{2}}{3}, 0, -\frac{1}{3}\right), \quad C = \left(-\frac{\sqrt{2}}{3}, -\frac{\sqrt{6}}{3}, -\frac{1}{3}\right), \quad D = \left(-\frac{\sqrt{2}}{3}, \frac{\sqrt{6}}{3}, -\frac{1}{3}\right)$$

### 2.2 Class 1: Disphenoid / Isosceles Tetrahedra (`DISP-01`) `[HYPOTHESIS]`
* **Definition:** A tetrahedron whose four faces are congruent triangles. Opposite edges are pairwise equal:
  $$L_{AB} = L_{CD} = a, \quad L_{AC} = L_{BD} = b, \quad L_{AD} = L_{BC} = c$$
* **Symmetry:**
  - If $a = b \ne c$: Tetragonal disphenoid (Point group $D_{2d}$, order 8).
  - If $a \ne b \ne c$: Rhombic disphenoid (Point group $D_2$, order 4).
* **Mathematical Invariants:**
  - The circumcenter $C$ coincides with the centroid $G = (0, 0, 0)$.
  - All four faces have identical perimeter $P = a + b + c$ and identical area $S_F$.
  - Inscribed in a sphere centered at origin if coordinates are placed as vertices of an orthotropic box:
    $$A = (+x_0, +y_0, +z_0), \quad B = (+x_0, -y_0, -z_0), \quad C = (-x_0, +y_0, -z_0), \quad D = (-x_0, -y_0, +z_0)$$
    where $x_0^2 + y_0^2 + z_0^2 = R^2$.
    The edge lengths are:
    $$a = 2\sqrt{y_0^2 + z_0^2}, \quad b = 2\sqrt{x_0^2 + z_0^2}, \quad c = 2\sqrt{x_0^2 + y_0^2}$$
* **Stand Testability:** Fully testable via `constructExplicitTetrahedron`. `isRegular` will evaluate to `false`, but $G = (0,0,0)$ will hold within $\epsilon_{finite}$.

### 2.3 Class 2: Tri-Rectangular / Right-Corner Tetrahedron (`RECT-01`) `[HYPOTHESIS]`
* **Definition:** Three edges meeting at vertex $A$ are mutually orthogonal:
  $$\vec{AB} \perp \vec{AC}, \quad \vec{AC} \perp \vec{AD}, \quad \vec{AD} \perp \vec{AB}$$
* **Mathematical Invariants:**
  - Let $u = L_{AB}, v = L_{AC}, w = L_{AD}$.
  - The opposite face edges satisfy Pythagorean relations:
    $$L_{BC} = \sqrt{u^2 + v^2}, \quad L_{CD} = \sqrt{v^2 + w^2}, \quad L_{BD} = \sqrt{u^2 + w^2}$$
  - Signed Volume: $V = \frac{1}{6} u v w$.
  - De Gua's Theorem holds: $S_{BCD}^2 = S_{ABC}^2 + S_{ABD}^2 + S_{ACD}^2$.
  - Circumradius: $R_{circ} = \frac{1}{2} \sqrt{u^2 + v^2 + w^2}$. The circumcenter $C$ is the midpoint of the hypotenuse sphere.

### 2.4 Class 3: General Scalene Tetrahedron (`SCAL-01`) `[HYPOTHESIS]`
* **Definition:** All six edge lengths are mutually distinct ($L_{AB} \ne L_{AC} \ne L_{AD} \ne L_{BC} \ne L_{BD} \ne L_{CD}$), and all four faces are non-congruent scalene triangles.
* **Symmetry:** Trivial point group $C_1$ (Order 1, only the identity operation $E$).
* **Mathematical Invariants:**
  - Centroid $G \ne O$.
  - All four solid angles $\Omega(v)$ computed in `lvg.ts` are distinct.
  - All six dihedral angles are distinct.
  - Zero non-trivial rotational or reflection symmetries.

### 2.5 Class 4 & 5: Near-Degenerate & Degenerate Configurations (`DEG-01`, `DEG-02`) `[FACT]`
* **Near-Flat (`DEG-01`):** Vertex $D$ approaches the plane formed by $A, B, C$.
  - $|V_s| \to \epsilon_{volume} = 10^{-7} R^3$.
  - The Gram determinant in `src/core/lvg.ts` drops toward zero ($g_{det} < 10^{-12}$).
  - LVG categorizes vertex $D$ as `D3_NEAR_DEGENERATE`.
* **Coplanar Degenerate (`DEG-02`):** All four vertices lie in a single plane (e.g., a great circle or small circle on $S^2$).
  - $V_s = 0$.
  - `validateGeometryState` assigns `RealizationStatus.DEGENERATE` and `GeometryValidationCode.COPLANAR_VERTICES`.
  - The solid remains a valid data structure in the stand, confirming that the engine does not crash or throw exceptions on flat configurations.
* **Collinear Degenerate (`DEG-03`):** Two or more vertices coincide.
  - Edge length $L_{ij} \le \epsilon_{coincident} = 10^{-6} R$.
  - Validator triggers `COINCIDENT_VERTICES`.

### 2.6 Class 6: Chiral / Enantiomorphic Pairs (`CHIR-01`) `[HYPOTHESIS]`
* **Definition:** A scalene tetrahedron $T$ and its mirror image $T^* = \sigma(T)$ across any reflection plane.
* **Mathematical Invariants:**
  - All corresponding edge lengths $L_{ij}$ and face areas $S_F$ are identical.
  - Signed volume changes sign: $V_s(T^*) = -V_s(T)$.
  - $T$ and $T^*$ cannot be brought into congruence by any proper 3D rotation ($SO(3)$).
* **Stand Representation:**
  - $T$ has `RealizationStatus.VALID_POSITIVE`.
  - $T^*$ has `RealizationStatus.VALID_NEGATIVE`.
  - The stand treats both as fully valid Euclidean solids without rejection.

---

## Stage 3: The Inverse Geometric Problem (Edges/Faces $\to$ 3D Vertices)

In forward kinematics, coordinates determine edge lengths. In inverse design, desired edge lengths or face specifications determine coordinates.

```
INVERSE PROBLEM FLOW:
   6 Edge Lengths {L_ij}
           │
           ▼
   [Triangle Inequalities] ────(Violated)───> [IMPOSSIBLE_FACE]
           │ (Valid)
           ▼
   [Cayley-Menger Determinant] ──(CM <= 0)──> [FLAT_OR_NON_EMBEDDABLE]
           │ (CM > 0)
           ▼
   [Trilateration Embedding in ℝ³]
   (Fix A at origin, B on +X, C in XY plane, solve D_z = ±√...)
           │
           ▼
   [Circumcenter Solver] ───> Translate to C(0,0,0), Radius R_circ
           │
           ▼
   [CanonicalGeometryState Realization]
```

### 3.1 Mathematical Formulation & Feasibility Conditions

#### Condition 1: 2D Face Metric Feasibility (Triangle Inequalities) `[FACT]`
For each of the four faces $F \in \{ABC, ABD, ACD, BCD\}$, the three edge lengths must strictly satisfy the planar triangle inequalities:
$$L_{ij} + L_{jk} > L_{ik}, \quad L_{ij} + L_{ik} > L_{jk}, \quad L_{jk} + L_{ik} > L_{ij}$$
If any equality holds ($a + b = c$), the face degenerates into a line segment. If violated, no Euclidean face exists.

#### Condition 2: 3D Embeddability (Cayley-Menger Determinant) `[FACT]`
The six edge lengths can be isometrically embedded in Euclidean space $\mathbb{R}^3$ if and only if the Cayley-Menger determinant is strictly positive:
$$\Gamma(L) = \det \begin{pmatrix} 
0 & L_{AB}^2 & L_{AC}^2 & L_{AD}^2 & 1 \\ 
L_{AB}^2 & 0 & L_{BC}^2 & L_{BD}^2 & 1 \\ 
L_{AC}^2 & L_{BC}^2 & 0 & L_{CD}^2 & 1 \\ 
L_{AD}^2 & L_{BD}^2 & L_{CD}^2 & 0 & 1 \\ 
1 & 1 & 1 & 1 & 0 
\end{pmatrix}$$
The volume of the tetrahedron is given by:
$$V^2 = \frac{1}{288} \Gamma(L)$$
* If $\Gamma(L) > 0$: A unique non-degenerate 3D tetrahedron exists (up to rigid motion and reflection).
* If $\Gamma(L) = 0$: The tetrahedron is flat (coplanar in $\mathbb{R}^2$).
* If $\Gamma(L) < 0$: The metric space cannot be embedded in Euclidean $\mathbb{R}^3$ (hyperbolic or non-metric).

#### Condition 3: Circumradius Compatibility `[FACT]`
The circumradius $R_{circ}$ of the tetrahedron determined by the six edges is:
$$R_{circ}^2 = \frac{\det(D_{borderless})}{2 \cdot 144 V^2} = \frac{-\det \begin{pmatrix} 0 & L_{AB}^2 & L_{AC}^2 & L_{AD}^2 \\ L_{AB}^2 & 0 & L_{BC}^2 & L_{BD}^2 \\ L_{AC}^2 & L_{BC}^2 & 0 & L_{CD}^2 \\ L_{AD}^2 & L_{BD}^2 & L_{CD}^2 & 0 \end{pmatrix}}{288 V^2}$$
To inscribe the resulting tetrahedron into the Stand's canonical sphere $S^2(O, R)$, one must either:
1. Rescale the edge lengths by factor $s = R / R_{circ}$; or
2. Allow the stand to adopt $R = R_{circ}$.

### 3.2 Canonical Gauge Fixing & Trilateration Embedding Algorithm `[PROPOSAL]`

Because Euclidean distance is invariant under the Euclidean group $SE(3) \times \mathbb{Z}_2$ (translations, rotations, and reflections), six edge lengths determine vertex coordinates up to 6 continuous degrees of freedom plus 1 discrete chirality bit.

To obtain deterministic Cartesian coordinates:
1. **Fix Vertex $A$ at the Origin:**
   $$A = (0, 0, 0)$$
2. **Fix Vertex $B$ along the $+X$ Axis:**
   $$B = (L_{AB}, 0, 0)$$
3. **Fix Vertex $C$ in the $XY$ Plane ($y_C > 0$):**
   Using standard law of cosines in $\triangle ABC$:
   $$x_C = \frac{L_{AB}^2 + L_{AC}^2 - L_{BC}^2}{2 L_{AB}}$$
   $$y_C = \sqrt{L_{AC}^2 - x_C^2} \quad (\text{strictly } > 0 \text{ for non-collinear } A, B, C)$$
   $$z_C = 0$$
4. **Solve for Vertex $D = (x_D, y_D, z_D)$ via Trilateration:**
   From distances to $A, B, C$:
   $$x_D^2 + y_D^2 + z_D^2 = L_{AD}^2 \quad (1)$$
   $$(x_D - L_{AB})^2 + y_D^2 + z_D^2 = L_{BD}^2 \quad (2)$$
   $$(x_D - x_C)^2 + (y_D - y_C)^2 + z_D^2 = L_{CD}^2 \quad (3)$$
   Subtracting (1) from (2):
   $$x_D = \frac{L_{AB}^2 + L_{AD}^2 - L_{BD}^2}{2 L_{AB}}$$
   Subtracting (1) from (3) and substituting $x_D$:
   $$y_D = \frac{L_{AC}^2 + L_{AD}^2 - L_{CD}^2 - 2 x_C x_D}{2 y_C}$$
   Finally, from (1):
   $$z_D^2 = L_{AD}^2 - x_D^2 - y_D^2$$
   * If $L_{AD}^2 - x_D^2 - y_D^2 < -\epsilon$: Reject (inconsistent lengths, $\Gamma(L) < 0$).
   * If $|z_D^2| \le \epsilon$: $z_D = 0$ (coplanar degeneracy).
   * If $z_D^2 > \epsilon$: Two solutions:
     $$z_D = +\sqrt{L_{AD}^2 - x_D^2 - y_D^2} \implies \text{Chiral Right-Handed } (V_s > 0)$$
     $$z_D = -\sqrt{L_{AD}^2 - x_D^2 - y_D^2} \implies \text{Chiral Left-Handed } (V_s < 0)$$
5. **Centering onto Circumscribed Sphere:**
   Compute circumcenter $C_{circ} = \text{fitCircumscribedSphere}(\{A, B, C, D\})$.
   Translate all vertices:
   $$V_i' = V_i - C_{circ}$$
   Now all $V_i' \in S^2(O, R_{circ})$, perfectly matching the Canonical Geometry State format.

### 3.3 Solution Multiplicity & Degeneracy Analysis `[FACT]`
* **Exact Edge Set (6 lengths):** At most 1 pair of chiral solutions $\{T, T^*\}$ in $\mathbb{R}^3$.
* **Face Area Set Only (4 areas):** Under-determined. An infinite 2-parameter continuum of non-congruent tetrahedra share the same four face areas.
* **Opposite Edge Pairs Equal (Disphenoids):** A 3-parameter family parameterized by $(a, b, c)$.

---

## Stage 4: Connection to Origami & Rigid Folding

Folding a 3D tetrahedron from flat paper connects 2D planar crease patterns to the 3D canonical stand.

```
ORIGAMI NET FOLDING KINEMATICS:
+------------------------+                        +------------------------+
| 2D Crease Pattern      |                        | 3D Folded Tetrahedron  |
| Flat Sheet (Net)       |                        | Spatial Polyhedron     |
|                        |   Dihedral Fold Path   |                        |
|   / \                  | ─────────────────────> |        /\              |
|  /   \                 |   theta_e(t): 0 -> theta|       /  \             |
| /_____\                |                        |      /____\            |
| \     /                |                        |      \    /            |
|  \   /                 |                        |       \  /             |
|   \ /                  |                        |        \/              |
+------------------------+                        +------------------------+
   Planar Angles: alpha_i                            Solid Angle: Omega(v)
   Sum(alpha_i) < 2*pi                               Defect: delta = 2*pi - sum
```

### 4.1 Planar Unfolding & Net Topologies `[FACT]`

Every convex tetrahedron can be cut along three edges forming a spanning tree of its 1-skeleton and unfolded into a non-overlapping planar net in $\mathbb{R}^2$ (Alexandrov's Unfolding Theorem).

For a tetrahedron with 4 vertices and 6 edges, the spanning tree of vertices has $4 - 1 = 3$ edges. Thus, exactly 3 edges are cut, and $6 - 3 = 3$ edges remain as hinge creases.

There are two topological classes of nets for any tetrahedron:
1. **Central / Star Net (Flower Net):**
   - One base face (e.g., $ABC$) is surrounded by the three remaining faces ($ABD, BCD, ACD$) sharing its three boundary edges.
   - Hinge edges: $AB, BC, CA$.
   - Cut edges: $AD, BD, CD$ (each split into two coincident boundary segments in the 2D pattern).
2. **Strip / Chain Net (Hamiltonian Path Net):**
   - The four triangular faces are joined in a linear sequence: $F_1 - e_1 - F_2 - e_2 - F_3 - e_3 - F_4$.
   - Three internal fold lines; five boundary edges.

```
       A (Apex D1)
       / \
      /   \
     / ABD \
    /       \
   B---------A (Base)
  / \  ABC  / \
 /   \     /   \
/ BCD \   / ACD \
-------   -------
C (Apex D2)  C (Apex D3)

   [Central / Star Net]
```

### 4.2 Mathematical Invariants & Folding Theorems `[FACT]`

#### 1. Angle Defect & Descartes' Theorem
For any vertex $V$ of a 3D convex polyhedron, the sum of face angles meeting at $V$ must be strictly less than $2\pi$:
$$\sum_{i=1}^3 \alpha_i(V) < 2\pi$$
The **angle defect** is defined as:
$$\delta(V) = 2\pi - \sum_{i=1}^3 \alpha_i(V) > 0$$
By Descartes' Total Angular Defect Theorem:
$$\sum_{V \in \{A, B, C, D\}} \delta(V) = 4\pi \approx 12.56637 \text{ rad}$$
* In a regular tetrahedron: each face angle is $\pi/3 = 60^\circ$. At each vertex, $\sum \alpha_i = 3 \times 60^\circ = 180^\circ = \pi$.
  $$\delta(V) = 2\pi - \pi = \pi = 180^\circ \quad \implies \quad 4 \times \pi = 4\pi$$
* In an irregular tetrahedron: $\delta(V)$ varies across vertices, but the total sum $\sum \delta(V)$ remains an invariant $4\pi$.

#### 2. Dihedral Angles & Rigid Origami Kinematics
* In flat sheet state: all dihedral fold angles are $\theta_e = 0$ (unfolded) or $\pi$.
* In 3D closed state: each hinge edge $e$ attains an intrinsic dihedral angle $\theta_e \in (0, \pi)$ between adjacent face normals.
* The Stand's `src/core/lvg.ts` already computes face normals $\vec{n}_1, \vec{n}_2$ and dihedral angles:
  $$\cos(\pi - \theta_e) = \vec{n}_1 \cdot \vec{n}_2 \implies \theta_e = \pi - \arccos(\vec{n}_1 \cdot \vec{n}_2)$$
* **Rigid Foldability Condition:** A continuous 1-parameter family of isometric spatial configurations $\mathbf{x}(t)$ exists from the flat net ($t=0$) to the closed tetrahedron ($t=1$) without stretching, shearing, or bending the triangular facets. Because each triangle is a rigid Euclidean 2-simplex, the motion is entirely governed by the single-degree-of-freedom folding of the three hinge creases.

#### 3. Boundary Seam Identification Rule
When the 2D sheet is folded, boundary segments originating from the same cut edge must coincide in length and meet in 3D:
$$L_{\text{seam}}^{(1)} = L_{\text{seam}}^{(2)} \quad \text{and} \quad \mathbf{x}(D_1) = \mathbf{x}(D_2) = \mathbf{x}(D_3)$$
The closure of the 3D tetrahedron corresponds to the topological quotient identifying the split boundary vertices $\{D_1, D_2, D_3\} \to D$.

#### 4. Flat-Foldability vs. 3D Polyhedral Origami Distinction
* **Flat Origami (Kawasaki-Justin & Maekawa-Justin Theorems):** Applies to degree-4 vertices folded completely flat into a plane.
* **3D Polyhedral Folding:** The tetrahedron vertices are degree-3 in 3D. A degree-3 polyhedral cone cannot be folded completely flat without adding extra crease lines into the faces. Hence, uncreased triangular faces fold into a 3D solid, not a flat-folded card.

---

## Stage 5: Actionable Architecture & Test Plan

To evolve the stand into an experimental platform for irregular tetrahedra and origami reasoning without violating existing APIs or frozen canonical state, we propose the following modular extensions.

```
PROPOSED NON-BREAKING EXTENSION ARCHITECTURE:

src/
├── core/
│   ├── geometryState.ts       <-- UNTOUCHED (Canonical Core)
│   ├── metrics.ts             <-- UNTOUCHED (Derived Metrics)
│   ├── tolerances.ts          <-- UNTOUCHED (Central Tolerance Policy)
│   ├── lvg.ts, dlvm.ts        <-- UNTOUCHED (Dynamic Reasoning)
│   │
│   ├── inverse/               <-- NEW EXTENSION MODULE
│   │   ├── cayleyMenger.ts    <-- CM determinant, volume, embeddability
│   │   ├── trilateration.ts   <-- Gauge-fixed coordinate solver
│   │   └── inverseSolver.ts   <-- 6 Edge lengths -> CanonicalGeometryState
│   │
│   └── origami/               <-- NEW EXTENSION MODULE
│       ├── netGenerator.ts    <-- Star/Chain 2D net layout & seam mapping
│       ├── angleDefect.ts     <-- Descartes defect & developability checks
│       └── foldingPath.ts     <-- 1-DOF rigid folding trajectory t in [0, 1]
│
└── tests/
    ├── inverse_tetrahedron.test.ts  <-- 15 new test assertions
    └── origami_folding.test.ts      <-- 18 new test assertions
```

### 5.1 Proposed Module Specifications `[PROPOSAL]`

#### Module 1: Inverse Geometric Solver (`src/core/inverse/`)
```typescript
export interface InverseDesignInput {
  readonly edges: {
    readonly AB: number;
    readonly AC: number;
    readonly AD: number;
    readonly BC: number;
    readonly BD: number;
    readonly CD: number;
  };
  readonly targetCircumradius?: number; // Optional scaling
  readonly chirality?: 'RIGHT_HANDED' | 'LEFT_HANDED'; // Default: RIGHT_HANDED
}

export interface InverseDesignResult {
  readonly success: boolean;
  readonly cayleyMengerDeterminant: number;
  readonly theoreticalVolume: number;
  readonly circumradius: number;
  readonly canonicalState?: CanonicalGeometryState;
  readonly error?: 'TRIANGLE_INEQUALITY_VIOLATION' | 'NEGATIVE_CAYLEY_MENGER' | 'DEGENERATE_VOLUME';
}
```

#### Module 2: Origami Net & Kinematics (`src/core/origami/`)
```typescript
export interface Point2D {
  readonly u: number;
  readonly v: number;
}

export interface OrigamiFaceNet {
  readonly faceId: FaceId;
  readonly vertices2D: readonly [Point2D, Point2D, Point2D];
}

export interface OrigamiCreaseNet {
  readonly topology: 'STAR_NET' | 'CHAIN_NET';
  readonly faces: Readonly<Record<FaceId, OrigamiFaceNet>>;
  readonly hingeEdges: readonly EdgeId[];
  readonly cutEdges: readonly EdgeId[];
  readonly angleDefects: Readonly<Record<VertexId, number>>; // Descartes defects
  readonly totalDefect: number; // Invariant 4*PI
  readonly targetDihedrals: Readonly<Record<EdgeId, number>>; // From LVG
}
```

### 5.2 Agent Gateway Command Extensions `[PROPOSAL]`

Extend the Agent Gateway with two new idempotent commands:
1. `solve_inverse_tetrahedron`: Accepts 6 edge lengths, verifies $\Gamma(L) > 0$, embeds into Cartesian space, normalizes to circumsphere, registers state in `AgentGateway`, and returns `stateId`.
2. `generate_origami_net`: Takes an existing `stateId`, computes the 2D unfoldings (Star and Chain nets), validates seam lengths, calculates angle defects, and outputs crease coordinates for visualization or plotter export.

### 5.3 Test Suite Specification (33 Assertions) `[PROPOSAL]`

#### Suite A: `inverse_tetrahedron.test.ts`
1. **`TC-INV-01: Regular Invariant Recovery`**
   - Input: $L_{ij} = \frac{4}{\sqrt{6}} \approx 1.63299316$.
   - Output: Generates regular tetrahedron with $V \approx 0.513200$, all edge residuals $< 10^{-6}$, `isRegular === true`.
2. **`TC-INV-02: Disphenoid Embedding & Centroid Centering`**
   - Input: $a=1.5, b=1.7, c=1.9$.
   - Output: 4 congruent faces, $G = (0, 0, 0)$ within $10^{-6}$, opposite edges pairwise equal.
3. **`TC-INV-03: Scalene All-Unequal Edges`**
   - Input: $L = (1.2, 1.4, 1.6, 1.8, 2.0, 2.2)$.
   - Output: Positive volume, all 6 edge lengths reproduced within $10^{-6}$, point group $C_1$.
4. **`TC-INV-04: Negative Cayley-Menger Rejection`**
   - Input: Incompatible lengths violating 3D embeddability ($\Gamma(L) < 0$).
   - Output: Explicit error `NEGATIVE_CAYLEY_MENGER`, no invalid state generated.
5. **`TC-INV-05: Triangle Inequality Rejection`**
   - Input: Face with edges $1.0, 2.0, 4.0$ ($1+2 < 4$).
   - Output: Explicit error `TRIANGLE_INEQUALITY_VIOLATION`.
6. **`TC-INV-06: Chiral Enantiomer Inversion`**
   - Output: `RIGHT_HANDED` yields $V_s > 0$; `LEFT_HANDED` yields $V_s < 0$; both have identical pairwise lengths.

#### Suite B: `origami_folding.test.ts`
1. **`TC-ORI-01: Descartes Total Defect Invariant`**
   - Evaluates $\sum_{V \in \{A,B,C,D\}} \delta(V) = 4\pi$ across regular, disphenoid, and scalene tetrahedra. Error $< 10^{-7}$.
2. **`TC-ORI-02: Seam Length Coincidence`**
   - In 2D Star Net, validates that split edges $AD_1, AD_2$ have identical length $L_{AD}$ in $\mathbb{R}^2$.
3. **`TC-ORI-03: Non-Overlapping Net Verification`**
   - Computes polygon intersection of 2D triangles in flat state; verifies zero interior overlap for Star and Chain nets.
4. **`TC-ORI-04: Dihedral Angle Correspondence`**
   - Verifies that target fold angles in net match 3D dihedral angles calculated by `src/core/lvg.ts`.
5. **`TC-ORI-05: 1-DOF Folding Path Continuity`**
   - Samples fold parameter $t \in [0, 1]$; verifies distance continuity $\lim_{\Delta t \to 0} \|\mathbf{x}(t+\Delta t) - \mathbf{x}(t)\| = 0$.

---

## Synthesis & Conclusion

1. **Current Stand Readiness:**  
   The stand is **already architected for general inscribed tetrahedra**. The regular tetrahedron is merely an isolated point on its configuration manifold. Modules `geometryState.ts`, `metrics.ts`, `tolerances.ts`, `lvg.ts`, and `dlvm.ts` natively support irregular configurations without any algorithmic modifications.
2. **Inverse Design Feasibility:**  
   The inverse problem (6 edge lengths $\to$ 3D vertices) is fully solvable via Cayley-Menger feasibility verification and trilateration gauge fixing. It directly outputs a canonical state compatible with the existing stand.
3. **Origami Reasoning Integration:**  
   Polyhedral origami unfolds naturally from the 3D stand via star and chain nets. Dihedral angles and vertex solid angles already implemented in `lvg.ts` provide the exact mathematical bridge between the 2D flat crease pattern and the 3D folded geometry.
4. **Implementation Boundary Maintained:**  
   This research report is complete and strictly adheres to the non-destructive audit gate. No existing core files or schemas were modified. The proposed modular extensions are ready for implementation in subsequent execution gates.
