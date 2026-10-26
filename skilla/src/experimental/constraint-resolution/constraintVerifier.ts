/**
 * Skilla Experimental Geometry Lab — Constraint Verifier
 * Module: src/experimental/constraint-resolution/constraintVerifier.ts
 *
 * Research Insight INS-001: Explicit Constraint Resolution.
 * Autonomous Zero-Trust Verifier for Geometric Constraints.
 *
 * Principle: ConstructionOperation != Verification.
 * The verifier does not trust the generator's internal math. It independently
 * recalculates all metric invariants (reflection, incidence, distance isometry).
 */

import { Point2D, Line2D, reflectPoint, dist2D } from '../../core/reflection';
import {
  GeometricCondition,
  SelectionRule,
  ConcreteSolution,
  ConstraintResolution,
  ResolvedSelectionResult,
} from './constraintTypes';

/**
 * Autonomous zero-trust calculation of Euclidean distance from point P to line L.
 * Independent of resolver modules to prevent shared failure modes.
 */
function metricPointLineDistance(p: Point2D, line: Line2D): number {
  const [dx, dy] = line.direction;
  const len = Math.hypot(dx, dy);
  if (len === 0 || !Number.isFinite(len)) {
    return NaN;
  }
  const nx = -dy / len;
  const ny = dx / len;
  const diffX = p[0] - line.point[0];
  const diffY = p[1] - line.point[1];
  return Math.abs(diffX * nx + diffY * ny);
}

export interface InvariantMetric {
  name: string;
  expected: string;
  actual: number | string;
  tolerance: number;
  passed: boolean;
  diagnostic: string;
}

export type VerifierVerdict =
  | 'ALL_INVARIANTS_SATISFIED'
  | 'EXPECTED_CONTINUOUS_FAMILY'
  | 'EXPECTED_ALREADY_SATISFIED'
  | 'EXPECTED_NO_SOLUTION'
  | 'INVARIANT_FAILURE'
  | 'INPUT_ERROR';

export interface SolutionAudit {
  index: number;
  axis: Line2D;
  targetPoint: Point2D;
  metrics: InvariantMetric[];
  passed: boolean;
  verdict: VerifierVerdict;
}

export interface VerificationReport {
  passed: boolean;
  verdict: VerifierVerdict;
  details: string[];
  solutionAudits: SolutionAudit[];
}

export interface VerifierOptions {
  tolerance?: number;
}

const DEFAULT_VERIFIER_TOL = 1.0e-9;

/**
 * Verifies a single concrete solution against the geometric condition and selection rule.
 */
export function verifyConcreteSolution(
  condition: GeometricCondition,
  solution: ConcreteSolution,
  rule?: SelectionRule,
  options?: VerifierOptions
): SolutionAudit {
  const tol = options?.tolerance ?? DEFAULT_VERIFIER_TOL;
  const metrics: InvariantMetric[] = [];
  const P = condition.point;
  const L = condition.targetLine;
  const m = solution.axis;
  const Q_claim = solution.targetPoint;

  // 1. Metric: Axis Direction Unit Norm
  const dirLen = Math.sqrt(m.direction[0] * m.direction[0] + m.direction[1] * m.direction[1]);
  const normErr = Math.abs(dirLen - 1.0);
  metrics.push({
    name: 'AXIS_DIRECTION_UNIT_NORM',
    expected: '||u|| == 1.0',
    actual: dirLen,
    tolerance: tol,
    passed: normErr < tol,
    diagnostic: `Axis direction length is ${dirLen.toFixed(8)} (deviation: ${normErr.toExponential(4)})`,
  });

  // 2. Metric: Reflection of P across m lands on line L
  const P_prime = reflectPoint(P, m.point, m.direction);
  const distPprimeToL = metricPointLineDistance(P_prime, L);
  metrics.push({
    name: 'REFLECTED_POINT_INCIDENT_TO_TARGET_LINE',
    expected: 'dist(R_m(P), L) == 0.0',
    actual: distPprimeToL,
    tolerance: tol,
    passed: distPprimeToL < tol,
    diagnostic: `Reflected point P'(${P_prime[0].toFixed(6)}, ${P_prime[1].toFixed(6)}) distance to L is ${distPprimeToL.toExponential(4)}`,
  });

  // 3. Metric: Claimed Target Point Consistency
  const distPprimeToQ = dist2D(P_prime, Q_claim);
  metrics.push({
    name: 'TARGET_POINT_COINCIDENCE',
    expected: "||P' - Q|| == 0.0",
    actual: distPprimeToQ,
    tolerance: tol,
    passed: distPprimeToQ < tol,
    diagnostic: `Distance between reflected point P' and claimed target Q is ${distPprimeToQ.toExponential(4)}`,
  });

  // 4. Metric: Midpoint Equidistance / Axis Invariant
  // The anchor m.point must be equidistant from P and P'
  const distPtoAnchor = dist2D(P, m.point);
  const distPprimeToAnchor = dist2D(P_prime, m.point);
  const anchorEquidistErr = Math.abs(distPtoAnchor - distPprimeToAnchor);
  metrics.push({
    name: 'AXIS_ANCHOR_EQUIDISTANCE',
    expected: "||P - anchor|| == ||P' - anchor||",
    actual: anchorEquidistErr,
    tolerance: tol,
    passed: anchorEquidistErr < tol,
    diagnostic: `Axis anchor equidistance difference is ${anchorEquidistErr.toExponential(4)}`,
  });

  // 5. Metric: Selection Rule Compliance (Passes through P2)
  if (rule && rule.type === 'PASSES_THROUGH_POINT') {
    const P2 = rule.point;
    const distP2ToAxis = metricPointLineDistance(P2, m);
    metrics.push({
      name: 'PIVOT_POINT_INCIDENCE',
      expected: 'dist(P2, m) == 0.0',
      actual: distP2ToAxis,
      tolerance: tol,
      passed: distP2ToAxis < tol,
      diagnostic: `Distance from pivot point P2(${P2[0]}, ${P2[1]}) to axis m is ${distP2ToAxis.toExponential(4)}`,
    });
  }

  const allPassed = metrics.every((m) => m.passed);
  return {
    index: 0,
    axis: m,
    targetPoint: Q_claim,
    metrics,
    passed: allPassed,
    verdict: allPassed ? 'ALL_INVARIANTS_SATISFIED' : 'INVARIANT_FAILURE',
  };
}

