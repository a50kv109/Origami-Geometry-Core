# INSIGHT PACKAGE INS-001 INTEGRATION REPORT
## Explicit Constraint Resolution and Geometric Solution Multiplicity in Skilla

**Document ID:** `docs/research/INS-001_INTEGRATION_REPORT.md`  
**Target Project:** Skilla — Origami Geometry Reasoning Skill  
**Classification:** `ARCHITECTURAL_INTEGRATION_REPORT`  
**Status:** MATHEMATICAL CORE VERIFIED; ARCHITECTURAL PROPOSAL COMPLETED  
**Integration Mode:** Pure Proposal and Documentation (Frozen components untouched)  
**Date:** 2026-10-26  

---

## 1. Executive Summary & Mathematical Core Verification

### 1.1. Context & Motivation
In geometric origami reasoning, instructional texts and human problem statements routinely declare an intended geometric relationship rather than a fully determined geometric operation. A classic example is:

$$\text{“Fold corner } P \text{ so that it lies on crease line } L\text{.”}$$

In computational geometry and automated origami reasoning, this statement defines a **Constraint**, not an executable deterministic **Operation**. An origami reasoning system that conflates a declarative constraint with an imperative construction primitive will inevitably either:
1. Silently guess an arbitrary single solution (e.g., orthogonal projection $t=0$), masking geometric ambiguity.
2. Produce non-reproducible or fragile folds when another valid solution was intended by the crease pattern.
3. Obscure the role of the necessary **Selection Rule** required to uniquely determine a physical fold.

### 1.2. Mathematical Proof of Point-to-Line Folding Multiplicity
**Theorem (Point-to-Line Solution Family):**  
Let $P \in \mathbb{R}^2$ be a point and $L \subset \mathbb{R}^2$ be a straight line. Let $R_m: \mathbb{R}^2 \to \mathbb{R}^2$ denote rigid orthogonal planar reflection across an axis $m$.  
The constraint equation:
$$R_m(P) \in L$$
possesses a continuous one-parameter family of solutions if $P \notin L$, and a two-branch infinite family if $P \in L$.

#### Proof:
1. **Case A: Point strictly off the line ($P \notin L$):**
   Choose any point $Q \in L$.  
   By the fundamental theorem of planar reflection, an axis $m$ reflects $P$ onto $Q$ if and only if $m$ is the perpendicular bisector of segment $PQ$.  
   Since $L$ is a one-dimensional affine subspace of $\mathbb{R}^2$, it is parameterized by a continuous scalar $t \in \mathbb{R}$:
   $$Q(t) = Q_0 + t \, \vec{v}_L, \quad \text{where } Q_0 \in L, \, \|\vec{v}_L\| = 1.$$
   For every $t \in \mathbb{R}$, $Q(t) \neq P$ because $P \notin L$.  
   The segment $P Q(t)$ has non-zero length:
   $$d(t) = \|Q(t) - P\|_2 > 0.$$
   Therefore, for every $t \in \mathbb{R}$, there exists a unique perpendicular bisector line $m(t)$:
   - Midpoint anchor: $M(t) = \frac{P + Q(t)}{2}$.
   - Unit normal vector: $\vec{n}(t) = \frac{Q(t) - P}{d(t)}$.
   - Axis equation: $\vec{n}(t) \cdot (\vec{X} - M(t)) = 0$.

   Because $Q(t_1) \neq Q(t_2)$ for $t_1 \neq t_2$, the chord vectors $Q(t) - P$ are non-parallel (or share different midpoints), yielding an uncountable continuous 1-parameter family $\{m(t) \mid t \in \mathbb{R}\}$ of distinct reflection axes. $\blacksquare$

#### 1.3. Numerical Witness Evaluation
To verify this algebraically and numerically, consider the canonical coordinate configuration:
- Point: $P = (0, 1)$
- Line $L$: $y = 0$ (the $x$-axis, parameterized by $Q(t) = (t, 0)$ for $t \in \mathbb{R}$).

