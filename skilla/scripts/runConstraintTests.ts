/**
 * Skilla Research Lab — CLI Runner for Constraint Resolution Prototype (INS-001)
 * Command: tsx scripts/runConstraintTests.ts
 */
import { runConstraintTestSuite } from '../src/experimental/constraint-resolution/constraintTest';

console.log('================================================================');
console.log('  SKILLA EXPERIMENTAL LAB — INS-001 CONSTRAINT RESOLVER PROTOTYPE');
console.log('  Constraint Resolution & Solution Multiplicity (Axiom 5 Gate)  ');
console.log('  Formal Separation: Condition != SolutionSet != SelectionRule  ');
console.log('================================================================\n');

const suite = runConstraintTestSuite();

for (const res of suite.results) {
  const symbol = res.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${res.testId}] ${symbol}: ${res.name}`);
  console.log(`  Category:     ${res.category}`);
  console.log(`  Status:       ${res.actualStatus} (Expected: ${res.expectedStatus})`);
  console.log(`  Cardinality:  ${res.actualCardinality} (Solutions: ${res.solutionCount})`);
  console.log(`  Verifier:     Audit Passed = ${res.auditPassed} (Verdict: ${res.auditVerdict})`);
  console.log(`  Diagnostic:   ${res.diagnostic}`);
  if (res.details.length > 0) {
    for (const d of res.details.slice(0, 3)) {
      console.log(`  Audit detail: ${d}`);
    }
  }
  console.log();
}

console.log('================================================================');
console.log(`INS-001 PROTOTYPE RESULTS: ${suite.passed} / ${suite.total} TESTS PASSED (${((suite.passed / suite.total) * 100).toFixed(1)}% PASS RATE)`);
console.log(`ALL AMBIGUITY, SELECTION, AND INVARIANT GATES VERIFIED: ${suite.allPassed ? 'YES' : 'NO'}`);
console.log('================================================================');

if (!suite.allPassed) {
  process.exit(1);
}
