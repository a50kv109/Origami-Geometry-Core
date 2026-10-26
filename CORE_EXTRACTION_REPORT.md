# CORE_EXTRACTION_REPORT — GEOMETRY REASONING CORE

**Document ID:** `CORE-EXTRACTION-REPORT`  
**Date:** October 2026  
**Status:** EXTRACTION COMPLETE (VERIFIED)  

---

## 1. Executive Summary
The Geometry Reasoning Core has been successfully extracted from the main application repository into a standalone, compact directory (`/app/applet/geometry-core/`). This core is now decoupled from the application assets, documentation, and research materials, enabling independent development and testing.

## 2. Extraction Inventory & Rationale

| Component | Inclusion Status | Rationale |
| :--- | :--- | :--- |
| `src/core/` (from `src/stand/`) | Included | Mathematical engine, essential for all reasoning. |
| `src/experimental/reasoning/` | Included | Core framework for branch selection and reasoning. |
| `docs/research/` | Excluded | Documentation moved to `docs/` in core. |
| `dist/assets/` (Origami Books) | Excluded | Large resources kept in original repo, decoupled from core. |
| `tests/` | Included | Reorganized to support independent verification. |

## 3. Structural Changes

1.  **Directory Creation:** Created `/app/applet/geometry-core/` with a clean `src/core/`, `src/experimental/`, `docs/`, and `tests/` structure.
2.  **Files Moved:**
    *   `src/stand/*` -> `geometry-core/src/core/`
    *   `src/experimental/reasoning/*` -> `geometry-core/src/experimental/`
3.  **Dependency Fixes:** Updated import paths in `3d_tetrahedron.ts` and other experimental modules to reflect the new structure, using relative imports that resolve correctly within the standalone core.
4.  **Configuration:** `package.json` and `tsconfig.json` were copied to the new location to ensure self-contained buildability.

## 4. Verification Results
- **Build/Compile:** `PASS`
- **Experimental Reasoning Tests:** `PASS` (All tests executed in `geometry-core/` passed).
- **Core Dependency Separation:** `PASS` (The core no longer relies on `dist/assets/` or main app components).

## 5. Unresolved Issues & Future Steps

*   **Licensing:** License for the extracted core is currently undefined. Needs to be clarified prior to any public release.
*   **Documentation:** `README.md`, `ARCHITECTURE.md`, `STATUS.md`, `TESTING.md`, `KNOWN_LIMITATIONS.md` remain placeholders and must be populated with specific documentation for the standalone repository.
*   **Next Step:** Define the API interface for the AI Skill wrapper to interact with this core reasoning engine.

---
*End of Report.*
