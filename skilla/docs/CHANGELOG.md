# Skilla Changelog

All notable changes to the **Skilla Experimental Geometry Research Laboratory** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-10-26

### Added
- **Repository Establishment (Task 0):** Initialized standalone experimental repository `a50kv109/skilla` decoupled from upstream PCRS baseline.
- **Reference Geometry Baseline:**
  - `src/core/reflection.ts` imported verbatim from PCRS certified core (SHA-256: `f9ffd9de6014e78e0487a4826c891c24cb421b339c651845ad442716df42de89`).
- **Experimental Construction Primitives:**
  - `src/construction/pointToPoint.ts` (Primitive B: Huzita Axiom 2 / Midpoint Perpendicular Bisector generator).
  - `src/construction/pointToPointVerifier.ts` (Independent multi-metric verifier for 7 geometric invariants).
  - `src/construction/pointToPointTest.ts` (11 benchmark, boundary, and negative control test scenarios).
- **Independent Audit & Decisions:**
  - `docs/research/PRIMITIVE_B_INDEPENDENT_AUDIT.md` (Verbatim independent technical audit report; verdict: `ACCEPTED WITH RESTRICTIONS`).
  - `docs/decisions/DECISION_LOG.md` (ADR-001: Provisional acceptance of Primitive B with restrictions).
- **Governance & Traceability Documentation:**
  - `docs/PROJECT_CHARTER.md` (Ten governance principles for sandbox isolation and invariant rigor).
  - `docs/REPOSITORY_MAP.md` (Architectural layout and module boundaries).
  - `docs/provenance/SOURCE_MANIFEST.md` (Cryptographic origin records and checksums).
  - `schemas/pattern-passport.schema.json` (Formal pattern passport schema).
- **CLI Test Harnesses:**
  - `scripts/runPointToPoint.ts` (Direct CLI runner for Primitive B tests).
  - `scripts/runTests.ts` (Comprehensive laboratory test harness).
  - `package.json` & `tsconfig.json` for independent execution.
  - `LICENSE` preserving MIT License.