For any $t \in \mathbb{R}$:
- Chord vector: $Q(t) - P = (t, -1)^T$.
- Midpoint: $M(t) = \left(\frac{t}{2}, \frac{1}{2}\right)^T$.
- Normal vector to the fold axis: $\vec{n} = (t, -1)^T$.
- Fold axis line equation:
  $$t\left(x - \frac{t}{2}\right) - 1\left(y - \frac{1}{2}\right) = 0 \iff tx - y + \frac{1 - t^2}{2} = 0.$$

Let us verify four specific witnesses:
1. **Witness $t = 0$ (Orthogonal projection onto $L$):**
   - Target point: $Q_1 = (0, 0) \in L$.
   - Axis equation: $0x - y + \frac{1}{2} = 0 \implies y = \frac{1}{2}$.
   - Reflection check: $R_m(0, 1) = (0, 0) = Q_1 \in L$. Satisfied!
2. **Witness $t = 1$:**
   - Target point: $Q_2 = (1, 0) \in L$.
   - Axis equation: $1x - y + 0 = 0 \implies y = x$.
   - Reflection check: Across $y = x$, $(0, 1) \mapsto (1, 0) = Q_2 \in L$. Satisfied!
3. **Witness $t = -1$:**
   - Target point: $Q_3 = (-1, 0) \in L$.
   - Axis equation: $-1x - y + 0 = 0 \implies y = -x$.
   - Reflection check: Across $y = -x$, $(0, 1) \mapsto (-1, 0) = Q_3 \in L$. Satisfied!
4. **Witness $t = 2$:**
   - Target point: $Q_4 = (2, 0) \in L$.
   - Axis equation: $2x - y - \frac{3}{2} = 0 \implies y = 2x - 1.5$.
   - Chord: $(2, -1)^T$, midpoint: $(1, 0.5)^T$.
   - Reflection check:
     Distance of $P(0,1)$ to axis: $\frac{2(0) - 1(1) - 1.5}{\sqrt{2^2 + (-1)^2}} = \frac{-2.5}{\sqrt{5}}$.
     $R_m(P) = (0, 1)^T - 2 \left(\frac{-2.5}{5}\right) \begin{pmatrix} 2 \\ -1 \end{pmatrix} = (0, 1)^T + \begin{pmatrix} 2 \\ -1 \end{pmatrix} = (2, 0) = Q_4 \in L$. Satisfied!

Each of these four distinct fold lines satisfies the exact constraint $R_m(P) \in L$, confirming infinite multiplicity.

#### 1.4. Case B: Point Already on the Line ($P \in L$)
If $P \in L$, the constraint is already satisfied at the identity:
1. **Branch 1 (Point remains fixed, $Q = P$):**
   Any fold line $m$ passing through $P$ leaves $P$ invariant: $R_m(P) = P$. Since $P \in L$, $R_m(P) \in L$ is satisfied. This yields a pencil of lines passing through $P$ with arbitrary angle $\theta \in [0, \pi)$.
2. **Branch 2 (Point reflected to distinct $Q \in L \setminus \{P\}$):**
   Any choice of $Q \in L$ with $Q \neq P$ yields the perpendicular bisector of $PQ$. Note that because $P$ and $Q$ both lie on $L$, the perpendicular bisector of $PQ$ is perpendicular to $L$ at the midpoint of $PQ$.

The system must report this condition explicitly as `ALREADY_SATISFIED_INFINITE_SOLUTIONS` rather than failing or picking a single line.

---

## 2. The 6-Stage Geometric Reasoning Continuum

To prevent accidental conflation in Skilla's computational model, we formalize the strict 6-stage lifecycle:

$$\text{Constraint} \xrightarrow{\quad\text{Solve}\quad} \text{SolutionSet} \xrightarrow{\quad\text{Select}\quad} \text{SelectionRule} \xrightarrow{\quad\text{Bind}\quad} \text{SelectedSolution} \xrightarrow{\quad\text{Execute}\quad} \text{ConstructionOperation} \xrightarrow{\quad\text{Verify}\quad} \text{Verification}$$

