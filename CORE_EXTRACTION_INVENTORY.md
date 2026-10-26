# CORE_EXTRACTION_INVENTORY.md

**Document ID:** `CORE-EXTRACTION-INV-001`  
**Date:** October 2026  
**Status:** INVENTORY COMPLETE  

---

| Path | Purpose | Category | Deps | Proposed Action | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src/stand/` | Authoritative Geometric Engine | Core | None | Rename/Move to `src/core/` | Low |
| `src/experimental/`| Geometric Reasoning Framework | Experimental | `src/stand` | Move to `src/experimental/` | Low |
| `src/core/` | Legacy Application Logic | Legacy | `src/stand` | Deprecate/Audit | Medium |
| `dist/assets/` | Origami Books/Media | Resources | None | Exclude from Core Repo | Low |
| `skilla/docs/research/`| Geometric Research Reports | Documentation | None | Move to `docs/research/` | Low |
| `package.json` | Project Config | Build | Various | Minimize dependencies | Medium |
| `src/components/` | Legacy UI Components | Legacy | `src/stand` | Audit/Deprecate | Medium |

---
*Note: This inventory captures the structural dependencies identified during the extraction audit.*
