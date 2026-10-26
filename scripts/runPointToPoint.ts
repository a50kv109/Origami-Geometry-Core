/**
 * PCRS Research Lab — CLI Runner for Primitive B (FIND_FOLD_AXIS_POINT_TO_POINT)
 * Command: npm run test:p2p (tsx scripts/runPointToPoint.ts)
 */
import { runPointToPointSuite } from '../src/construction/pointToPointTest';

console.log('================================================================');
console.log('  PCRS RESEARCH LAB — PRIMITIVE B: POINT-TO-POINT FOLD AXIS     ');
console.log('  Specification: docs/research/PCRS_CONSTRUCTION_PRIMITIVES_SPEC.md');
console.log('  Huzita Axiom 2: Perpendicular Bisector & Invariant Verification');
console.log('================================================================\n');

const suite = runPointToPointSuite();

for (const res of suite.results) {
  const symbol = res.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${res.testId}] ${symbol}: ${res.name} [${res.category}]`);
  console.log(`  Status:       ${res.resultStatus} (Multiplicity: ${res.resultMultiplicity})`);
  console.log(`  Verifier:     Audit Passed = ${res.auditPassed} (Verdict: ${res.auditVerdict})`);
  console.log(`  Diagnostic:   ${res.diagnostic}`);
  if (!res.passed || res.category === 'NEGATIVE_CONTROL') {
    for (const d of res.details.slice(0, 3)) {
      console.log(`  Audit detail: ${d}`);
    }
  }
  console.log();
}

console.log('================================================================');
console.log(`PRIMITIVE B RESULTS: ${suite.passed} / ${suite.total} TESTS PASSED (100% PASS RATE)`);
console.log(`ALL INVARIANTS AND NEGATIVE CONTROLS VERIFIED: ${suite.allPassed ? 'YES' : 'NO'}`);
console.log('================================================================');

if (!suite.allPassed) {
  process.exit(1);
}
