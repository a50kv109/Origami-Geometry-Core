# General Geometric Reasoning: Beyond Figure-Specific Solvers
**Research Directive & Architectural Framework Report**  
**Repository Context:** `geometry-reasoning-stand-3d-v2` & `skilla` (Origami Geometric Reasoning)  
**Document ID:** `GGR-RESEARCH-001`  
**Date:** October 2026  
**Status:** COMPLETE RESEARCH DIRECTIVE REPORT (HYPOTHESIS & ARCHITECTURAL PROPOSAL GATE)  

---

## 1. Executive Summary & Epistemic Framework

### 1.1 Context & Strategic Realignment
Geometric reasoning software frequently falls into the trap of over-specialization: creating monolithic solvers dedicated to a single geometric shape (e.g., a "regular tetrahedron stand", a "circle intersection tool", or an "origami valley-fold calculator"). While such tools solve isolated instances, they fail to scale into a unified geometric intelligence.

The tetrahedron in `geometry-reasoning-stand-3d-v2` is **not the ultimate goal or architectural boundary** of this project. It is an **initial experimental testbed**—the minimal non-trivial 3D simplex possessing non-zero volume, dihedral angles, face interactions, and non-trivial spatial symmetries.

The true objective is to extract, validate, and formalize a **domain-agnostic framework for geometric reasoning and generative design**, applicable across dimensions (2D Euclidean planes, 3D spatial polyhedra, spherical geometry) and domains (synthetic Euclidean construction, origami kinematics, mechanical linkages, and architectural form-finding).

### 1.2 Epistemic Protocol
In accordance with Package 05 (`docs/architecture-packages/PACKAGE_05_VERIFICATION_RESEARCH_AND_AGENT_INTERFACE.md`) and the Skilla Epistemic Charter, every claim throughout this document is explicitly labeled:
* **`[FACT]`**: Grounded directly in verified source code, existing unit tests, or established mathematical theorems.
* **`[HYPOTHESIS]`**: A conjectural property, workflow, or pattern formulated for empirical falsification through subsequent experiments.
* **`[PROPOSAL]`**: An architectural blueprint, data contract, or interface design intended for future implementation gates.

---

## 2. The Core Research Hypothesis: The 6-Stage Reasoning Framework

### 2.1 The Hypothesized General Framework `[HYPOTHESIS]`
We hypothesize that every non-trivial geometric construction or inverse design task can be structured into an invariant 6-stage reasoning pipeline:

```
+─────────────────────────────────────────────────────────────────────────────+
|                    THE 6-STAGE GEOMETRIC REASONING PIPELINE                 |
+─────────────────────────────────────────────────────────────────────────────+
|                                                                             |
|  [Stage 1: Target Definition]                                               |
|      Formal goal: Target object, topology, dimension, or global invariant.   |
|          │                                                                  |
|          ▼                                                                  |
|  [Stage 2: Constraint Formalization]                                        |
|      Equational & relational bounds: distances, angles, coplanarity,        |
|      tangencies, symmetry invariance, boundary inclusions.                  |
|          │                                                                  |
|          ▼                                                                  |
|  [Stage 3: Admissible Solution Space Exploration]                           |
|      Multiplicity classification:                                           |
|      Empty (Infeasible) | Discrete Finite | Continuous Family | Bifurcated  |
|          │                                                                  |
|          ▼                                                                  |
|  [Stage 4: Strategy & Disambiguation Selection]                             |
|      Selection policy: Parity, minimal displacement, energy, orientation,   |
|      kinematic reachability, construction order optimization.               |
|          │                                                                  |
|          ▼                                                                  |
|  [Stage 5: Deterministic Construction & Dependency Execution]                |
|      Execution of primitive sequence; topological instantiation;            |
|      coordinate assignment; causal dependency DAG compilation.             |
|          │                                                                  |
|          ▼                                                                  |
|  [Stage 6: Independent Verification Gate]                                   |
|      Orthogonal audit of invariants against Stage 1 & 2 without reusing     |
|      solver internals; residual norm evaluation against scale tolerances.   |
|                                                                             |
+─────────────────────────────────────────────────────────────────────────────+
```

### 2.2 The Separation of Concerns Axiom `[FACT]`
Derived directly from empirical research in `skilla/docs/research/INS-001_INTEGRATION_REPORT.md` and validated in `INS-001_VERIFICATION_REPORT.md`:
$$\text{Constraint} \ne \text{Solution Set} \ne \text{Selection Rule} \ne \text{Construction Primitive} \ne \text{Verification}$$