| Stage | Formal Role | Input | Output / State | Example |
| :--- | :--- | :--- | :--- | :--- |
| **1. Constraint** | Declarative specification of desired invariant | Geometric entities $(P, L)$ | Predicate: $R_m(P) \in L$ | “Fold corner $P$ onto crease $L$” |
| **2. SolutionSet** | The mathematical manifold of all valid axes | Constraint equation | Solution space $\mathcal{M} = \{m(t) \mid t \in \mathcal{D}\}$ | 1-parameter family $tx - y + \frac{1-t^2}{2} = 0$ |
| **3. SelectionRule** | Criteria reducing multiplicity to a singleton | Contextual criteria | Reduction operator $\mathcal{S}: \mathcal{M} \to \{m^*\}$ | “Fold must pass through point $V$” (Axiom 5) or “Crease is orthogonal to edge $E$” |
| **4. SelectedSolution** | Unique mathematical configuration selected | $\mathcal{M}$ and $\mathcal{S}$ | Concrete parametric witness $t^*$ and line $m(t^*)$ | Selected fold axis $m(1): y = x$ |
| **5. ConstructionOperation** | Executable primitive generating geometry | Input parameters | Concrete `Line2D` and metadata | `findFoldAxisPointToPoint(P, Q(t^*))` |
| **6. Verification** | Independent zero-trust invariant oracle | Produced geometry and inputs | Audit verdict and numeric residuals | `auditPointToPointResult(...)` |

**Rule of Non-Collapse:** No two adjacent stages may be merged without explicit typed evidence. Specifically:
- Calling an unselected Constraint an "Operation" is a type error.
- Selecting a solution without an explicit SelectionRule is an unverified assumption.

---

## 3. Mandatory Architectural Review: The 6 Core Questions

### Question 1: Where in the existing codebase and documentation is this distinction already represented, and where is it absent?

#### Where the distinction is ALREADY represented:
1. **Coincident points in Primitive B (`src/construction/pointToPoint.ts`):**
   When $P_1 = P_2$, the generator explicitly refuses to invent an axis. It does not guess a default direction; it returns:
   ```ts
   multiplicity: 'INFINITE',
   status: 'COINCIDENT_POINTS_INFINITE_SOLUTIONS',
   axis: null
   ```
   This is a pristine implementation of refusing to collapse an infinite solution set into a false single operation.
2. **Zero-Trust Verification Decoupling (`src/construction/pointToPointVerifier.ts`):**
   The verification layer is completely isolated from the construction generator. The verifier recomputes Euclidean distances, normalizations, and reflections from fundamental formulas without importing or trusting the producer. This strictly enforces `ConstructionOperation ≠ Verification`.
3. **ADR-001 Domain Boundaries (`docs/decisions/DECISION_LOG.md`):**
   ADR-001 separates mathematical derivation from numerical stability domains ($\max(|x|, |y|) \le 10$).

#### Where the distinction is ABSENT:
1. **Continuous Solution Representation:**
   The types in `pointToPoint.ts` only recognize discrete multiplicity enum `'ONE' | 'INFINITE' | 'ZERO'`. There is no representation for continuous 1-parameter manifolds, nor symbolic parameterizations ($t \in \mathbb{R}$).
2. **Lack of First-Class Constraint Type:**
   Currently, all construction functions in Skilla represent fully determined *Operations*. There is no abstract data type `GeometricConstraint` or `ConstraintProblem` representing declarative goals before they are solved.
3. **Pattern Passport Schema Omission (`schemas/pattern-passport.schema.json`):**
   The schema treats operations as direct functions from `inputs` to `output_descriptor`. There are no schema fields for `solution_multiplicity`, `solution_space`, `selection_rule`, or `underconstrained_behavior`.

---

### Question 2: In what places is there a risk of conflating constraints and operations?

