/**
 * PCRS Research Lab — Construction Primitives Test Suite
 * Module: src/construction/pointToPointTest.ts
 *
 * Test cases for Primitive B: FIND_FOLD_AXIS_POINT_TO_POINT (Huzita Axiom 2).
 * Verifies:
 * - Ordinary geometric cases (Horizontal, Vertical, Oblique 45 deg, Arbitrary Oblique with radicals)
 * - Coincident points (multiplicity: 'INFINITE', axis: null)
 * - Near-coincident points below threshold (multiplicity: 'ZERO', status: 'NUMERICAL_INSTABILITY')
 * - Near-coincident points above threshold (multiplicity: 'ONE', successfully verified)
 * - Invalid coordinates (NaN, Infinity)
 * - Negative Controls (Deliberate angular corruption, perturbed anchor displacement)
 */

import { Point2D } from '../core/reflection';
import {
  findFoldAxisPointToPoint,
  PointToPointResult,
  DEFAULT_POINT_TO_POINT_SEPARATION_THRESHOLD,
} from './pointToPoint';
import {
  auditPointToPointResult,
  PointToPointAuditReport,
} from './pointToPointVerifier';

export interface TestCaseRecord {
  id: string;
  category: 'BENCHMARK' | 'BOUNDARY' | 'NEGATIVE_CONTROL' | 'INVALID_INPUT';
  name: string;
  description: string;
  p1: Point2D;
  p2: Point2D;
  expectedStatus: string;
  expectedMultiplicity: string;
  corruptResultBeforeAudit?: (res: PointToPointResult) => PointToPointResult;
  auditExpectedToPass: boolean;
}

export interface TestExecutionResult {
  testId: string;
  category: string;
  name: string;
  passed: boolean;
  resultStatus: string;
  resultMultiplicity: string;
  auditPassed: boolean;
  auditVerdict: string;
  diagnostic: string;
  details: string[];
}

export const POINT_TO_POINT_TEST_CASES: TestCaseRecord[] = [
  // 1. Horizontal Segment -> Vertical Fold Axis
  {
    id: 'P2P-01',
    category: 'BENCHMARK',
    name: 'Horizontal Segment P1(0,0) -> P2(2,0)',
    description: 'Fold axis should be vertical line x = 1 (anchor [1,0], dir [0,1])',
    p1: [0, 0],
    p2: [2, 0],
    expectedStatus: 'UNIQUE_SOLUTION',
    expectedMultiplicity: 'ONE',
    auditExpectedToPass: true,
  },

  // 2. Vertical Segment -> Horizontal Fold Axis
  {
    id: 'P2P-02',
    category: 'BENCHMARK',
    name: 'Vertical Segment P1(0,0) -> P2(0,2)',
    description: 'Fold axis should be horizontal line y = 1 (anchor [0,1], dir [-1,0] or [1,0])',
    p1: [0, 0],
    p2: [0, 2],
    expectedStatus: 'UNIQUE_SOLUTION',
    expectedMultiplicity: 'ONE',
    auditExpectedToPass: true,
  },

  // 3. Diagonal Oblique Segment (45 deg) -> Axis y = x
  {
    id: 'P2P-03',
    category: 'BENCHMARK',
    name: 'Oblique Diagonal Segment P1(1,0) -> P2(0,1)',
    description: 'Fold axis should be line y = x (anchor [0.5, 0.5], dir [-1/sqrt(2), -1/sqrt(2)] or [1/sqrt(2), 1/sqrt(2)])',
    p1: [1, 0],
    p2: [0, 1],
    expectedStatus: 'UNIQUE_SOLUTION',
    expectedMultiplicity: 'ONE',
    auditExpectedToPass: true,
  },

  // 4. Arbitrary Oblique Segment with non-trivial coordinates
  {
    id: 'P2P-04',
    category: 'BENCHMARK',
    name: 'General Oblique P1(-0.8, -0.2) -> P2(1.2, 1.4)',
    description: 'Non-symmetric orientation within calibrated domain L <= 2',
    p1: [-0.8, -0.2],
    p2: [1.2, 1.4],
    expectedStatus: 'UNIQUE_SOLUTION',
    expectedMultiplicity: 'ONE',
    auditExpectedToPass: true,
  },

  // 5. Coincident Points (d = 0) -> Infinite Solutions
  {
    id: 'P2P-05',
    category: 'BOUNDARY',
    name: 'Exact Coincidence P1(1,1) == P2(1,1)',
    description: 'Infinite fold axes exist. Verifies refusal to fabricate an arbitrary axis.',
    p1: [1, 1],
    p2: [1, 1],
    expectedStatus: 'COINCIDENT_POINTS_INFINITE_SOLUTIONS',
    expectedMultiplicity: 'INFINITE',
    auditExpectedToPass: true,
  },

  // 6. Near-Coincident Points Below Threshold (d = 1e-13 < 1e-10) -> Numerical Instability
  {
    id: 'P2P-06',
    category: 'BOUNDARY',
    name: 'Near-Coincidence Below Threshold (d = 1.0e-13)',
    description: 'Rejection with NUMERICAL_INSTABILITY to avoid catastrophic subnormal noise.',
    p1: [1, 1],
    p2: [1 + 1.0e-13, 1],
    expectedStatus: 'NUMERICAL_INSTABILITY',
    expectedMultiplicity: 'ZERO',
    auditExpectedToPass: true,
  },

  // 7. Near-Coincident Points Above Threshold (d = 1.0e-8 > 1e-10) -> Valid Unique Solution
  {
    id: 'P2P-07',
    category: 'BOUNDARY',
    name: 'Near-Coincidence Above Threshold (d = 1.0e-8)',
    description: 'Stable construction and independent verification just above threshold.',
    p1: [1, 1],
    p2: [1 + 1.0e-8, 1],
    expectedStatus: 'UNIQUE_SOLUTION',
    expectedMultiplicity: 'ONE',
    auditExpectedToPass: true,
  },

  // 8. Invalid Coordinates: NaN in P1
  {
    id: 'P2P-08',
    category: 'INVALID_INPUT',
    name: 'Invalid Coordinates: NaN in P1',
    description: 'Rejection of non-finite NaN coordinates with status INVALID_COORDINATE.',
    p1: [NaN, 0],
    p2: [1, 1],
    expectedStatus: 'INVALID_COORDINATE',
    expectedMultiplicity: 'ZERO',
    auditExpectedToPass: true,
  },

  // 9. Invalid Coordinates: Infinity in P2
  {
    id: 'P2P-09',
    category: 'INVALID_INPUT',
    name: 'Invalid Coordinates: Infinity in P2',
    description: 'Rejection of Infinity coordinates with status INVALID_COORDINATE.',
    p1: [0, 0],
    p2: [Infinity, 1],
    expectedStatus: 'INVALID_COORDINATE',
    expectedMultiplicity: 'ZERO',
    auditExpectedToPass: true,
  },

  // 10. Negative Control A: Corrupted Axis Direction (tilted by 10 deg)
  {
    id: 'P2P-10',
    category: 'NEGATIVE_CONTROL',
    name: 'Negative Control: Tilted Axis Direction (+10 deg)',
    description: 'Deliberately inject 10 degree error into axis direction. Verifier must detect and reject.',
    p1: [0, 0],
    p2: [2, 0],
    expectedStatus: 'UNIQUE_SOLUTION',
    expectedMultiplicity: 'ONE',
    corruptResultBeforeAudit: (res: PointToPointResult) => {
      if (!res.axis) return res;
      // Normal direction for (0,0)->(2,0) is [0, 1]. Tilt by ~10 degrees: [sin(10°), cos(10°)]
      const angle = (10 * Math.PI) / 180;
      return {
        ...res,
        axis: {
          point: res.axis.point,
          direction: [Math.sin(angle), Math.cos(angle)],
        },
      };
    },
    auditExpectedToPass: false, // Must FAIL verifier
  },

  // 11. Negative Control B: Shifted Anchor Point (Delta x = 0.2)
  {
    id: 'P2P-11',
    category: 'NEGATIVE_CONTROL',
    name: 'Negative Control: Shifted Anchor Point (Delta x = 0.2)',
    description: 'Deliberately shift anchor point off midpoint. Verifier must detect and reject.',
    p1: [0, 0],
    p2: [2, 0],
    expectedStatus: 'UNIQUE_SOLUTION',
    expectedMultiplicity: 'ONE',
    corruptResultBeforeAudit: (res: PointToPointResult) => {
      if (!res.axis) return res;
      return {
        ...res,
        axis: {
          point: [res.axis.point[0] + 0.2, res.axis.point[1]],
          direction: res.axis.direction,
        },
      };
    },
    auditExpectedToPass: false, // Must FAIL verifier
  },
];