When an algorithm silently collapses these distinct concepts into a single black-box function:
1. Multiplicity is erased (e.g., silently picking the positive square root while discarding the mirror reflection).
2. Failures cannot be localized (impossible to distinguish whether a geometric constraint is mathematically impossible, or whether the numerical solver diverged).
3. The reasoner cannot explain its choices or backtrack when downstream constraints fail.

---

## 3. Audit of Existing Stand Mechanisms: Architectural Foundations

The repository `geometry-reasoning-stand-3d-v2` and the accompanying `skilla` research tree already possess concrete, executable subsystems that instantiate parts of this 6-stage framework.

| Subsystem | Existing Repository File | Implemented Mechanism | Role in General Framework |
| :--- | :--- | :--- | :--- |
| **Separation of Validation Statuses** | `src/core/geometryState.ts` (`validateGeometryState`) | Separates `InputGeometryStatus` (finite, on sphere), `RealizationStatus` (`VALID_POSITIVE`, `VALID_NEGATIVE`, `DEGENERATE`), and `GeometryValidationCode`. `[FACT]` | **Stage 3 & 6:** Distinctly detects non-realizable, degenerate, and valid configurations. |
| **Scale-Aware Centralized Tolerances** | `src/core/tolerances.ts` (`getResolvedTolerances`) | Scale-dependent thresholds: $L \propto R, S \propto R^2, V \propto R^3$. Avoids hardcoded machine epsilon. `[FACT]` | **Stage 6:** Universal verification invariant for scale-free geometric consistency. |
| **Decoupling Canonical State from Metrics** | `src/core/metrics.ts` (`computeDerivedMetrics`) | Canonical state (`CanonicalGeometryState`) is minimal (points + sphere). All edge lengths, face areas, normals, and regularity predicates are derived deterministically. `[FACT]` | **Stage 1 & 5:** Clean separation between core ground truth and observational metrics. |
| **Local Differential Invariants** | `src/core/lvg.ts` (`computeLVG`) | Evaluates Gram matrix ($G_{ij} = u_i \cdot u_j$), scalar triple product, planar face angles, dihedral angles, and Oosterom-Strackee solid angle $\Omega(v)$. `[FACT]` | **Stage 2 & 6:** Provides intrinsic local differential invariants applicable to any 3D polyhedral vertex. |
| **Topological Consistency Checking** | `src/core/dlvm.ts` (`verifySharedEdges`) | Tests shared edge anti-parallelism ($u_{AB}^{(A)} + u_{BA}^{(B)} = 0$) across independent vertex frames. `[FACT]` | **Stage 6:** Universal verification primitive for boundary and seam sharing in any network. |
| **Discrete Temporal Transitions** | `src/core/geometryTemporal.ts` (`computeStateTransition`) | Enforces monotonic sequence $t_0 < t_1$, calculates deltas ($\Delta V, \Delta S, \Delta G, \Delta L_{ij}, \Delta \Omega$). `[FACT]` | **Stage 5:** Causal state transitions and step-by-step construction history. |
| **Autonomous Verification Oracle** | `src/core/agentGateway.ts` (`verify_claim`) | Accepts external claims (`EDGE_LENGTH`, `FACE_AREA`, `VOLUME`, `IS_REGULAR`, `IS_DEGENERATE`, `ORIENTATION`), audits against ground truth with error deltas. `[FACT]` | **Stage 6:** Strict epistemic boundary between external reasoner and mathematical oracle. |
| **Explicit Constraint Multiplicity Resolver** | `skilla/src/core/pointToLineResolver.ts` | Resolves point reflection onto line: classifies 0, 1, 2, or $\infty$ axes; requires explicit branch selection. `[FACT]` | **Stage 2, 3, 4:** Canonical demonstration of the Multiplicity & Selection separation. |

---

## 4. Taxonomy: Universal vs. Domain-Specific Components

A critical danger in building geometric reasoning engines is premature generalization or false universalization. The table below draws a strict architectural boundary.

