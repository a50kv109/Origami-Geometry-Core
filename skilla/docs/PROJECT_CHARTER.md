# Skilla Research Laboratory — Project Charter & Governance Principles

**Repository:** `a50kv109/skilla`  
**Version:** 1.0  
**Status:** ACTIVE GOVERNANCE  

---

## Mission Statement

Skilla is an experimental research laboratory for the mathematical specification, numerical implementation, independent verification, and adversarial stress-testing of geometric construction primitives and computational origami systems.

All work in Skilla operates under strict methodological separation from upstream production and certified baselines, adhering to ten fundamental governing principles.

---

## The Ten Governance Principles

### 1. Research Sandbox Principle
All new, exploratory, or uncertified geometric construction primitives reside exclusively within Skilla. No experimental primitive may be merged into production or authoritative baselines without completing the full audit and restriction verification lifecycle.

### 2. Baseline Immutability Principle
Certified components originating from the upstream PCRS repository (including frozen reflection kernels, certified validators, and approved pattern passports) are strictly immutable. They may be imported into Skilla solely as reference baselines and must not be altered, patched, or weakened within the experimental environment.

### 3. Separation of Roles Principle
To eliminate cognitive bias and architectural conflicts of interest, every construction primitive is governed by four distinct, decoupled responsibilities:
- **Generator (`pointToPoint.ts`):** Implements the pure algorithmic construction logic.
- **Verifier (`pointToPointVerifier.ts`):** Independently re-computes invariant checks without reusing generator internal state.
- **Tester (`pointToPointTest.ts`):** Exercises nominal, boundary, degenerated, and adversarial scenarios.
- **Auditor (`PRIMITIVE_B_INDEPENDENT_AUDIT.md`):** Conducts impartial architectural review, precision boundary analysis, and determines deployment restrictions.

### 4. Independent Verification Principle
A construction generator must **never** verify itself. All invariants (midpoint incidence, orthogonality, reflection closure, fixed-point invariance, isometry preservation) must be evaluated using independent mathematical formulations and independent numerical routines. If the generator produces an output, the verifier treats that output as untrusted external data.

### 5. Domain Restrictions Principle
No numerical implementation in floating-point arithmetic ($\text{Float64}$) may make unbounded mathematical claims. Every primitive must explicitly state:
- Valid coordinate domain (e.g., $\max(|x|, |y|) \le 10$);
- Minimum separation threshold ($\varepsilon_{\text{sep}}$);
- Explicit behavior for underflow, catastrophic cancellation, or degenerate configurations.
Unbounded general claims are strictly prohibited.

### 6. Evidence Threshold Principle
Acceptance of any experimental primitive into the restricted tier requires an exhaustive evidentiary record:
- Minimum required test suite covering nominal benchmarks;
- Explicit boundary tests at and around numerical thresholds;
- Explicit degenerate handling (refusal to guess in indeterminate states);
- Compulsory negative controls demonstrating that corrupted inputs or perturbed axes are systematically rejected;
- Rigorous justification for every tolerance parameter based on machine epsilon ($\varepsilon_{\text{mach}} \approx 2.22 \times 10^{-16}$).

### 7. Promotion Pathway Principle
All geometric primitives advance through a strict four-stage promotion lifecycle:
1. `EXPERIMENTAL`: Initial formulation and proof-of-concept tests.
2. `AUDITED`: Comprehensive independent mathematical and code review completed.
3. `RESTRICTED`: Provisionally accepted with bounded domain constraints and passed negative controls.
4. `BASELINE CANDIDATE`: Documented, standardized passport candidate eligible for PCRS upstream consideration.

### 8. Non-Contamination Rule
Skilla enforces strict intellectual and algorithmic cleanliness. No speculative formulas, untested third-party code, unverified heuristics, or arbitrary assumptions from secondary literature may be introduced without primary source validation and independent verification contracts.

### 9. Reproducibility Rule
All laboratory experiments must be entirely self-contained, deterministic, and runnable from the command line without external network calls, UI dependencies, or proprietary tooling. Execution of `npm test` or `tsx scripts/runPointToPoint.ts` must produce reproducible numerical outputs and unambiguous pass/fail exit codes.

### 10. Version and Audit Traceability Principle
Every artifact, schema, primitive, and verification report in Skilla is tracked through cryptographically verifiable hashes (SHA-256), git commit histories, formal changelog records, and immutable decision logs. Any modification to a primitive or verifier necessitates an audit re-evaluation.
