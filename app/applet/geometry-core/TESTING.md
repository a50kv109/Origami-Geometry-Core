# Testing Instructions

## Running Tests

To run the cross-domain branch selection tests:

```bash
# Execute from geometry-core/ directory
./node_modules/.bin/tsx src/experimental/tests/experiment.test.ts
```

## Status
- **EXP-GGR-01 (Selection):** 7/7 PASS.
- **Core Stand Tests:** Base kernel functionality verified (15/15 PASS in parent).
- **Standalone Verification:** Awaiting migration of base kernel tests into `geometry-core/tests/`.