1. **Natural Language / LLM Instruction Interpretation:**
   Diagram text such as *"Bring corner $A$ to crease $B$"* will be parsed as an imperative command `fold(A, B)`. If the reasoning engine lacks a constraint layer, it will treat this command as a primitive call and fail or guess.
2. **Confusion Between Huzita Axioms 4, 5, and Unconstrained Point-to-Line:**
   - **Axiom 4:** Given $P$ and $L$, construct a crease *perpendicular to $L$ through $P$*. (Multiplicity: 1). This is an operation.
   - **Constraint $P \to L$ alone:** Multiplicity: $\infty$. (Not an axiom; an underconstrained condition).
   - **Axiom 5:** Given $P_1, P_2$ and $L$, fold $P_1$ onto $L$ with crease passing through $P_2$. (Multiplicity: up to 2). This is a well-formed constraint-selection pair!
   There is a grave risk that an engineer or automated agent might implement Axiom 4 when asked for "fold $P$ to $L$", even though Axiom 4 does *not* reflect $P$ onto $L$ (it reflects $P$ across a line perpendicular to $L$, keeping $P$ invariant only if $P$ is on the crease).
3. **Implicit Boundary Clamping as Hidden Selection:**
   Constraining the problem to a unit square $[0, 1]^2$ reduces the domain of $Q(t)$ to a line segment, but the number of valid fold axes remains *infinite*. An implementation might naively pick the midpoint of the edge or the nearest vertex, conflating domain boundary clipping with a geometric selection rule.

---

### Question 3: Recommended Schema Additions to `pattern-passport.schema.json`

To enable pattern passports to document both fully determined operations (like Primitive B) and underconstrained or multi-solution constraints, we propose extending the schema under `execution_semantics` and `applicability`.

*(Note: In accordance with task constraints, `schemas/pattern-passport.schema.json` is frozen and is NOT directly edited. The following is the proposed schema extension).*

```json
{
  "constraint_resolution": {
    "type": "object",
    "description": "Formal specification of geometric constraint behavior, solution multiplicity, and selection rules.",
    "required": ["nature", "solution_cardinality"],
    "properties": {
      "nature": {
        "type": "string",
        "enum": ["FULLY_DETERMINED_OPERATION", "UNDERCONSTRAINED_CONSTRAINT", "OVERCONSTRAINED_CONSTRAINT", "COMPOSITE_SELECTION"]
      },
      "solution_cardinality": {
        "type": "string",
        "enum": [
          "ZERO",
          "FINITE_UNIQUE",
          "FINITE_MULTIPLE",
          "INFINITE_CONTINUOUS_1D",
          "INFINITE_CONTINUOUS_2D",
          "INFINITE_DISCRETE"
        ]
      },
      "solution_manifold": {
        "type": "object",
        "properties": {
          "parameter_symbol": { "type": "string" },
          "parameter_domain": { "type": "string" },
          "algebraic_form": { "type": "string" }
        }
      },
      "required_selection_rules": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["rule_id", "description", "target_parameter"],
          "properties": {
            "rule_id": { "type": "string" },
            "description": { "type": "string" },
            "target_parameter": { "type": "string" }
          }
        }
      },
      "coincident_point_behavior": {
        "type": "string",
        "enum": ["REJECT", "REFUSE_TO_GUESS", "IDENTITY_PENCIL", "NOT_APPLICABLE"]
      }
    }
  }
}
```

---

### Question 4: Architectural Model Comparison — What Does Skilla Need Now?

We evaluate three candidate architectures for representing multi-solution constraints:

