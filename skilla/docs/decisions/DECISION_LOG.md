# Skilla Decision Log (Architecture Decision Records)

This log records formal architectural and governance decisions for the Skilla Experimental Geometry Research Laboratory.

---

## ADR-001: Provisional Acceptance of Primitive B with Domain Restrictions into Skilla

- **Date:** 2026-10-26
- **Status:** APPROVED WITH RESTRICTIONS
- **Deciders:** Independent Geometry Audit / PCRS Research Working Group
- **Related Documents:**
  - `docs/research/PRIMITIVE_B_INDEPENDENT_AUDIT.md`
  - `docs/PROJECT_CHARTER.md` (Principles 1, 4, 5, 7)

### Context
In PCRS Research Lab, experimental geometric primitive B (`FIND_FOLD_AXIS_POINT_TO_POINT`, corresponding to Huzita Axiom 2) was developed to determine the fold axis reflecting point $P_1$ onto point $P_2$.

An independent mathematical and code audit was conducted on:
- `src/construction/pointToPoint.ts` (generator)
- `src/construction/pointToPointVerifier.ts` (verifier)
- `src/construction/pointToPointTest.ts` (test suite)
- `scripts/runPointToPoint.ts` (CLI runner)

The test suite executed 11 tests with 100% pass rate. However, an independent audit identified that the separation threshold $\varepsilon_{\text{sep}} = 1.0 \times 10^{-10}$ is an absolute Euclidean norm threshold. In floating-point arithmetic ($\text{Float64}$), relative precision is $\varepsilon_{\text{mach}} \approx 2.22 \times 10^{-16}$. When coordinates $|x|, |y|$ exceed $10^5$, floating-point cancellation error $|x_2 - x_1|$ can exceed $10^{-10}$, rendering an absolute separation threshold ineffective for uncalibrated large coordinate domains.

### Decision
1. **Accept Primitive B provisionally into Skilla** as an experimental construction primitive under the classification:
   `PRIMITIVE B — EXPERIMENTAL; AUDIT PENDING INDEPENDENT REVIEW`
2. **Impose explicit domain restrictions:**
   - Coordinate domain: $\max(|x|, |y|) \le 10$ (well within the calibrated regime).
   - Separation threshold: $\varepsilon_{\text{sep}} = 1.0 \times 10^{-10}$.
   - Exact coincidence behavior: status `COINCIDENT_POINTS_INFINITE_SOLUTIONS` with multiplicity `INFINITE` and axis `null` (strict refusal to guess an arbitrary axis).
   - Sub-threshold behavior: status `NUMERICAL_INSTABILITY` with multiplicity `ZERO`.
3. **Do not promote Primitive B to upstream PCRS certified baseline** until relative-tolerance normalization ($\varepsilon_{\text{rel}} \cdot \max(1, \|P_1\|, \|P_2\|)$) is evaluated in a subsequent experimental cycle.

### Consequences
- **Positive:** Skilla possesses a verified, mathematically sound Huzita Axiom 2 implementation within bounded origami paper dimensions ($[-10, 10]^2$), passing all 7 invariant checks and negative controls.
- **Negative / Constraints:** Applications using Primitive B must strictly validate that input coordinates lie within the bounded domain $\max(|x|, |y|) \le 10$.