/**
 * Audits an unconstrained resolution result (TC-AMB-01, TC-AMB-02).
 */
export function auditUnconstrainedResolution(
  resolution: ConstraintResolution,
  options?: VerifierOptions
): VerificationReport {
  const tol = options?.tolerance ?? DEFAULT_VERIFIER_TOL;
  const details: string[] = [];

  if (resolution.status === 'CONTINUOUS_FAMILY') {
    // Audit that family correctly refuses single axis
    const axisRefused = resolution.axis === null;
    details.push(`Axis refusal: ${axisRefused ? 'PASS (axis === null)' : 'FAIL'}`);

    // Audit parameterization witnesses: evaluate t = 0, t = 1, t = -1, t = 2
    const testTValues = [0, 1, -1, 2, -2.5];
    let allWitnessesValid = true;

    for (const t of testTValues) {
      const axis = resolution.family.evaluateAxis(t);
      const target = resolution.family.evaluateTargetPoint(t);
      const audit = verifyConcreteSolution(resolution.condition, { axis, targetPoint: target, description: `t = ${t}` }, undefined, { tolerance: tol });
      if (!audit.passed) {
        allWitnessesValid = false;
        details.push(`Witness t=${t} FAILED invariant verification.`);
      } else {
        details.push(`Witness t=${t} PASS: dist(P', L) < tol.`);
      }
    }

    const passed = axisRefused && allWitnessesValid;
    return {
      passed,
      verdict: passed ? 'EXPECTED_CONTINUOUS_FAMILY' : 'INVARIANT_FAILURE',
      details,
      solutionAudits: [],
    };
  }

  if (resolution.status === 'ALREADY_SATISFIED') {
    const axisRefused = resolution.axis === null;
    details.push(`Axis refusal on degeneracy: ${axisRefused ? 'PASS (axis === null)' : 'FAIL'}`);

    // Test branches
    const p = resolution.condition.point;
    const testThetas = [0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75];
    let branch1Pass = true;
    for (const th of testThetas) {
      const line = resolution.branches.pencilThroughPoint(th);
      const pReflected = reflectPoint(p, line.point, line.direction);
      const err = dist2D(p, pReflected);
      if (err >= tol) {
        branch1Pass = false;
        details.push(`Pencil branch theta=${th} FAILED identity on P.`);
      }
    }
    details.push(`Pencil branch identity invariant: ${branch1Pass ? 'PASS' : 'FAIL'}`);

    const testOffsets = [-5, 0, 3.5];
    let branch2Pass = true;
    for (const s of testOffsets) {
      const line = resolution.branches.perpendicularsToLine(s);
      const pReflected = reflectPoint(p, line.point, line.direction);
      const distToL = metricPointLineDistance(pReflected, resolution.condition.targetLine);
      if (distToL >= tol) {
        branch2Pass = false;
        details.push(`Perpendicular branch offset=${s} FAILED reflection onto L.`);
      }
    }
    details.push(`Perpendicular branch invariance: ${branch2Pass ? 'PASS' : 'FAIL'}`);

    const passed = axisRefused && branch1Pass && branch2Pass;
    return {
      passed,
      verdict: passed ? 'EXPECTED_ALREADY_SATISFIED' : 'INVARIANT_FAILURE',
      details,
      solutionAudits: [],
    };
  }

  return {
    passed: false,
    verdict: 'INPUT_ERROR',
    details: ['Unknown or invalid resolution status'],
    solutionAudits: [],
  };
}

