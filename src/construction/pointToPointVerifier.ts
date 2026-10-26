/**
 * PCRS Research Lab — Independent Verification for Construction Primitives
 * Module: src/construction/pointToPointVerifier.ts
 *
 * Implements autonomous, zero-trust verification of Primitive B: FIND_FOLD_AXIS_POINT_TO_POINT.
 *
 * Mathematical Contract Verified:
 * 1. Midpoint Line Incidence: Midpoint M = (P1 + P2)/2 must lie on the proposed fold line.
 * 2. Perpendicularity: Axis direction u must be strictly orthogonal to the chord vector (P2 - P1).
 * 3. Anchor Equidistance: Any anchor point A on the line must satisfy ||A - P1|| == ||A - P2||.
 * 4. Reflection Closure P1 -> P2: Reflection of P1 across the axis must land on P2 (||R_L(P1) - P2|| <= eps_coord).
 * 5. Reflection Closure P2 -> P1: Reflection of P2 across the axis must land on P1 (||R_L(P2) - P1|| <= eps_coord).
 * 6. Axis Fixed Point: Axis anchor must remain fixed under reflection (||R_L(A) - A|| <= eps_axis).
 * 7. Axis Unit Normalization: Direction vector must have ||u||_2 == 1.
 *
 * Each check is evaluated independently and reported as a separate metric.
 */

import { Point2D, Line2D, reflectPoint } from '../core/reflection';
import { PointToPointResult, DEFAULT_POINT_TO_POINT_SEPARATION_THRESHOLD } from './pointToPoint';

export interface PointToPointVerifierTolerances {
  coord: number; // default 1.0e-7
  distance: number; // default 1.0e-7
  orthogonal: number; // default 1.0e-9
  axisFixed: number; // default 1.0e-9
}

export const DEFAULT_P2P_VERIFIER_TOLERANCES: PointToPointVerifierTolerances = {
  coord: 1.0e-7,
  distance: 1.0e-7,
  orthogonal: 1.0e-9,
  axisFixed: 1.0e-9,
};

export interface CheckResult {
  passed: boolean;
  metric: number;
  tolerance: number;
  message: string;
}

export interface PointToPointAuditReport {
  passed: boolean;
  verdict: 'PASS' | 'FAIL_INVARIANT_VIOLATION' | 'FAIL_MALFORMED_OUTPUT' | 'EXPECTED_DEGENERACY_CONFIRMED';
  summary: string;
  checks: {
    axisUnitNorm: CheckResult;
    midpointIncidence: CheckResult;
    chordPerpendicularity: CheckResult;
    anchorEquidistance: CheckResult;
    reflectionClosureP1ToP2: CheckResult;
    reflectionClosureP2ToP1: CheckResult;
    axisFixedPoint: CheckResult;
  };
  details: string[];
}

/**
 * Autonomous Euclidean distance implemented inside the verifier (zero-trust).
 */
function vDist(a: Point2D, b: Point2D): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Autonomous dot product.
 */
function vDot(a: Point2D, b: Point2D): number {
  return a[0] * b[0] + a[1] * b[1];
}

/**
 * Verifies a PointToPointResult against the mathematical contract.
 */