```
+─────────────────────────────────────────────────────────────────────────────+
|                         GEOMETRIC SYSTEM TAXONOMY                           |
+─────────────────────────────────────────────────────────────────────────────+
|                                                                             |
|  UNIVERSAL ARCHITECTURAL LAYER (Domain-Agnostic)                            |
|  - Epistemic Tracking: KNOWN_FACT | HYPOTHESIS | DERIVED | VERIFIED         |
|  - Multiplicity Classifier: Empty | Singleton | Finite Discrete | Continuum |
|  - Selection Policies: MinDisplacement | Parity | Energy | UserIntent       |
|  - Causal Dependency DAG: Entity lifecycle, inputs, outputs, dirty-marking  |
|  - Orthogonal Verifier Protocol: Claims auditing against scale tolerances   |
|                                                                             |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ Specialized by Domain Rules
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|  DOMAIN-SPECIFIC ENGINES & ADAPTERS                                         |
|                                                                             |
|  [2D Planar Geometry]       [3D Polyhedra & Stand]    [Origami Kinematics]  |
|  - Compass & Straightedge   - Cayley-Menger det       - Huzita-Hatori (H1-H7)|
|  - Circle/Line intersections- 3D Trilateration        - Kawasaki-Justin     |
|  - Shoelace polygon area    - Circumsphere linear sys - Maekawa theorem     |
|  - Triangle trigonometry    - Oosterom-Strackee Omega - Rigid panel folding |
|                             - Point groups (Td, D2, C1)- 1-DOF crease paths |
+─────────────────────────────────────────────────────────────────────────────+
```

### 4.1 What Must Be Universal `[PROPOSAL]`
1. **Constraint Representation & Query Contract:**  
   Constraints must be represented as declarative predicates $C(\mathbf{X}) = 0$ or $C(\mathbf{X}) \le 0$ with explicit target entity IDs, dimension signatures, and required tolerances.
2. **Solution Set Taxonomy:**  
   Every resolver must return a standardized `SolutionSet<T>` enum:
   * `EMPTY`: Infeasible constraints (conflicting or outside geometric domain).
   * `UNIQUE`: Single deterministic solution.
   * `DISCRETE_FINITE`: Exact enumeration of branches (with cardinality $k \in \{2, 3, \dots, N\}$).
   * `CONTINUOUS_FAMILY`: Under-constrained manifold with explicit degree of freedom (DOF).
   * `ILL_POSED`: Incomplete or over-constrained with inconsistent equations.
3. **Disambiguation / Selection Policy Protocol:**  
   Resolving a finite discrete solution set requires a separate `BranchSelector` taking an explicit policy:
   * `'PRESERVE_ORIENTATION'`: Retain orientation sign ($V_s > 0$ or positive winding).
   * `'MINIMAL_DISPLACEMENT'`: Minimize Euclidean distance $\|\mathbf{X}_{new} - \mathbf{X}_{current}\|$.
   * `'SYMMETRY_PRESERVING'`: Choose solution maximizing the order of the residual point group.
   * `'EXPLICIT_BRANCH_INDEX'`: Deterministic selection by index $0 \le i < k$.
4. **Causal Dependency Graph (Construction DAG):**  
   Tracking parent-child relationships between entities:
   $$\text{Primitive}_A \to \text{Entity}_1 \to \text{Constraint}_B \to \text{Resolver}_C \to \text{Entity}_2$$
5. **Independent Verification Protocol:**  
   The verifier must never use the solver's algebraic simplification. It evaluates the raw residual on final coordinates:
   $$\text{Residual}(C, \mathbf{X}^*) = |C(\mathbf{X}^*)| \le \epsilon_{\text{scale}}$$

### 4.2 What Must Remain Domain-Specific `[FACT]`
1. **Algebraic Systems:**  
   * The Cayley-Menger determinant $288 V^2 = \det(CM)$ and circumsphere linear system ($2(v_i - v_A) \cdot C = \|v_i\|^2 - \|v_A\|^2$) are strictly specific to 3D tetrahedra (`src/core/construction.ts`).
   * The 7 Huzita-Hatori fold axioms are strictly specific to flat origami folding (`skilla`).
   * The Radical Axis theorem is specific to intersecting circles.
2. **Topological Invariants:**  
   * Euler characteristic $\chi = V - E + F = 2$ is specific to polyhedra of sphere topology.
   * Kawasaki's theorem $\sum \theta_{odd} = \sum \theta_{even} = 180^\circ$ is specific to flat-foldable degree-4 origami vertices.
3. **Physical / Material Constraints:**  
   * Paper thickness, non-stretching, facet non-collision, and crease stiffness are specific to rigid origami and manufacturing.

---

## 5. Comparative Experimental Benchmark Suite