| Evaluation Dimension | Model A: Explicit AST SolutionSet Graph Node | Model B: Pure Runtime Typed Result Monad | Model C: Hybrid Model (Recommended for Skilla) |
| :--- | :--- | :--- | :--- |
| **Description** | Crease pattern is represented as a formal graph where `SolutionSet` is an explicit intermediate node in the pipeline AST. | Solver functions return discriminated union `ConstraintResolution<T>`, where infinite sets are typed tokens, not graph nodes. | Static passport defines constraint semantics; runtime uses typed discriminated union; AST stores resolved operations. |
| **Runtime Overhead** | High (requires graph engine, symbolic equation representations, manifold walkers). | Very low (zero runtime footprint beyond lightweight TypeScript interfaces). | Low and clean. Keeps execution predictable and fast in browser/Node.js. |
| **Infinite List Storage** | Risk of attempting to discretize or store infinite lists. | Zero storage; uses algebraic closed forms or parameter interval tokens. | Zero storage; symbolic parameter bounds $[t_{\min}, t_{\max}]$. |
| **Zero-Guesswork Guarantee** | Strong (graph cannot proceed without an explicit selector edge). | Strong (compiler enforces checking status before accessing `axis`). | Strongest: Passport audit validates mathematical completeness; TypeScript compiler enforces runtime handling. |
| **Fit for Current Skilla** | Overkill for research lab stage; increases complexity prematurely. | Excellent for runtime, but misses pattern documentation rigor. | **Optimal.** Directly builds on Primitive B's `PointToPointResult` pattern while extending to parametric cases. |

#### Detailed Specification of the Hybrid Model for Skilla:
In TypeScript runtime, any constraint resolver returns a discriminated union:
```typescript
export type SolutionMultiplicity = 
  | 'ZERO' 
  | 'FINITE_UNIQUE' 
  | 'FINITE_MULTIPLE' 
  | 'INFINITE_CONTINUOUS_1D' 
  | 'ALREADY_SATISFIED_INFINITE';

export type ConstraintResolution<TParam, TEntity> =
  | {
      status: 'RESOLVED_UNIQUE';
      cardinality: 'FINITE_UNIQUE';
      solution: TEntity;
      diagnostic: string;
    }
  | {
      status: 'RESOLVED_MULTIPLE';
      cardinality: 'FINITE_MULTIPLE';
      solutions: TEntity[];
      diagnostic: string;
    }
  | {
      status: 'UNDERCONSTRAINED_CONTINUOUS_FAMILY';
      cardinality: 'INFINITE_CONTINUOUS_1D';
      parameterization: {
        symbol: string;
        domain: [number, number]; // e.g. paper boundary segment
        evaluator: (t: number) => TEntity;
      };
      diagnostic: string;
    }
  | {
      status: 'ALREADY_SATISFIED';
      cardinality: 'ALREADY_SATISFIED_INFINITE';
      diagnostic: string;
    }
  | {
      status: 'UNSATISFIABLE' | 'NUMERICAL_INSTABILITY';
      cardinality: 'ZERO';
      diagnostic: string;
    };
```
This guarantees that **no infinite lists are ever allocated**, while preventing any caller from treating an underconstrained family as a single axis without providing a parameter $t$ or a selection rule.

---

### Question 5: Test Specifications Exposing Silent Ambiguity

To guarantee that no module silently picks a default axis when resolving $P \to L$, we specify three rigorous negative and ambiguity controls for future test suites:

#### Test Specification TC-AMB-01: Pure Point-to-Line Ambiguity Rejection
- **Input:** $P = (0, 1)$, line $L: y = 0$.
- **Call:** `resolvePointToLineConstraint(P, L)` (without selection rule or target parameter $t$).
- **Expected Assertion:**
  - `status === 'UNDERCONSTRAINED_CONTINUOUS_FAMILY'`
  - `cardinality === 'INFINITE_CONTINUOUS_1D'`
  - `solution === null` (or undefined)
  - Must NOT return $y = 0.5$ (the orthogonal projection default).
  - Must provide parameter evaluator where $evaluator(0)$ yields $y = 0.5$ and $evaluator(1)$ yields $y = x$.

#### Test Specification TC-AMB-02: Point-on-Line Coincidence Degeneracy
- **Input:** $P = (2, 0)$, line $L: y = 0$ ($P \in L$).
- **Call:** `resolvePointToLineConstraint(P, L)`.
- **Expected Assertion:**
  - `status === 'ALREADY_SATISFIED'`
  - `cardinality === 'ALREADY_SATISFIED_INFINITE'`
  - Must NOT fail with division-by-zero or return a bogus single normal line without declaring the identity pencil branch.

