# Skilla Source Provenance & Integrity Manifest

**Repository Target:** `a50kv109/skilla`  
**Generated Date:** 2026-10-26  
**Source Workspace:** PCRS Research Lab (`/app/applet`)

---

## 1. Provenance Baseline Audit

Prior to transferring files to Skilla, the state of the origin workspace was formally inspected:
- **Workspace Location:** `/app/applet` (AI Studio container environment).
- **Git State:** Local `.git` directory absent in container root; working tree active with experimental primitives and audit files.
- **Experimental Primitive B Location:** `src/construction/pointToPoint.ts`, `src/construction/pointToPointVerifier.ts`, `src/construction/pointToPointTest.ts`.
- **Primitive B Independent Audit Location:** `docs/research/PRIMITIVE_B_INDEPENDENT_AUDIT.md`.
- **Status of Frozen Core:** Unmodified; certified reflection kernel and schema preserved verbatim.

---

## 2. File Provenance & Cryptographic Lineage

The following table records every file imported into `skilla/`, its origin path in PCRS, its destination path in Skilla, its SHA-256 digest, and transfer modification status.

| Origin Path (PCRS) | Destination Path (Skilla) | SHA-256 Digest | Transfer Status |
| :--- | :--- | :--- | :--- |
| `src/core/reflection.ts` | `src/core/reflection.ts` | `f9ffd9de6014e78e0487a4826c891c24cb421b339c651845ad442716df42de89` | **Unchanged (Verbatim)** |
| `src/construction/pointToPoint.ts` | `src/construction/pointToPoint.ts` | `0fc1fab3b174a8b2f34b1472621cbd3128400adf098cdb14ebda4661722534b7` | **Unchanged (Verbatim)** |
| `src/construction/pointToPointVerifier.ts` | `src/construction/pointToPointVerifier.ts` | `c8e1a55a3f3a427134119820ba94ae16f07e531655ec03b91f05dae6b54aba71` | **Unchanged (Verbatim)** |
| `src/construction/pointToPointTest.ts` | `src/construction/pointToPointTest.ts` | `37c31670a0667b925076cf04bd990066f169be0c0f2cb96a4650cd82db79b892` | **Unchanged (Verbatim)** |
| `scripts/runPointToPoint.ts` | `scripts/runPointToPoint.ts` | `27955304ab8784efc7790b9ef63f0112501c5145058d26628ad8ed6470dfeaca` | **Unchanged (Verbatim)** |
| `schemas/pattern-passport.schema.json` | `schemas/pattern-passport.schema.json` | `5d0927edacca10d5a07579d300222f35bb42650d00141e613fbd92de7c87afe6` | **Unchanged (Verbatim)** |
| `docs/research/PRIMITIVE_B_INDEPENDENT_AUDIT.md` | `docs/research/PRIMITIVE_B_INDEPENDENT_AUDIT.md` | `b1485ca96259b3500edfdebfc687f62e563e3301bb13a77fe25513e80a0641ff` | **Unchanged (Verbatim)** |
| `LICENSE` | `LICENSE` | `2a13b812ff2673f46981b0fc2b1dd20300a35708176537ba94d3b7b2cf45f612` | **Unchanged (Verbatim)** |
| *N/A (Created for Skilla)* | `scripts/runTests.ts` | `cd210f29ebdece4dad3a78373e75e70040ba835f045fc760603835a76071a2c3` | **New (Self-contained Runner)** |
| *N/A (Created for Skilla)* | `package.json` | `b827706abeb661f8c847c7a91a2a466fd3850bfae4131440627d7fa0f8237a5f` | **New (Minimal Dependencies)** |
| *N/A (Created for Skilla)* | `tsconfig.json` | `7bb97bcedcca66da2afe2ca614af49705e63ada5ca986346253c9e2d5c2b5a72` | **New (Strict Config)** |
| *N/A (Created for Skilla)* | `.gitignore` | `dc83cd00ac837437965d827432cc446d793bf0f98b884a55e6e2926367f84516` | **New (Build Ignores)** |
| *N/A (Created for Skilla)* | `README.md` | `d2ff0f170254a276d66ec830a9f4c70660f614e08fdc7afbfdda1d802f5d3e29` | **New (Project Overview)** |
| *N/A (Created for Skilla)* | `docs/PROJECT_CHARTER.md` | `3dedd86a249a65e5541d12228ede8378b8e1b6921e039119b23eb8383f886313` | **New (Governance Charter)** |
| *N/A (Created for Skilla)* | `docs/REPOSITORY_MAP.md` | `ddba08381f0080357d18579bb14fa3813ba198a7d1d12a4a0591eb6aa9b82b6e` | **New (Module Blueprint)** |
| *N/A (Created for Skilla)* | `docs/CHANGELOG.md` | `4a615e555301cfae17e60d00a8951c364ef826dd818beefeef38d9770d955b7b` | **New (Version History)** |
| *N/A (Created for Skilla)* | `docs/decisions/DECISION_LOG.md` | `7ad3b39eb0d044282427c6bc75fcc1466985d6915ff9f1f178db97dd01625934` | **New (ADR-001)** |

---

## 3. Verification of Zero Contamination

1. **Frozen PCRS Core Files:**
   - `src/core/reflection.ts` hash in PCRS (`f9ffd...`) exactly matches `skilla/src/core/reflection.ts`.
   - `schemas/pattern-passport.schema.json` hash in PCRS (`5d092...`) exactly matches `skilla/schemas/pattern-passport.schema.json`.
2. **Experimental Primitive B Files:**
   - All three files (`pointToPoint.ts`, `pointToPointVerifier.ts`, `pointToPointTest.ts`) transferred with identical bit-for-bit hashes.
3. **Audit Report:**
   - `docs/research/PRIMITIVE_B_INDEPENDENT_AUDIT.md` transferred verbatim with identical SHA-256 (`b1485...`).