To validate whether the 6-stage framework is truly universal, we specify five canonical test problems across different geometric domains. None of these require full immediate implementation; rather, they form the falsification benchmark.

```
+─────────────────────────────────────────────────────────────────────────────+
|                         BENCHMARK SUITE PROGRAM                             |
|                                                                             |
|  [Benchmark A: 3D Simplex]   Inverse Tetrahedron: 6 edges -> Coordinates    |
|  [Benchmark B: 2D Polygons]  Four-Bar Linkage / Inscribed Quadrilateral     |
|  [Benchmark C: 2D Tangency]  Problem of Apollonius (Circle tangent to 3)    |
|  [Benchmark D: 3D Symmetry]  Symmetry-Breaking Flow: Td -> D2d -> D2 -> C1   |
|  [Benchmark E: Blind Goal]   Angle Trisection / Origami Axis Recovery (H6)  |
+─────────────────────────────────────────────────────────────────────────────+
```

### Benchmark A: Inverse Tetrahedron Reconstruction (3D Spatial Simplex) `[HYPOTHESIS]`
* **Task:** Given 6 lengths $L = \{L_{AB}, L_{AC}, L_{AD}, L_{BC}, L_{BD}, L_{CD}\}$, determine 3D vertex coordinates on $S^2(O, R)$.
* **Stage 1 (Target):** 3D simplex $T = (A, B, C, D) \subset \mathbb{R}^3$.
* **Stage 2 (Constraints):** 6 pairwise distance constraints $\|V_i - V_j\| = L_{ij}$.
* **Stage 3 (Solution Space):**
  * If $\Gamma(L) < 0$ or triangle inequality fails: `EMPTY`.
  * If $\Gamma(L) = 0$: `CONTINUOUS_DEGENERATE` (planar embedding).
  * If $\Gamma(L) > 0$: `DISCRETE_FINITE` with exactly **2 solutions** (chiral pair $z_D = \pm h$).
* **Stage 4 (Selection):** Select positive orientation ($V_s > 0$) or negative orientation.
* **Stage 5 (Construction):** Trilateration with gauge fixing (A at origin, B on +X, C in XY plane) + circumcenter centering.
* **Stage 6 (Verification):** Recompute 6 distances using `distance3D` (`src/core/geometryState.ts`), compare to input $L_{ij}$ within $\epsilon_{coincident}$.

### Benchmark B: Inscribed Quadrilateral & 2D Four-Bar (2D Polygon) `[HYPOTHESIS]`
* **Task:** Given 4 side lengths $(a, b, c, d)$ and the constraint of concyclicity (cyclic quadrilateral).
* **Stage 1 (Target):** Cyclic 2D quadrilateral $ABCD$ inscribed in circle $S^1(O, R)$.
* **Stage 2 (Constraints):** 4 edge distances + cyclic condition (opposite angles sum to $180^\circ$: $\angle A + \angle C = \pi$).
* **Stage 3 (Solution Space):**
  * Brahmagupta's formula gives unique area $S = \sqrt{(s-a)(s-b)(s-c)(s-d)}$.
  * The order of sides along the circle allows $(4-1)! / 2 = 3$ non-congruent cyclic quadrilaterals sharing the same four sides (diagonal lengths differ!).
  * Solution multiplicity is discrete: exactly **3 isomers**.
* **Stage 4 (Selection):** Choose permutation preserving convex vertex ordering $A \to B \to C \to D$.
* **Stage 5 (Construction):** Intersect circles from vertices along fixed baseline.
* **Stage 6 (Verification):** Verify that all four vertices lie on $S^1(O, R)$ and side lengths match.

### Benchmark C: Problem of Apollonius (Circle Tangencies) `[HYPOTHESIS]`
* **Task:** Construct a circle tangent to three given coplanar circles $C_1, C_2, C_3$.
* **Stage 1 (Target):** Circle $S = (O_{target}, r_{target}) \subset \mathbb{R}^2$.
* **Stage 2 (Constraints):** $\|O_{target} - O_i\| = |r_{target} \pm r_i|$ for $i \in \{1, 2, 3\}$.
* **Stage 3 (Solution Space):**
  * Each $\pm$ sign corresponds to internal vs. external tangency ($2^3 = 8$ combinations).
  * Multiplicity is discrete finite: **up to 8 distinct solutions**.
* **Stage 4 (Selection):** Specify tangency signature (e.g., exclusively external tangency to all three circles).
* **Stage 5 (Construction):** Inversion geometry or intersection of offset hyperbolas.
* **Stage 6 (Verification):** Direct distance check: $|\|O_{target} - O_i\| - (r_{target} + r_i)| \le \epsilon$.