#### Test Specification TC-AMB-03: Selection Rule Binding (Axiom 5 Emulation)
- **Input:** $P_1 = (0, 1)$, line $L: y = 0$, Selection Rule: Fold axis must pass through $P_2 = (0, 0)$.
- **Mathematical Analysis:** An axis passing through $(0, 0)$ has equation $y = kx$ (or $x=0$).
  From the witness equation $tx - y + \frac{1 - t^2}{2} = 0$, evaluating at $(0, 0)$ gives $\frac{1 - t^2}{2} = 0 \implies t = \pm 1$.
  - For $t = 1$, axis is $y = x$. Passes through $(0, 0)$. Reflects $(0, 1)$ to $(1, 0) \in L$.
  - For $t = -1$, axis is $y = -x$. Passes through $(0, 0)$. Reflects $(0, 1)$ to $(-1, 0) \in L$.
- **Expected Assertion:**
  - `status === 'RESOLVED_MULTIPLE'`
  - `cardinality === 'FINITE_MULTIPLE'`
  - `solutions.length === 2`
  - Solutions match $y = x$ and $y = -x$.
  - Verifier independently audits both solutions against $R_m(P_1) \in L$ and $P_2 \in m$.

---

### Question 6: Open Questions, Hypotheses & Unverified Boundaries

1. **Boundary-Constrained Multiplicity:**
   - *Observation:* Origami is performed on finite paper (e.g. $[0, 1]^2$).
   - *Question:* Does paper boundary boundedness convert continuous infinity into a finite set?
   - *Answer:* **No.** Bounding $Q(t) \in L \cap \text{Paper}$ restricts $t \in [t_{\min}, t_{\max}]$. Because this interval is non-empty and connected, the set of valid fold axes remains an uncountable continuum ($|\mathcal{M}| = 2^{\aleph_0}$). Only additional discrete constraints (such as creases terminating at distinct sheet corners) can reduce it to a finite set.
2. **Historical Diagram Context in Fujimoto Folds:**
   - In Fujimoto's grid systematization, instructions like "fold point to line" are never isolated; they are always anchored by:
     1. An existing crease intersection acting as a pivot (Axiom 5).
     2. Parallelism to an existing edge (Axiom 4).
     3. Two simultaneous point-to-line matches (Axiom 6).
   - *Hypothesis for Skilla:* The diagram parsing layer must accumulate co-occurring visual annotations before resolving any single constraint.
3. **Condition Number Near Grazing Incidence:**
   - As $t \to \pm \infty$, the chord length $d(t) = \sqrt{t^2 + 1} \to \infty$. In a normalized paper domain, large $|t|$ corresponds to folds almost parallel to $L$. The numerical conditioning of computing the intersection of the fold axis with paper boundaries degrades as $\mathcal{O}(|t|)$. Thresholding policies must be developed when parameterizing near-parallel folds.

---

## 4. Governance & Integrity Compliance

- **Status of Upstream Files:**
  - `skilla/src/core/reflection.ts` — UNTOUCHED (SHA-256 intact).
  - `skilla/src/construction/pointToPoint.ts` — UNTOUCHED (SHA-256 intact).
  - `skilla/src/construction/pointToPointVerifier.ts` — UNTOUCHED (SHA-256 intact).
  - `skilla/src/construction/pointToPointTest.ts` — UNTOUCHED (SHA-256 intact).
  - `skilla/schemas/pattern-passport.schema.json` — UNTOUCHED (Proposal presented in report).
- **Canonical Primitives:** No new primitive has been added or declared canonical. Primitive B remains the sole provisionally accepted primitive in Skilla under ADR-001.
- **Export & Deployment Status:** No GitHub push, repository export, or external modification was triggered.

---
*Report prepared for the Skilla Geometry Reasoning Working Group.*
