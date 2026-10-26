/**
 * Skilla Experimental Geometry Lab — Constraint Resolution Test Suite
 * Module: src/experimental/constraint-resolution/constraintTest.ts
 *
 * Research Insight INS-001: Explicit Constraint Resolution.
 * Tests isolated experimental constraint resolver and selection rule binder.
 */

import { Point2D, Line2D } from '../../core/reflection';
import { resolvePointToLineConstraint } from './pointToLineResolver';
import { applySelectionRule } from './selectionRules';
import {
  auditUnconstrainedResolution,
  auditResolvedSelection,
  VerifierVerdict,
} from './constraintVerifier';

export interface TestCaseResult {
  testId: string;
  name: string;
  category:
    | 'UNDERCONSTRAINED'
    | 'DEGENERACY'
    | 'AXIOM_5_BINDING'
    | 'NEGATIVE_CONTROL'
    | 'OBLIQUE'
    | 'EDGE_CASE'
    | 'NUMERICAL_SCALE'
    | 'EQUIVALENCE';
  passed: boolean;
  expectedStatus: string;
  actualStatus: string;
  expectedCardinality: string;
  actualCardinality: string;
  solutionCount: number;
  auditPassed: boolean;
  auditVerdict: VerifierVerdict;
  diagnostic: string;
  details: string[];
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  results: TestCaseResult[];
}