export function runPointToPointSuite(): {
  total: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  results: TestExecutionResult[];
} {
  const results: TestExecutionResult[] = [];

  for (const tc of POINT_TO_POINT_TEST_CASES) {
    let result: PointToPointResult;
    try {
      result = findFoldAxisPointToPoint(tc.p1, tc.p2);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({
        testId: tc.id,
        category: tc.category,
        name: tc.name,
        passed: false,
        resultStatus: 'THREW_EXCEPTION',
        resultMultiplicity: 'ZERO',
        auditPassed: false,
        auditVerdict: 'FAIL_MALFORMED_OUTPUT',
        diagnostic: `Unexpected exception thrown: ${errorMsg}`,
        details: [errorMsg],
      });
      continue;
    }

    // Status and Multiplicity assertion
    const statusMatch = result.status === tc.expectedStatus;
    const multiplicityMatch = result.multiplicity === tc.expectedMultiplicity;

    // Optional result corruption for negative control tests
    const resultToAudit = tc.corruptResultBeforeAudit ? tc.corruptResultBeforeAudit(result) : result;

    // Run independent verifier
    const audit: PointToPointAuditReport = auditPointToPointResult(tc.p1, tc.p2, resultToAudit);

    // For negative controls, the test passes if the audit FAILS (error caught)
    const auditOutcomeMatches = tc.auditExpectedToPass ? audit.passed : !audit.passed;

    const testPassed = statusMatch && multiplicityMatch && auditOutcomeMatches;

    results.push({
      testId: tc.id,
      category: tc.category,
      name: tc.name,
      passed: testPassed,
      resultStatus: result.status,
      resultMultiplicity: result.multiplicity,
      auditPassed: audit.passed,
      auditVerdict: audit.verdict,
      diagnostic: result.diagnostic,
      details: audit.details,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  return {
    total: totalCount,
    passed: passedCount,
    failed: totalCount - passedCount,
    allPassed: passedCount === totalCount,
    results,
  };
}