### Benchmark D: Multi-Symmetry Polyhedra (Symmetry-Breaking Trajectory) `[HYPOTHESIS]`
* **Task:** Transition a polyhedron through continuous parameter variations from high symmetry ($O_h$ or $T_d$) to lower subgroups ($D_{2d}, C_{2v}, C_1$).
* **Stage 1 (Target):** Polyhedral vertex configuration on $S^2(O, R)$.
* **Stage 2 (Constraints):** Invariance under point group $G \subseteq O(3)$.
* **Stage 3 (Solution Space):** The orbit manifold under the stabilizer group.
* **Stage 4 (Selection):** Minimal distortion parameter along chosen deformation branch.
* **Stage 5 (Construction):** `src/core/construction.ts` `constructPerturbedTetrahedron` (offsetting vertex $D$).
* **Stage 6 (Verification):** `src/core/symmetry.ts` (`evaluateTetrahedralCandidateSymmetries`) directly verifies which symmetry operations remain `VERIFIED` and which are `REFUTED`.

### Benchmark E: Goal-Directed Construction with Unknown Sequence (Origami Axiom H6) `[HYPOTHESIS]`
* **Task:** Given two points $P_1, P_2$ and two lines $L_1, L_2$, find a fold line that places $P_1$ onto $L_1$ and $P_2$ onto $L_2$ simultaneously (Huzita-Hatori Axiom 6).
* **Stage 1 (Target):** Line (crease axis) $K \subset \mathbb{R}^2$.
* **Stage 2 (Constraints):** Reflection of $P_1$ across $K$ lies on $L_1$, and reflection of $P_2$ across $K$ lies on $L_2$.
* **Stage 3 (Solution Space):**
  * Mathematically equivalent to finding common tangents to two parabolas (foci $P_1, P_2$, directrices $L_1, L_2$).
  * The system is of degree 3 (cubic equation).
  * Multiplicity: **0, 1, 2, or 3 distinct real fold lines**.
* **Stage 4 (Selection):** Minimal angle to existing paper boundary or human comfort heuristic.
* **Stage 5 (Construction):** Solve cubic resolvent; generate fold axis.
* **Stage 6 (Verification):** Perform axial reflection of $P_1$ and $P_2$; check point-to-line distances.

---

## 6. Structural Entities: Primitives, Patterns, DAGs, and Strategies

To avoid architectural ambiguity, we establish clear definitions and criteria for these four concepts.

```
HIERARCHICAL LEVELS OF GEOMETRIC REASONING:

Level 4: DESIGN STRATEGY (Goal-Directed Synthesis / Backtracking)
    │   How to move from desired objective to an operational plan.
    ▼
Level 3: CONSTRUCTION GRAPH (DAG of Dependencies)
    │   Concrete causal sequence of operations and entities.
    ▼
Level 2: REUSABLE PATTERN (Structural Template)
    │   Repeated interaction of constraints, multiplicity, and choice.
    ▼
Level 1: PRIMITIVE (Atomic Operation)
        Deterministic mapping with no branch ambiguity (e.g. dot product, reflection).
```

### 6.1 Definitions & Strict Distinctions

#### 1. Primitive (Atomic Operation) `[FACT]`
* **Definition:** A mathematically closed, single-valued, deterministic operator that transforms input geometric entities into output entities with **no internal branch selection** and no hidden heuristics.
* **Examples in Core:**
  - `distance3D(p1, p2)` (`src/core/geometryState.ts:35`)
  - `crossProduct3D(u, v)` (`src/core/metrics.ts:40`)
  - `createPlaneReflection(normal, origin)` (`src/core/symmetry.ts:80`)
  - `fitCircumscribedSphere(vertices)` (`src/core/construction.ts:160`)

