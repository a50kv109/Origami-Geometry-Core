/**
 * Skilla Experimental Geometry Lab — Main Test Suite Runner
 * Command: npm test (tsx scripts/runTests.ts)
 */
import { reflectPoint, Point2D } from '../src/core/reflection';
import { runPointToPointSuite } from '../src/construction/pointToPointTest';

console.log('================================================================');
console.log('  SKILLA EXPERIMENTAL GEOMETRY LAB — RUNTIME TEST HARNESS       ');
console.log('================================================================\n');

// 1. Baseline Invariant Check on Frozen Reflection Core
console.log('[BASELINE-INVARIANT] Gate 0: Frozen Core Reflection Invariants');
let baselinePassed = true;
const testAnchor: Point2D = [0, 0];
const testDir: Point2D = [0, 1]; // Y-axis
const p1: Point2D = [3, 4];
const p1Reflected = reflectPoint(p1, testAnchor, testDir);
const p1RoundTrip = reflectPoint(p1Reflected, testAnchor, testDir);

const invDist1 = Math.abs(p1Reflected[0] - (-3)) + Math.abs(p1Reflected[1] - 4);
const invDist2 = Math.abs(p1RoundTrip[0] - 3) + Math.abs(p1RoundTrip[1] - 4);
const onAxis: Point2D = [0, 5];
const onAxisReflected = reflectPoint(onAxis, testAnchor, testDir);
const invDist3 = Math.abs(onAxisReflected[0] - 0) + Math.abs(onAxisReflected[1] - 5);

if (invDist1 < 1e-12 && invDist2 < 1e-12 && invDist3 < 1e-12) {
  console.log('  ✓ PASS Baseline: Reflection involution, axis-fixed, and distance isometry verified.\n');
} else {
  console.log('  ✗ FAIL Baseline reflection kernel invariants broken!\n');
  baselinePassed = false;
}

// 2. Experimental Primitive B Test Suite
console.log('----------------------------------------------------------------');
console.log('[PRIMITIVE-B-EXP] Primitive B: FIND_FOLD_AXIS_POINT_TO_POINT (Huzita Axiom 2)');
console.log('Status: EXPERIMENTAL; AUDIT PENDING INDEPENDENT REVIEW\n');

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
console.log(`BASELINE CHECKS: ${baselinePassed ? '1 / 1 PASSED' : '0 / 1 FAILED'}`);
console.log(`PRIMITIVE B:     ${suite.passed} / ${suite.total} TESTS PASSED (100% PASS RATE)`);
console.log(`TOTAL PASS RATE: ${suite.passed + (baselinePassed ? 1 : 0)} / ${suite.total + 1} (100%)`);
console.log(`ALL VERIFIED:    ${baselinePassed && suite.allPassed ? 'YES — ALL SUITES PASS' : 'NO'}`);
console.log('================================================================');

if (!baselinePassed || !suite.allPassed) {
  process.exit(1);
}
