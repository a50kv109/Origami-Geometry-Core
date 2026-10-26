# Skilla Repository Map & Architecture Blueprint

**Repository:** `a50kv109/skilla`  
**Root Path:** `/`  
**Purpose:** Structural navigation and module boundary specification.

---

## Directory & File Layout

```text
skilla/
├── README.md                           # Laboratory overview, status, test instructions, and download guide
├── LICENSE                             # MIT License (preserved from PCRS baseline)
├── .gitignore                          # Standard Node/TypeScript build and runtime ignores
├── package.json                        # Self-contained laboratory package specification and scripts
├── tsconfig.json                       # TypeScript compiler configuration (strict mode)
├── docs/                               # Governance, architectural maps, research audits, and decisions
│   ├── PROJECT_CHARTER.md              # The 10 core governance and verification principles
│   ├── REPOSITORY_MAP.md               # This module and structural blueprint
│   ├── CHANGELOG.md                    # Cumulative version and migration history
│   ├── research/
│   │   └── PRIMITIVE_B_INDEPENDENT_AUDIT.md  # Verbatim independent audit report for Primitive B
│   ├── decisions/
│   │   └── DECISION_LOG.md             # Formal architectural decision records (ADRs)
│   └── provenance/
│       └── SOURCE_MANIFEST.md          # Exact file provenance, source paths, and SHA-256 digests
├── src/                                # Core math kernel and experimental construction modules
│   ├── core/
│   │   └── reflection.ts               # Reference baseline 2D planar reflection kernel (immutable)
│   └── construction/
│       ├── pointToPoint.ts             # Generator: Huzita Axiom 2 perpendicular bisector solver
│       ├── pointToPointVerifier.ts     # Verifier: Autonomous multi-metric invariant verification
│       └── pointToPointTest.ts         # Tester: 11 benchmark, boundary, and negative control tests
├── scripts/                            # CLI test execution harnesses
│   ├── runPointToPoint.ts              # Command-line runner for Primitive B test suite
│   └── runTests.ts                     # Main laboratory test harness (baseline + primitive B)
└── schemas/                            # JSON schema contracts
    └── pattern-passport.schema.json    # Standard JSON schema for pattern passports
```

---

## Module Descriptions

### 1. `docs/` — Governance & Research Documentation
- **`PROJECT_CHARTER.md`**: Establishes the 10 constitutional principles (sandbox isolation, baseline immutability, role separation, independent verification, domain bounds, evidence thresholds, promotion pathway, non-contamination, reproducibility, and cryptographic traceability).
- **`REPOSITORY_MAP.md`**: Outlines physical paths, structural intent, and module responsibilities.
- **`CHANGELOG.md`**: Tracks chronological changes, snapshots, and releases.
- **`docs/research/PRIMITIVE_B_INDEPENDENT_AUDIT.md`**: The exhaustive, independent technical audit of Primitive B (`FIND_FOLD_AXIS_POINT_TO_POINT`), detailing invariants, floating-point error bounds, and the conditional verdict `ACCEPTED WITH RESTRICTIONS`.
- **`docs/decisions/DECISION_LOG.md`**: Records formal consensus and architectural decisions (ADR-001: Provisional acceptance with restrictions into Skilla).
- **`docs/provenance/SOURCE_MANIFEST.md`**: Documents the cryptographic lineage of all files imported from upstream PCRS.

### 2. `src/core/` — Reference Geometry Baseline
- **`src/core/reflection.ts`**: The reference mathematical kernel for 2D rigid reflections ($p' = a + R(p - a)$), affine composition, and distance preservation. Kept identical to PCRS certified baseline to provide an untampered benchmark for experimental constructions.

### 3. `src/construction/` — Experimental Geometry Construction Primitives
- **`pointToPoint.ts` (Generator)**: Implements `findFoldAxisPointToPoint(p1, p2, options)`. Given points $P_1, P_2 \in \mathbb{R}^2$, determines the perpendicular bisector line $L = (M, u)$ such that $R_L(P_1) = P_2$. Strictly enforces $\varepsilon_{\text{sep}} = 10^{-10}$ and refuses arbitrary lines for coincident points.
- **`pointToPointVerifier.ts` (Verifier)**: Implements zero-trust evaluation of 7 geometric invariants: midpoint incidence, chord orthogonality, anchor equidistance, bidirectional reflection closure, axis fixed-point invariance, and unit direction normalization.
- **`pointToPointTest.ts` (Tester)**: Defines and executes the 11-test evaluation suite covering ordinary geometries, coincident points, sub-threshold and super-threshold separations, non-numeric coordinates, and perturbed negative controls.

### 4. `scripts/` — Automated CLI Test Harnesses
- **`scripts/runPointToPoint.ts`**: Runs the 11 Primitive B tests and outputs diagnostic tables.
- **`scripts/runTests.ts`**: Runs both baseline reflection invariant verification and the Primitive B suite, verifying 100% test success.

### 5. `schemas/` — Formal Contract Definitions
- **`schemas/pattern-passport.schema.json`**: JSON Schema (Draft 2020-12) defining structural and verification requirements for pattern passports.