export function runConstraintTestSuite(): TestSuiteSummary {
  const results: TestCaseResult[] = [];

  // --------------------------------------------------------------------------
  // TC-AMB-01: Underconstrained continuous family without selection rule
  // P = (0, 1), Line L: y = 0 (anchor: [0, 0], dir: [1, 0])
  // --------------------------------------------------------------------------
  {
    const P: Point2D = [0, 1];
    const L: Line2D = { point: [0, 0], direction: [1, 0] };
    const res = resolvePointToLineConstraint(P, L);
    const audit = auditUnconstrainedResolution(res);

    const passed =
      res.status === 'CONTINUOUS_FAMILY' &&
      res.cardinality === 'INFINITE_CONTINUOUS_1D' &&
      res.axis === null &&
      audit.passed;

    results.push({
      testId: 'TC-AMB-01',
      name: 'Pure Point-to-Line constraint: 1D Continuous Family (No arbitrary collapse)',
      category: 'UNDERCONSTRAINED',
      passed,
      expectedStatus: 'CONTINUOUS_FAMILY',
      actualStatus: res.status,
      expectedCardinality: 'INFINITE_CONTINUOUS_1D',
      actualCardinality: res.cardinality,
      solutionCount: 0,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: res.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-02: Incident Point Degeneracy (P in L)
  // P = (2, 0), Line L: y = 0
  // --------------------------------------------------------------------------
  {
    const P: Point2D = [2, 0];
    const L: Line2D = { point: [0, 0], direction: [1, 0] };
    const res = resolvePointToLineConstraint(P, L);
    const audit = auditUnconstrainedResolution(res);

    const passed =
      res.status === 'ALREADY_SATISFIED' &&
      res.cardinality === 'ALREADY_SATISFIED_INFINITE' &&
      res.axis === null &&
      audit.passed;

    results.push({
      testId: 'TC-AMB-02',
      name: 'Incident Point on Line: ALREADY_SATISFIED (Pencil and Perpendicular branches)',
      category: 'DEGENERACY',
      passed,
      expectedStatus: 'ALREADY_SATISFIED',
      actualStatus: res.status,
      expectedCardinality: 'ALREADY_SATISFIED_INFINITE',
      actualCardinality: res.cardinality,
      solutionCount: 0,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: res.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-03: Selection Rule Binding (Axiom 5 Secant: 2 solutions)
  // P1 = (0, 1), Line L: y = 0, Pivot P2 = (0, 0)
  // Expected axes: y = x (m1) and y = -x (m2)
  // --------------------------------------------------------------------------
  {
    const P1: Point2D = [0, 1];
    const L: Line2D = { point: [0, 0], direction: [1, 0] };
    const P2: Point2D = [0, 0];

    const unconstrained = resolvePointToLineConstraint(P1, L);
    const bound = applySelectionRule(unconstrained, {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const audit = auditResolvedSelection(bound);

    const passed =
      bound.status === 'FINITE_MULTIPLE' &&
      bound.cardinality === 'FINITE_MULTIPLE' &&
      bound.solutions.length === 2 &&
      audit.passed;

    results.push({
      testId: 'TC-AMB-03',
      name: 'Huzita Axiom 5 Secant: Pivot P2=(0,0) yields exactly 2 solutions (y = x, y = -x)',
      category: 'AXIOM_5_BINDING',
      passed,
      expectedStatus: 'FINITE_MULTIPLE',
      actualStatus: bound.status,
      expectedCardinality: 'FINITE_MULTIPLE',
      actualCardinality: bound.cardinality,
      solutionCount: bound.solutions.length,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: bound.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-04: Selection Rule Negative Control (Axiom 5 Unreachable: 0 solutions)
  // P1 = (0, 2), Line L: y = 0, Pivot P2 = (0, 5) -> R = 3, h = 5 > R
  // --------------------------------------------------------------------------
  {
    const P1: Point2D = [0, 2];
    const L: Line2D = { point: [0, 0], direction: [1, 0] };
    const P2: Point2D = [0, 5];

    const unconstrained = resolvePointToLineConstraint(P1, L);
    const bound = applySelectionRule(unconstrained, {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const audit = auditResolvedSelection(bound);

    const passed =
      bound.status === 'NO_SOLUTION' &&
      bound.cardinality === 'ZERO' &&
      bound.solutions.length === 0 &&
      audit.passed;

    results.push({
      testId: 'TC-AMB-04',
      name: 'Huzita Axiom 5 Negative Control: h > R yields NO_SOLUTION (0 solutions)',
      category: 'NEGATIVE_CONTROL',
      passed,
      expectedStatus: 'NO_SOLUTION',
      actualStatus: bound.status,
      expectedCardinality: 'ZERO',
      actualCardinality: bound.cardinality,
      solutionCount: bound.solutions.length,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: bound.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-05: Selection Rule Tangency Boundary (Axiom 5 Tangent: 1 solution)
  // P1 = (0, 2), Line L: y = 0, Pivot P2 = (0, 1) -> R = 1, h = 1 = R
  // Expected axis: y = 1 (horizontal line)
  // --------------------------------------------------------------------------
  {
    const P1: Point2D = [0, 2];
    const L: Line2D = { point: [0, 0], direction: [1, 0] };
    const P2: Point2D = [0, 1];

    const unconstrained = resolvePointToLineConstraint(P1, L);
    const bound = applySelectionRule(unconstrained, {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const audit = auditResolvedSelection(bound);

    const passed =
      bound.status === 'UNIQUE' &&
      bound.cardinality === 'FINITE_UNIQUE' &&
      bound.solutions.length === 1 &&
      audit.passed;

    results.push({
      testId: 'TC-AMB-05',
      name: 'Huzita Axiom 5 Tangency: h == R yields UNIQUE tangent solution (y = 1)',
      category: 'AXIOM_5_BINDING',
      passed,
      expectedStatus: 'UNIQUE',
      actualStatus: bound.status,
      expectedCardinality: 'FINITE_UNIQUE',
      actualCardinality: bound.cardinality,
      solutionCount: bound.solutions.length,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: bound.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-06: Oblique Diagonal Line Invariant Verification
  // Target line at 45 deg through (0, 0): dir = (1/sqrt(2), 1/sqrt(2))
  // P1 = (0, 2), Pivot P2 = (1, 1) in L -> h = 0 < R = sqrt((0-1)^2 + (2-1)^2) = sqrt(2)
  // --------------------------------------------------------------------------
  {
    const invSqrt2 = 1 / Math.SQRT2;
    const P1: Point2D = [0, 2];
    const L: Line2D = { point: [0, 0], direction: [invSqrt2, invSqrt2] };
    const P2: Point2D = [1, 1];

    const unconstrained = resolvePointToLineConstraint(P1, L);
    const bound = applySelectionRule(unconstrained, {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const audit = auditResolvedSelection(bound);

    const passed =
      bound.status === 'FINITE_MULTIPLE' &&
      bound.solutions.length === 2 &&
      audit.passed;

    results.push({
      testId: 'TC-AMB-06',
      name: 'Oblique Line Invariant: Non-axis-aligned line verifies frame independence',
      category: 'OBLIQUE',
      passed,
      expectedStatus: 'FINITE_MULTIPLE',
      actualStatus: bound.status,
      expectedCardinality: 'FINITE_MULTIPLE',
      actualCardinality: bound.cardinality,
      solutionCount: bound.solutions.length,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: bound.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-07: Negative Control / Input Validation
  // Invalid coordinates (NaN, degenerate zero direction vector)
  // --------------------------------------------------------------------------
  {
    const P1: Point2D = [NaN, 1];
    const L: Line2D = { point: [0, 0], direction: [0, 0] };

    const res = resolvePointToLineConstraint(P1, L);

    const passed = res.status === 'INVALID_INPUT' && res.cardinality === 'ZERO' && res.axis === null;

    results.push({
      testId: 'TC-AMB-07',
      name: 'Input Validation: Rejection of NaN coordinates and degenerate zero direction vector',
      category: 'NEGATIVE_CONTROL',
      passed,
      expectedStatus: 'INVALID_INPUT',
      actualStatus: res.status,
      expectedCardinality: 'ZERO',
      actualCardinality: res.cardinality,
      solutionCount: 0,
      auditPassed: true,
      auditVerdict: 'EXPECTED_NO_SOLUTION',
      diagnostic: res.diagnostic,
      details: ['Strict numerical rejection confirmed'],
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-08: DEF-AMB-001 Regression — Coincident Pivot on Target Line (P1 = P2 in L)
  // P1 = (0, 0), Line L: y = 0, Pivot P2 = (0, 0)
  // Mathematical reality: Any line through (0, 0) leaves P1 invariant and contains P2.
  // Must return ALREADY_SATISFIED (infinite pencil), NOT UNIQUE.
  // --------------------------------------------------------------------------
  {
    const P1: Point2D = [0, 0];
    const L: Line2D = { point: [0, 0], direction: [1, 0] };
    const P2: Point2D = [0, 0];

    const unconstrained = resolvePointToLineConstraint(P1, L);
    const bound = applySelectionRule(unconstrained, {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const audit = auditResolvedSelection(bound);

    const passed =
      bound.status === 'ALREADY_SATISFIED' &&
      bound.cardinality === 'ALREADY_SATISFIED_INFINITE' &&
      bound.solutions.length === 0 &&
      audit.passed &&
      audit.verdict === 'EXPECTED_ALREADY_SATISFIED';

    results.push({
      testId: 'TC-AMB-08',
      name: 'DEF-AMB-001 Regression: Coincident pivot on line (P1=P2 in L) yields ALREADY_SATISFIED (infinite pencil)',
      category: 'EDGE_CASE',
      passed,
      expectedStatus: 'ALREADY_SATISFIED',
      actualStatus: bound.status,
      expectedCardinality: 'ALREADY_SATISFIED_INFINITE',
      actualCardinality: bound.cardinality,
      solutionCount: bound.solutions.length,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: bound.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-09: Coincident Points Strictly Outside Target Line (P1 = P2 not in L)
  // P1 = (0, 2), Line L: y = 0, Pivot P2 = (0, 2)
  // Any line through P2 leaves P1 outside L; R = 0, h = 2 > 0 -> NO_SOLUTION
  // --------------------------------------------------------------------------
  {
    const P1: Point2D = [0, 2];
    const L: Line2D = { point: [0, 0], direction: [1, 0] };
    const P2: Point2D = [0, 2];

    const unconstrained = resolvePointToLineConstraint(P1, L);
    const bound = applySelectionRule(unconstrained, {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const audit = auditResolvedSelection(bound);

    const passed =
      bound.status === 'NO_SOLUTION' &&
      bound.cardinality === 'ZERO' &&
      bound.solutions.length === 0 &&
      audit.passed &&
      audit.verdict === 'EXPECTED_NO_SOLUTION';

    results.push({
      testId: 'TC-AMB-09',
      name: 'Coincident Pivot Outside Line: P1=P2 not in L yields NO_SOLUTION (0 solutions)',
      category: 'EDGE_CASE',
      passed,
      expectedStatus: 'NO_SOLUTION',
      actualStatus: bound.status,
      expectedCardinality: 'ZERO',
      actualCardinality: bound.cardinality,
      solutionCount: bound.solutions.length,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: bound.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-10: Unnormalized Target Line Direction Vector
  // Direction vector is (3, 4) with length 5 (non-unit).
  // Resolver and verifier must handle arbitrary non-zero directions correctly.
  // --------------------------------------------------------------------------
  {
    const P1: Point2D = [0, 5];
    const L: Line2D = { point: [0, 0], direction: [3, 4] };
    const P2: Point2D = [0, 0];

    const unconstrained = resolvePointToLineConstraint(P1, L);
    const bound = applySelectionRule(unconstrained, {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const audit = auditResolvedSelection(bound);

    const passed =
      bound.status === 'FINITE_MULTIPLE' &&
      bound.cardinality === 'FINITE_MULTIPLE' &&
      bound.solutions.length === 2 &&
      audit.passed &&
      audit.verdict === 'ALL_INVARIANTS_SATISFIED';

    results.push({
      testId: 'TC-AMB-10',
      name: 'Unnormalized Direction Vector: Line with direction (3, 4) handled robustly',
      category: 'EDGE_CASE',
      passed,
      expectedStatus: 'FINITE_MULTIPLE',
      actualStatus: bound.status,
      expectedCardinality: 'FINITE_MULTIPLE',
      actualCardinality: bound.cardinality,
      solutionCount: bound.solutions.length,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: bound.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-11: Incident Point P1 in L with External Pivot P2 not in L (Audit Edge Case C)
  // P1 = (0, 0) in L (y = 0), P2 = (0, 2) not in L.
  // R = 2, h = 2, disc = 0 -> UNIQUE tangent solution along x = 0.
  // --------------------------------------------------------------------------
  {
    const P1: Point2D = [0, 0];
    const L: Line2D = { point: [0, 0], direction: [1, 0] };
    const P2: Point2D = [0, 2];

    const unconstrained = resolvePointToLineConstraint(P1, L);
    const bound = applySelectionRule(unconstrained, {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const audit = auditResolvedSelection(bound);

    const passed =
      bound.status === 'UNIQUE' &&
      bound.cardinality === 'FINITE_UNIQUE' &&
      bound.solutions.length === 1 &&
      audit.passed &&
      audit.verdict === 'ALL_INVARIANTS_SATISFIED';

    results.push({
      testId: 'TC-AMB-11',
      name: 'Incident Point with External Pivot: P1 in L, P2 not in L, h=R yields UNIQUE tangent axis (x = 0)',
      category: 'EDGE_CASE',
      passed,
      expectedStatus: 'UNIQUE',
      actualStatus: bound.status,
      expectedCardinality: 'FINITE_UNIQUE',
      actualCardinality: bound.cardinality,
      solutionCount: bound.solutions.length,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: bound.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-12: Incident Point P1 in L with Distinct Incident Pivot P2 in L (P1 != P2)
  // P1 = (0, 0) in L (y = 0), P2 = (3, 0) in L.
  // R = 3, h = 0, disc = 9 > 0 -> Exactly 2 solutions (line L itself and normal to L at P2).
  // --------------------------------------------------------------------------
  {
    const P1: Point2D = [0, 0];
    const L: Line2D = { point: [0, 0], direction: [1, 0] };
    const P2: Point2D = [3, 0];

    const unconstrained = resolvePointToLineConstraint(P1, L);
    const bound = applySelectionRule(unconstrained, {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const audit = auditResolvedSelection(bound);

    const passed =
      bound.status === 'FINITE_MULTIPLE' &&
      bound.cardinality === 'FINITE_MULTIPLE' &&
      bound.solutions.length === 2 &&
      audit.passed &&
      audit.verdict === 'ALL_INVARIANTS_SATISFIED';

    results.push({
      testId: 'TC-AMB-12',
      name: 'Incident Point with Distinct Incident Pivot: P1, P2 in L, P1 != P2 yields 2 solutions (L and perp)',
      category: 'EDGE_CASE',
      passed,
      expectedStatus: 'FINITE_MULTIPLE',
      actualStatus: bound.status,
      expectedCardinality: 'FINITE_MULTIPLE',
      actualCardinality: bound.cardinality,
      solutionCount: bound.solutions.length,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: bound.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-13: Extreme Numerical Scales (Dynamic Range & Cancellation Resistance)
  // Large coordinates (10^6) tested for floating-point stability.
  // --------------------------------------------------------------------------
  {
    const offset = 1.0e6;
    const P1: Point2D = [offset, offset + 1];
    const L: Line2D = { point: [offset, offset], direction: [1, 0] };
    const P2: Point2D = [offset, offset];

    const unconstrained = resolvePointToLineConstraint(P1, L);
    const bound = applySelectionRule(unconstrained, {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const audit = auditResolvedSelection(bound, { tolerance: 1.0e-7 });

    const passed =
      bound.status === 'FINITE_MULTIPLE' &&
      bound.solutions.length === 2 &&
      audit.passed &&
      audit.verdict === 'ALL_INVARIANTS_SATISFIED';

    results.push({
      testId: 'TC-AMB-13',
      name: 'Extreme Numerical Scale: Large coordinates (10^6) verify numerical cancellation resistance',
      category: 'NUMERICAL_SCALE',
      passed,
      expectedStatus: 'FINITE_MULTIPLE',
      actualStatus: bound.status,
      expectedCardinality: 'FINITE_MULTIPLE',
      actualCardinality: bound.cardinality,
      solutionCount: bound.solutions.length,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: bound.diagnostic,
      details: audit.details,
    });
  }

  // --------------------------------------------------------------------------
  // TC-AMB-14: Opposite Line Direction Representation Equivalence
  // Comparing target line with direction (1/sqrt2, 1/sqrt2) vs (-1/sqrt2, -1/sqrt2).
  // Both represent the exact same geometric line; must yield geometrically identical solutions.
  // --------------------------------------------------------------------------
  {
    const invSqrt2 = 1 / Math.SQRT2;
    const P1: Point2D = [0, 2];
    const P2: Point2D = [1, 1];
    const L_fwd: Line2D = { point: [0, 0], direction: [invSqrt2, invSqrt2] };
    const L_rev: Line2D = { point: [0, 0], direction: [-invSqrt2, -invSqrt2] };

    const boundFwd = applySelectionRule(resolvePointToLineConstraint(P1, L_fwd), {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });
    const boundRev = applySelectionRule(resolvePointToLineConstraint(P1, L_rev), {
      type: 'PASSES_THROUGH_POINT',
      point: P2,
    });

    const auditFwd = auditResolvedSelection(boundFwd);
    const auditRev = auditResolvedSelection(boundRev);

    const fwdTargets = boundFwd.solutions.map((s) => `${s.targetPoint[0].toFixed(4)},${s.targetPoint[1].toFixed(4)}`).sort();
    const revTargets = boundRev.solutions.map((s) => `${s.targetPoint[0].toFixed(4)},${s.targetPoint[1].toFixed(4)}`).sort();
    const targetsMatch = JSON.stringify(fwdTargets) === JSON.stringify(revTargets);

    const passed =
      boundFwd.status === 'FINITE_MULTIPLE' &&
      boundRev.status === 'FINITE_MULTIPLE' &&
      boundFwd.solutions.length === 2 &&
      boundRev.solutions.length === 2 &&
      targetsMatch &&
      auditFwd.passed &&
      auditRev.passed;

    results.push({
      testId: 'TC-AMB-14',
      name: 'Direction Representation Equivalence: Opposite line direction vectors yield identical geometry',
      category: 'EQUIVALENCE',
      passed,
      expectedStatus: 'FINITE_MULTIPLE',
      actualStatus: boundFwd.status,
      expectedCardinality: 'FINITE_MULTIPLE',
      actualCardinality: boundFwd.cardinality,
      solutionCount: boundFwd.solutions.length,
      auditPassed: auditFwd.passed && auditRev.passed,
      auditVerdict: auditFwd.verdict,
      diagnostic: `Forward and reverse directions both produce 2 verified solutions; target set identical: ${targetsMatch}`,
      details: auditFwd.details,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    allPassed: passedCount === results.length,
    results,
  };
}