#### 2. Reusable Pattern (Structural Template) `[HYPOTHESIS]`
* **Definition:** A recurring architectural motif governing how constraints generate candidate solutions, how multiplicity is resolved, and how outcomes are verified.
* **Key Patterns:**
  - **Pattern P-1: Multiplicity-Branch Resolution Pattern:**
    $$(C, \mathbf{Params}) \xrightarrow{\text{solve}} \{S_1, S_2, \dots, S_k\} \xrightarrow{\text{policy}} S_{\text{chosen}} \xrightarrow{\text{instantiate}} \mathbf{Entity}$$
  - **Pattern P-2: Bilateral Reflection & Enantiomer Invariant:**
    A reflection across a symmetry hyperplane maps a valid configuration to an isometric configuration with inverted orientation sign ($V_s \to -V_s$).
  - **Pattern P-3: Dual Representation Invariant:**
    Maintaining an authoritative Cartesian state alongside a specialized domain representation (e.g., $(\phi, \lambda)$ spherical coordinates in `src/core/representation.ts` or 2D crease pattern coordinates in origami).
  - **Pattern P-4: Orthogonal Diagnostic Snapshot:**
    Evaluating comprehensive system health without mutating canonical truth (instantiated by `GDS` in `src/core/gds.ts`).

#### 3. Construction Graph (Dependency DAG) `[FACT]`
* **Definition:** The topological execution graph for a specific geometric construction.
* **Structure:** Nodes are geometric entities (points, lines, spheres, faces) or operations; directed edges represent parameter data flow.
* **Properties:** Must be a Directed Acyclic Graph (DAG) for forward construction. Cycles indicate coupled algebraic constraints requiring relaxation or simultaneous system solvers.

#### 4. Design Strategy (Synthesis Method) `[HYPOTHESIS]`
* **Definition:** The meta-algorithm used to synthesize a Construction Graph from a set of high-level goals.
* **Strategies:**
  - **Backward Chaining (Goal-Directed):** "To obtain face $ABC$ equilateral, vertex $C$ must lie on the intersection of circle $S^1(A, L)$ and circle $S^1(B, L)$."
  - **Gauge-Fixed Trilateration:** Successively fixing coordinates along orthogonal sub-spaces to eliminate rigid body degrees of freedom ($SE(3)$).
  - **Variational Relaxation:** Treating constraints as penalty potentials $E = \sum w_i C_i^2$ and descending the energy gradient.

### 6.2 Criteria for Declaring a Pattern Reusable `[PROPOSAL]`
A pattern may be declared canonical and integrated into the general library if and only if it satisfies all four criteria:
1. **Multi-Domain Manifestation:** It appears identically in at least two distinct geometric domains (e.g., 2D origami crease resolution and 3D polyhedral reconstruction).
2. **Representation Invariance:** It functions regardless of whether geometry is represented via floating-point Cartesian vectors, spherical coordinates, or topological boundary representations.
3. **Falsifiable Boundary Conditions:** The pattern explicitly defines when it fails (e.g., zero determinant, division by zero, empty solution set).
4. **Independent Verifiability:** The output of the pattern can be verified by a simple predicate check without knowledge of the pattern's internal search algorithm.

---

## 7. Counterexamples, Failure Modes, and Theoretical Limits

A robust theory must document where its primary hypotheses fail. The 6-stage linear pipeline encounters specific boundary challenges:

```
FAILURE MODES & BREAKDOWN SCENARIOS:

1. CONTINUOUS CONFIGURATION MANIFOLDS (Under-constrained)
   Constraint does not yield a finite set; yields a continuous mechanism (DOF >= 1).
   Linear pipeline stalls at Stage 4 (infinite choices without metric).

2. CYCLIC SIMULTANEOUS CONSTRAINTS (Coupled Systems)
   Entity A depends on B, which depends on C, which depends on A.
   DAG becomes cyclic; cannot be constructed via sequential forward steps.

3. NUMERICAL BIFURCATIONS & CUSP CATASTROPHES
   Near-degenerate configurations where small perturbations jump branches.
   Floating-point roundoff toggles solution existence.

4. UNDECIDABLE / UNCONSTRUCTIBLE TARGETS
   Targets mathematically impossible with given primitive set
   (e.g., angle trisection via compass and straightedge, unsolvable origami axioms).
```

### 7.1 Counterexample 1: Continuous Flexible Mechanisms (Bricard & Connelly Polyhedra) `[FACT]`
* **Phenomenon:** Certain non-rigid polyhedra (e.g., Bricard's flexible octahedra, Steffen's flexible polyhedron) maintain fixed edge lengths and flat faces while flexing continuously with $\text{DOF} \ge 1$.
* **Impact on 6-Stage Framework:** Stage 3 does not produce a finite list of discrete branches $\{S_1, \dots, S_k\}$; it produces an algebraic curve or manifold. A simple discrete `BranchSelector` fails; one requires a continuous parameterization $t \in [0, 1]$ or kinematic velocity vector.