export function auditPointToPointResult(
  p1: Point2D,
  p2: Point2D,
  result: PointToPointResult,
  customTolerances?: Partial<PointToPointVerifierTolerances>
): PointToPointAuditReport {
  const tols: PointToPointVerifierTolerances = {
    ...DEFAULT_P2P_VERIFIER_TOLERANCES,
    ...customTolerances,
  };

  const details: string[] = [];

  // Handle Degenerate / Non-Unique Cases First
  if (result.status === 'COINCIDENT_POINTS_INFINITE_SOLUTIONS') {
    const d = vDist(p1, p2);
    const passed = d === 0 && result.axis === null && result.multiplicity === 'INFINITE';
    return {
      passed,
      verdict: passed ? 'EXPECTED_DEGENERACY_CONFIRMED' : 'FAIL_MALFORMED_OUTPUT',
      summary: passed
        ? 'Verified: Exactly coincident points correctly reported as infinite solutions with no arbitrary axis.'
        : 'Failed: Coincidence status reported but points have non-zero distance or axis was wrongly returned.',
      checks: createDummyChecks(passed),
      details: [`Coincidence distance: ${d}`, `Multiplicity: ${result.multiplicity}`, `Axis is null: ${result.axis === null}`],
    };
  }

  if (result.status === 'NUMERICAL_INSTABILITY') {
    const d = vDist(p1, p2);
    const threshold = DEFAULT_POINT_TO_POINT_SEPARATION_THRESHOLD;
    const passed = d > 0 && d < threshold && result.axis === null && result.multiplicity === 'ZERO';
    return {
      passed,
      verdict: passed ? 'EXPECTED_DEGENERACY_CONFIRMED' : 'FAIL_MALFORMED_OUTPUT',
      summary: passed
        ? `Verified: Near-coincident points (d = ${d.toExponential(4)}) safely rejected due to numerical cancellation.`
        : 'Failed: Instability status reported but distance is outside expected near-zero threshold range.',
      checks: createDummyChecks(passed),
      details: [`Measured distance: ${d}`, `Threshold: ${threshold}`, `Axis is null: ${result.axis === null}`],
    };
  }

  if (result.status === 'INVALID_COORDINATE') {
    const p1Valid = Number.isFinite(p1?.[0]) && Number.isFinite(p1?.[1]);
    const p2Valid = Number.isFinite(p2?.[0]) && Number.isFinite(p2?.[1]);
    const passed = (!p1Valid || !p2Valid) && result.axis === null;
    return {
      passed,
      verdict: passed ? 'EXPECTED_DEGENERACY_CONFIRMED' : 'FAIL_MALFORMED_OUTPUT',
      summary: passed
        ? 'Verified: Invalid coordinates correctly rejected.'
        : 'Failed: Invalid status returned for valid finite coordinates.',
      checks: createDummyChecks(passed),
      details: [`p1Valid: ${p1Valid}`, `p2Valid: ${p2Valid}`],
    };
  }

  // Handle Unique Solution Case
  if (!result.axis) {
    return {
      passed: false,
      verdict: 'FAIL_MALFORMED_OUTPUT',
      summary: 'Result status indicates UNIQUE_SOLUTION but axis object is missing (null).',
      checks: createDummyChecks(false),
      details: ['result.axis is null'],
    };
  }

  const axis = result.axis;
  const A = axis.point;
  const u = axis.direction;

  // 1. Check Axis Direction Unit Norm: ||u|| == 1
  const uNorm = Math.sqrt(u[0] * u[0] + u[1] * u[1]);
  const normDiscrepancy = Math.abs(uNorm - 1.0);
  const passUnitNorm = normDiscrepancy <= tols.coord;
  const checkUnitNorm: CheckResult = {
    passed: passUnitNorm,
    metric: normDiscrepancy,
    tolerance: tols.coord,
    message: passUnitNorm
      ? `Unit direction norm verified: ||u|| = ${uNorm.toFixed(9)}`
      : `Axis direction is not normalized: ||u|| = ${uNorm.toFixed(9)} (delta = ${normDiscrepancy.toExponential(4)})`,
  };

  // 2. Check Midpoint Line Incidence: Midpoint M must lie on the line (distance from M to line <= eps_axis)
  const M: Point2D = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  // Distance from M to line (A, u): |(M - A) x u| / ||u|| in 2D is | (Mx - Ax)*uy - (My - Ay)*ux |
  const midLineDist = Math.abs((M[0] - A[0]) * u[1] - (M[1] - A[1]) * u[0]) / (uNorm || 1);
  const passMidpoint = midLineDist <= tols.axisFixed;
  const checkMidpoint: CheckResult = {
    passed: passMidpoint,
    metric: midLineDist,
    tolerance: tols.axisFixed,
    message: passMidpoint
      ? `Midpoint incidence verified: distance of M to axis = ${midLineDist.toExponential(4)}`
      : `Midpoint does not lie on axis: distance = ${midLineDist.toExponential(4)} (tol: ${tols.axisFixed})`,
  };

  // 3. Check Perpendicularity between Axis and Segment Chord:
  // Chord vector: Delta = P2 - P1. Dot product <Delta, u> must be 0.
  const chord: Point2D = [p2[0] - p1[0], p2[1] - p1[1]];
  const chordLen = Math.sqrt(chord[0] * chord[0] + chord[1] * chord[1]);
  const chordDotAxis = Math.abs(vDot(chord, u));
  const normalizedDot = chordLen > 0 ? chordDotAxis / chordLen : 0;
  const passPerp = normalizedDot <= tols.orthogonal;
  const checkPerp: CheckResult = {
    passed: passPerp,
    metric: normalizedDot,
    tolerance: tols.orthogonal,
    message: passPerp
      ? `Perpendicularity verified: |<Delta, u>| / ||Delta|| = ${normalizedDot.toExponential(4)}`
      : `Axis is not perpendicular to chord: normalized dot = ${normalizedDot.toExponential(4)}`,
  };

  // 4. Check Anchor Equidistance: ||A - P1|| == ||A - P2||
  const distAtoP1 = vDist(A, p1);
  const distAtoP2 = vDist(A, p2);
  const distDiff = Math.abs(distAtoP1 - distAtoP2);
  const passEquidist = distDiff <= tols.distance;
  const checkEquidist: CheckResult = {
    passed: passEquidist,
    metric: distDiff,
    tolerance: tols.distance,
    message: passEquidist
      ? `Anchor equidistance verified: ||A - P1|| = ${distAtoP1.toFixed(7)}, ||A - P2|| = ${distAtoP2.toFixed(7)} (diff = ${distDiff.toExponential(4)})`
      : `Anchor point is not equidistant: diff = ${distDiff.toExponential(4)}`,
  };

  // 5. Check Reflection Closure P1 -> P2 using existing frozen reflection kernel
  let reflP1: Point2D;
  let reflP2: Point2D;
  let fixedA: Point2D;
  try {
    reflP1 = reflectPoint(p1, A, u);
    reflP2 = reflectPoint(p2, A, u);
    fixedA = reflectPoint(A, A, u);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      verdict: 'FAIL_INVARIANT_VIOLATION',
      summary: `Kernel reflection raised an error: ${errorMsg}`,
      checks: {
        axisUnitNorm: checkUnitNorm,
        midpointIncidence: checkMidpoint,
        chordPerpendicularity: checkPerp,
        anchorEquidistance: checkEquidist,
        reflectionClosureP1ToP2: { passed: false, metric: Infinity, tolerance: tols.coord, message: errorMsg },
        reflectionClosureP2ToP1: { passed: false, metric: Infinity, tolerance: tols.coord, message: errorMsg },
        axisFixedPoint: { passed: false, metric: Infinity, tolerance: tols.axisFixed, message: errorMsg },
      },
      details: [`Reflection execution failure: ${errorMsg}`],
    };
  }

  const p1Discrepancy = vDist(reflP1, p2);
  const passP1ToP2 = p1Discrepancy <= tols.coord;
  const checkP1ToP2: CheckResult = {
    passed: passP1ToP2,
    metric: p1Discrepancy,
    tolerance: tols.coord,
    message: passP1ToP2
      ? `Reflection closure P1 -> P2 verified: ||R_L(P1) - P2|| = ${p1Discrepancy.toExponential(4)}`
      : `Reflection closure P1 -> P2 violated: discrepancy = ${p1Discrepancy.toExponential(4)}`,
  };

  // 6. Check Reflection Closure P2 -> P1 (involutive symmetry)
  const p2Discrepancy = vDist(reflP2, p1);
  const passP2ToP1 = p2Discrepancy <= tols.coord;
  const checkP2ToP1: CheckResult = {
    passed: passP2ToP1,
    metric: p2Discrepancy,
    tolerance: tols.coord,
    message: passP2ToP1
      ? `Reflection closure P2 -> P1 verified: ||R_L(P2) - P1|| = ${p2Discrepancy.toExponential(4)}`
      : `Reflection closure P2 -> P1 violated: discrepancy = ${p2Discrepancy.toExponential(4)}`,
  };

  // 7. Check Axis Anchor Fixed Point: ||R_L(A) - A|| <= eps_axis
  const axisDisplacement = vDist(fixedA, A);
  const passAxisFixed = axisDisplacement <= tols.axisFixed;
  const checkAxisFixed: CheckResult = {
    passed: passAxisFixed,
    metric: axisDisplacement,
    tolerance: tols.axisFixed,
    message: passAxisFixed
      ? `Axis anchor invariance verified: displacement = ${axisDisplacement.toExponential(4)}`
      : `Axis anchor displaced under reflection: displacement = ${axisDisplacement.toExponential(4)}`,
  };

  const allPassed =
    passUnitNorm &&
    passMidpoint &&
    passPerp &&
    passEquidist &&
    passP1ToP2 &&
    passP2ToP1 &&
    passAxisFixed;

  const checks = {
    axisUnitNorm: checkUnitNorm,
    midpointIncidence: checkMidpoint,
    chordPerpendicularity: checkPerp,
    anchorEquidistance: checkEquidist,
    reflectionClosureP1ToP2: checkP1ToP2,
    reflectionClosureP2ToP1: checkP2ToP1,
    axisFixedPoint: checkAxisFixed,
  };

  details.push(checkUnitNorm.message);
  details.push(checkMidpoint.message);
  details.push(checkPerp.message);
  details.push(checkEquidist.message);
  details.push(checkP1ToP2.message);
  details.push(checkP2ToP1.message);
  details.push(checkAxisFixed.message);

  return {
    passed: allPassed,
    verdict: allPassed ? 'PASS' : 'FAIL_INVARIANT_VIOLATION',
    summary: allPassed
      ? 'All 7 independent geometric invariants verified for Point-to-Point fold axis.'
      : 'One or more geometric invariants violated during verification.',
    checks,
    details,
  };
}

function createDummyChecks(passed: boolean): PointToPointAuditReport['checks'] {
  const dummy: CheckResult = {
    passed,
    metric: 0,
    tolerance: 0,
    message: passed ? 'Not applicable for degenerate case' : 'Check failed',
  };
  return {
    axisUnitNorm: dummy,
    midpointIncidence: dummy,
    chordPerpendicularity: dummy,
    anchorEquidistance: dummy,
    reflectionClosureP1ToP2: dummy,
    reflectionClosureP2ToP1: dummy,
    axisFixedPoint: dummy,
  };
}