/**
 * Audits a resolved selection result (Axiom 5 binding: TC-AMB-03, TC-AMB-04, TC-AMB-05, etc.).
 */
export function auditResolvedSelection(
  result: ResolvedSelectionResult,
  options?: VerifierOptions
): VerificationReport {
  const tol = options?.tolerance ?? DEFAULT_VERIFIER_TOL;
  const details: string[] = [];

  if (result.status === 'NO_SOLUTION') {
    const passed = result.solutions.length === 0;
    details.push(`Zero solutions confirmation: ${passed ? 'PASS' : 'FAIL'}`);
    return {
      passed,
      verdict: passed ? 'EXPECTED_NO_SOLUTION' : 'INVARIANT_FAILURE',
      details,
      solutionAudits: [],
    };
  }

  if (result.status === 'ALREADY_SATISFIED') {
    if (!result.condition || !result.rule) {
      return {
        passed: false,
        verdict: 'INPUT_ERROR',
        details: ['Missing condition or rule in ALREADY_SATISFIED result'],
        solutionAudits: [],
      };
    }

    const P1 = result.condition.point;
    const P2 = result.rule.type === 'PASSES_THROUGH_POINT' ? result.rule.point : null;
    if (!P2) {
      return {
        passed: false,
        verdict: 'INPUT_ERROR',
        details: ['Expected PASSES_THROUGH_POINT rule for ALREADY_SATISFIED audit'],
        solutionAudits: [],
      };
    }

    const distP1P2 = dist2D(P1, P2);
    const distP1ToL = metricPointLineDistance(P1, result.condition.targetLine);

    // In degenerate Axiom 5 (P1 = P2 in L):
    // 1. P1 must be coincident with P2
    // 2. P1 must be incident to target line L
    const coincidentAndOnLine = distP1P2 < tol && distP1ToL < tol;
    details.push(
      `Coincident pivot on line verification: ${coincidentAndOnLine ? 'PASS' : 'FAIL'} (dist(P1, P2)=${distP1P2.toExponential(4)}, dist(P1, L)=${distP1ToL.toExponential(4)})`
    );

    // Sample arbitrary angles in pencil through P1: every line m through P1 must satisfy:
    // a) dist(P2, m) == 0 (since P2 = P1 in m)
    // b) R_m(P1) in L (since R_m(P1) = P1 in L)
    const testThetas = [0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2, Math.PI * 0.75];
    let allAnglesValid = true;
    for (const theta of testThetas) {
      const axis: Line2D = result.pencil
        ? result.pencil(theta)
        : { point: [P1[0], P1[1]], direction: [Math.cos(theta), Math.sin(theta)] };
      const pReflected = reflectPoint(P1, axis.point, axis.direction);
      const distReflectedToL = metricPointLineDistance(pReflected, result.condition.targetLine);
      const distP2ToAxis = metricPointLineDistance(P2, axis);
      if (distReflectedToL >= tol || distP2ToAxis >= tol) {
        allAnglesValid = false;
        details.push(`Pencil sample theta=${theta.toFixed(4)} FAILED invariant.`);
      }
    }
    details.push(`Pencil invariant preservation across rotation angles: ${allAnglesValid ? 'PASS' : 'FAIL'}`);

    const passed = coincidentAndOnLine && allAnglesValid;
    return {
      passed,
      verdict: passed ? 'EXPECTED_ALREADY_SATISFIED' : 'INVARIANT_FAILURE',
      details,
      solutionAudits: [],
    };
  }

  if (result.status === 'INVALID_INPUT' || !result.condition) {
    return {
      passed: false,
      verdict: 'INPUT_ERROR',
      details: ['Cannot audit result with invalid input or missing condition'],
      solutionAudits: [],
    };
  }

  const condition = result.condition;
  const solutionAudits: SolutionAudit[] = [];
  let allSolutionsPassed = true;

  for (let i = 0; i < result.solutions.length; i++) {
    const sol = result.solutions[i];
    const audit = verifyConcreteSolution(condition, sol, result.rule, { tolerance: tol });
    audit.index = i + 1;
    solutionAudits.push(audit);

    if (!audit.passed) {
      allSolutionsPassed = false;
      details.push(`Solution ${i + 1} FAILED invariant verification.`);
    } else {
      details.push(`Solution ${i + 1} (${sol.description}) VERIFIED.`);
    }
  }

  const passed = allSolutionsPassed && solutionAudits.length > 0;
  return {
    passed,
    verdict: passed ? 'ALL_INVARIANTS_SATISFIED' : 'INVARIANT_FAILURE',
    details,
    solutionAudits,
  };
}