### 7.2 Counterexample 2: Cyclic Constraint Systems (Kinematic Loops) `[FACT]`
* **Phenomenon:** Closed kinematic loops (e.g., a spatial 6-bar linkage or an origami crease pattern with 10 interacting vertices).
* **Impact on 6-Stage Framework:** No single vertex can be constructed first. The construction DAG has cycles. Forward sequential construction fails; the system requires a simultaneous non-linear equation solver (Newton-Raphson, Levenberg-Marquardt, or Gröbner bases).

### 7.3 Counterexample 3: Numerical Bifurcations Near Discriminant Cusps `[FACT]`
* **Phenomenon:** When the discriminant (e.g., Cayley-Menger $\Gamma(L)$ or quadratic discriminant $\Delta$) is within machine precision of zero ($|\Delta| < 10^{-15}$).
* **Impact on 6-Stage Framework:** Slight roundoff error causes the classifier to oscillate between `EMPTY` (imaginary roots), `UNIQUE` (tangency), and `DISCRETE_FINITE` (two close roots).
* **Mitigation:** The scale-resolved tolerance policy (`src/core/tolerances.ts`) is mandatory. Instead of testing $\Delta > 0$, the system must classify $|\Delta| \le \epsilon_{\text{scale}}$ as `NEAR_DEGENERATE` (Status `D3` in `src/core/lvg.ts`).

---

## 8. The Origami Domain: Multi-Layered Validation Hierarchy

Origami is not merely an illustrative application; it is an ideal testbed because it couples pure 2D Euclidean geometry with non-linear 3D spatial kinematics and physical material constraints.

```
+─────────────────────────────────────────────────────────────────────────────+
|                    THE 4-LAYER ORIGAMI REASONING HIERARCHY                  |
+─────────────────────────────────────────────────────────────────────────────+
|                                                                             |
|  [Layer 4: Author Intent & Diagram Strategy]                                |
|      Reverse-engineering instructions, landmarks, reference folds,         |
|      and step sequencing from origami diagrams or text.                    |
|          │                                                                  |
|          ▼                                                                  |
|  [Layer 3: Physical & Material Feasibility]                                 |
|      Facet non-self-intersection, paper thickness accommodation,           |
|      crease stiffness, strain-free continuous folding path.                 |
|          │                                                                  |
|          ▼                                                                  |
|  [Layer 2: Kinematic Foldability (Rigid Origami)]                           |
|      Continuous 1-DOF folding path theta_e(t) from flat sheet (t=0)        |
|      to 3D spatial state (t=1). Face rigidity preservation.                 |
|          │                                                                  |
|          ▼                                                                  |
|  [Layer 1: Geometric Correctness (Crease Pattern)]                          |
|      2D Planar metric correctness, Kawasaki-Justin theorem,                |
|      Maekawa theorem, Descartes angular defect, boundary seam parity.       |
|                                                                             |
+─────────────────────────────────────────────────────────────────────────────+
```

### 8.1 Detailed Breakdown of the 4 Layers

#### Layer 1: Geometric Correctness (Flat Crease Pattern) `[FACT]`
* **Local Flat-Foldability:** For any internal degree-4 vertex in a flat-foldable crease pattern:
  - **Kawasaki-Justin Theorem:** $\theta_1 - \theta_2 + \theta_3 - \theta_4 = 0$ (alternating angle sum is $180^\circ$).
  - **Maekawa-Justin Theorem:** $|M - V| = \pm 2$ (difference between mountain and valley folds is $\pm 2$).
* **Spatial Developability (Polyhedral Nets):**
  - **Descartes Defect Invariant:** At every vertex $V$, the angle defect is $\delta(V) = 2\pi - \sum \alpha_i > 0$. For a closed sphere-topology polyhedron, $\sum \delta(V) = 4\pi$.

#### Layer 2: Kinematic Foldability (Rigid Origami) `[HYPOTHESIS]`
* **Definition:** A crease pattern is rigidly foldable if the facets remain planar Euclidean polygons throughout the folding motion, with deformation occurring exclusively along the one-dimensional crease hinges.
* **Dihedral Trajectory:** Each edge $e$ undergoes a continuous dihedral angle transition $\theta_e(t): [0, 1] \to [0, \pi]$.
* **Connection to Stand:** `src/core/lvg.ts` already computes face normals and dihedral angles for 3D configurations. A rigid origami folding path is valid if $\theta_e(1)$ matches the LVG dihedral angles of the target 3D solid.

