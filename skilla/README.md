# Skilla — Experimental Geometry Construction Research Laboratory

**Repository:** `a50kv109/skilla`  
**Upstream Project:** PCRS (Paper Construction Reasoning Stand)  
**Status:** Active Experimental Laboratory (Sandbox)

---

## 1. Purpose of Skilla

**Skilla** is a dedicated, reproducible research laboratory designed for the rigorous mathematical formulation, implementation, independent auditing, and empirical verification of computational origami and geometric construction primitives (such as the Huzita–Justin axioms and Fujimoto constructions).

Skilla provides a sandboxed environment where experimental primitives can undergo multi-metric verification, adversarial testing, negative control checks, and independent code audits without risking contamination or instability in the upstream frozen verification baselines.

---

## 2. Relationship Between Skilla and PCRS

- **Upstream Baseline (PCRS):** The original PCRS repository (`PCRS-Paper-Construction-Reasoning-Stand`) contains frozen, certified components (such as Gate 0/Gate 1 reflection kernels, independent verifiers, and passport schemas). Those components are immutable standards.
- **Experimental Sandbox (Skilla):** Skilla is **not** the authoritative baseline. It is an independent laboratory branch where new construction operations are developed and stress-tested.
- **Promotion Pathway:** No primitive developed in Skilla is merged into PCRS baseline without passing:
  1. Complete invariant specifications (Generator);
  2. Independent, zero-trust mathematical verification (Verifier);
  3. Comprehensive benchmark, boundary, and negative control test suites (Tester);
  4. Formal independent audit reporting with explicit domain restrictions (Auditor).

---

## 3. Current Status of Primitive B

### `PRIMITIVE B — EXPERIMENTAL; AUDIT PENDING INDEPENDENT REVIEW`

- **Identifier:** `FIND_FOLD_AXIS_POINT_TO_POINT` (Huzita Axiom 2 / Midpoint Perpendicular Bisector).
- **Audit Verdict:** **Accepted with Restrictions** (see `docs/research/PRIMITIVE_B_INDEPENDENT_AUDIT.md`).
- **Domain Restrictions:** Bounded coordinate domain $\max(|x|, |y|) \le 10$, minimum separation threshold $\varepsilon_{\text{sep}} = 1.0 \times 10^{-10}$. Invariant checks pass 100% across all 11 benchmark, boundary, and negative control scenarios.
- **Status Classification:** Primitive B is strictly classified as experimental within Skilla; it is **not** an accepted standard baseline primitive of PCRS.

---

## 4. How to Run Primitive B Verification Locally

To run the verification suite for Primitive B and baseline reflection checks:

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- `npx` / `tsx` installed

### Run Primitive B Suite (11 Tests)
```bash
npx tsx scripts/runPointToPoint.ts
```

### Run Full Laboratory Test Harness
```bash
npx tsx scripts/runTests.ts
```

Both runners verify:
1. Benchmark geometry (horizontal, vertical, diagonal, and general oblique segments);
2. Boundary conditions (exact coincidence refusing arbitrary axes, near-coincidence below $\varepsilon_{\text{sep}}$ rejecting ill-conditioned inputs, near-coincidence above $\varepsilon_{\text{sep}}$ passing);
3. Invalid coordinates (NaN, Infinity rejection);
4. Negative controls (detecting angular corruption and anchor displacement).

---

## 5. How to Download the Repository as a ZIP Archive

Once published to GitHub under `https://github.com/a50kv109/skilla`:

### Option A: Via Browser
1. Navigate to: [https://github.com/a50kv109/skilla](https://github.com/a50kv109/skilla)
2. Click the green **Code** button in the top right.
3. Select **Download ZIP** (`skilla-main.zip`).

### Option B: Direct URL Download
```bash
curl -L -O https://github.com/a50kv109/skilla/archive/refs/heads/main.zip
unzip main.zip
cd skilla-main
```

### Option C: Clone via Git
```bash
git clone https://github.com/a50kv109/skilla.git
cd skilla
npm test
```