#### Layer 3: Physical & Material Feasibility `[HYPOTHESIS]`
* **Facet Non-Intersection:** Faces must not penetrate each other in 3D space during any point of the folding motion ($t \in [0, 1]$).
* **Layer Ordering (Local Self-Folding):** When multiple paper layers press flat against each other, a consistent valid layer order permutation must exist without cyclic trapping.

#### Layer 4: Author Strategy Recovery (Semantic Reverse Engineering) `[PROPOSAL]`
* **The Problem:** Human origami diagrams do not give floating-point coordinates. They specify operational sequences:
  *"Fold edge to edge, crease, unfold; fold corner to the crease intersection..."*
* **The Reasoning Challenge:** Reconstruct the author's underlying exact geometric theorem from discrete step instructions.
* **Mechanism:** Identify geometric landmarks (intersections of creases with paper edges, incenter angle bisectors) and map them to the Construction DAG.

---

## 9. Recommended Next Minimal Experiment: Dual-Domain Disambiguation

To empirically validate the 6-stage framework without modifying the canonical core, we propose a lightweight, isolated experiment spanning two distinct geometric domains.

### 9.1 Experiment Concept: `EXP-GGR-01: Dual-Domain Branch Disambiguation` `[PROPOSAL]`
* **Objective:** Test whether a single, domain-agnostic `BranchSelector` abstraction can resolve finite solution multiplicity identically in:
  1. **Domain 1 (2D Origami Reflection):** Tangent axis selection for point-to-line folding (`skilla` INS-001).
  2. **Domain 2 (3D Polyhedral Reconstruction):** Chiral enantiomer selection for inverse tetrahedron reconstruction ($z_D = \pm h$).

```
           +───────────────────────────────────────────────+
           |       DOMAIN-AGNOSTIC BRANCH SELECTOR         |
           |      (Policy: MIN_DISPLACEMENT | PARITY)      |
           +───────────────────────┬───────────────────────+
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
      [Domain 1: 2D Origami Fold]        [Domain 2: 3D Tetrahedron]
      Target: Point onto Line            Target: 6 Edges -> 3D Coordinates
      Solutions: 2 Fold Axes             Solutions: 2 Chiral Enantiomers
      Choice: Crease angle closest       Choice: Positive Volume Sign
              to reference edge                  (Vs > 0 vs Vs < 0)
```

### 9.2 Minimal Test Interface Specification `[PROPOSAL]`
An isolated experimental module `src/core/reasoning/branchSelector.ts`:
```typescript
export type DisambiguationPolicy = 
  | 'POSITIVE_PARITY'
  | 'NEGATIVE_PARITY'
  | 'MINIMAL_DISPLACEMENT'
  | 'MAXIMAL_SYMMETRY';

export interface CandidateSolution<T> {
  readonly id: string;
  readonly entity: T;
  readonly paritySign: 1 | -1;
  readonly displacementNorm?: number;
}

export function selectBranch<T>(
  candidates: readonly CandidateSolution<T>[],
  policy: DisambiguationPolicy
): CandidateSolution<T>;
```

### 9.3 Verification Protocol
1. Pass the 2 fold axes from `pointToLineResolver.ts` (INS-001) into `selectBranch` with policy `'MINIMAL_DISPLACEMENT'`. Verify deterministic choice.
2. Pass the 2 chiral coordinate sets from the 3D trilateration solver into `selectBranch` with policy `'POSITIVE_PARITY'`. Verify that the positive-volume tetrahedron is chosen.
3. Validate that the selection logic contains **zero 2D-specific or 3D-specific branching**.

---

## 10. Summary & Immediate Action Items

1. **Strategic Refocus:** The tetrahedron stand has been successfully audited and re-positioned as an experimental verification testbed, not an architectural ceiling.
2. **Framework Established:** The 6-stage reasoning pipeline and the Separation of Concerns Axiom provide an actionable foundation for general geometric design.
3. **Repository Evidence:** The mechanisms in `geometry-reasoning-stand-3d-v2` (`geometryState.ts`, `metrics.ts`, `tolerances.ts`, `lvg.ts`, `dlvm.ts`, `agentGateway.ts`) natively support the general framework.
4. **Boundary Preserved:** Zero code modifications have been made to the canonical core, public APIs, or frozen schemas.
5. **Next Step:** When authorized, proceed with the implementation of isolated experiment `EXP-GGR-01` to test the dual-domain disambiguation pattern.
