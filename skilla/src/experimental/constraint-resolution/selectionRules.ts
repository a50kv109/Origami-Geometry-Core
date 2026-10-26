/**
 * Skilla Experimental Geometry Lab — Selection Rules
 * Module: src/experimental/constraint-resolution/selectionRules.ts
 *
 * Research Insight INS-001: Explicit Constraint Resolution.
 * Implements selection rules to bind / reduce continuous solution families to concrete axes.
 *
 * Primary rule: PassesThroughPointRule (Huzita Axiom 5)
 * Given:
 * - Constraint R_m(P1) in L
 * - Selection rule: P2 in m
 * Solves: Intersection of line L with circle centered at P2 with radius R = ||P1 - P2||.
 * Yields:
 * - 0 solutions if dist(P2, L) > R
 * - 1 solution if dist(P2, L) == R (tangency)
 * - 2 solutions if dist(P2, L) < R (secant)
 */

import {
  Point2D,
  Line2D,
  isValidPoint2D,
  normalize2D,
  sub2D,
  add2D,
  scale2D,
  dot2D,
  norm2D,
  dist2D,
} from '../../core/reflection';
import {
  GeometricCondition,
  ConstraintResolution,
  SelectionRule,
  PassesThroughPointRule,
  ResolvedSelectionResult,
  ConcreteSolution,
} from './constraintTypes';

export interface SelectionOptions {
  /**
   * Numerical tolerance for tangency and floating point comparisons.
   * Default: 1.0e-10.
   */
  tolerance?: number;
}

const DEFAULT_TOLERANCE = 1.0e-10;

/**
 * Binds an explicit selection rule to an underlying constraint resolution.
 * Separates the problem into:
 * 1. Constraint Manifold Resolution
 * 2. Selection Rule Application
 */
export function applySelectionRule(
  resolution: ConstraintResolution,
  rule: SelectionRule,
  options?: SelectionOptions
): ResolvedSelectionResult {
  const tol = options?.tolerance ?? DEFAULT_TOLERANCE;

  const condition = resolution.condition;
  if (resolution.status === 'INVALID_INPUT' || !condition) {
    return {
      status: 'INVALID_INPUT',
      cardinality: 'ZERO',
      diagnostic: 'Cannot apply selection rule to invalid constraint resolution.',
      solutions: [],
    };
  }

  if (rule.type === 'PASSES_THROUGH_POINT') {
    return applyPassesThroughPointRule(condition, rule, tol);
  }

  return {
    status: 'INVALID_INPUT',
    cardinality: 'ZERO',
    condition,
    rule,
    solutions: [],
    diagnostic: `Unsupported selection rule type: ${(rule as { type: string }).type}`,
  };
}

/**
 * Implementation of Huzita Axiom 5 as a selection rule on Point-to-Line constraint.
 */
function applyPassesThroughPointRule(
  condition: GeometricCondition,
  rule: PassesThroughPointRule,
  tol: number
): ResolvedSelectionResult {
  const P1 = condition.point;
  const line = condition.targetLine;
  const P2 = rule.point;

  if (!isValidPoint2D(P2)) {
    return {
      status: 'INVALID_INPUT',
      cardinality: 'ZERO',
      condition,
      rule,
      solutions: [],
      diagnostic: 'Invalid selection rule: fixed point coordinates must be finite numbers.',
    };
  }

  if (!line || !isValidPoint2D(line.point) || !isValidPoint2D(line.direction)) {
    return {
      status: 'INVALID_INPUT',
      cardinality: 'ZERO',
      condition,
      rule,
      solutions: [],
      diagnostic: 'Invalid condition: target line coordinates must be finite numbers.',
    };
  }

  const dirNorm = norm2D(line.direction);
  if (dirNorm === 0 || !Number.isFinite(dirNorm)) {
    return {
      status: 'INVALID_INPUT',
      cardinality: 'ZERO',
      condition,
      rule,
      solutions: [],
      diagnostic: 'Invalid condition: target line direction vector must be non-zero and finite.',
    };
  }

  const v = normalize2D(line.direction);
  const A = line.point;

  // Radius of the circle centered at P2
  const R = dist2D(P1, P2);

  // Normal to target line L: [-v_y, v_x]
  const nL: Point2D = [-v[1], v[0]];

  // Signed and absolute distance from P2 to line L
  const diffP2A = sub2D(P2, A);
  const signedDist = dot2D(diffP2A, nL);
  const h = Math.abs(signedDist);

  // -------------------------------------------------------------------------
  // DEF-AMB-001 Handling: Degenerate Coincident Points (P1 == P2, R < tol)
  // -------------------------------------------------------------------------
  if (R < tol) {
    if (h < tol) {
      // Sub-case 1: P1 == P2 on target line L
      // Mathematical reality: Any line m passing through P1 satisfies:
      // 1) P2 in m (since P2 == P1 in m)
      // 2) R_m(P1) = P1 in L (reflection leaves any point on the axis invariant)
      // Thus every line in the 1D projective pencil of lines through P1 is a valid solution.
      return {
        status: 'ALREADY_SATISFIED',
        cardinality: 'ALREADY_SATISFIED_INFINITE',
        condition,
        rule,
        solutions: [],
        pencil: (theta: number): Line2D => ({
          point: [P1[0], P1[1]],
          direction: [Math.cos(theta), Math.sin(theta)],
        }),
        diagnostic: `Degenerate coincident pivot on target line: P1 coincides with P2 on line L (||P1 - P2|| = ${R.toExponential(4)} < tol, dist(P2, L) = ${h.toExponential(4)} < tol). Every line passing through P1 leaves P1 invariant (R_m(P1) = P1 in L) and contains P2. The solution set is the 1D continuous projective pencil of all lines passing through P1.`,
      };
    } else {
      // Sub-case 2: P1 == P2 strictly outside line L
      // Any line m through P2 leaves P1 invariant (R_m(P1) = P1 not in L). No solution exists.
      return {
        status: 'NO_SOLUTION',
        cardinality: 'ZERO',
        condition,
        rule,
        solutions: [],
        diagnostic: `No solution: P1 coincides with P2 strictly outside line L (||P1 - P2|| = ${R.toExponential(4)} < tol, dist(P2, L) = ${h.toFixed(6)} > 0). Any line through P2 leaves P1 invariant outside L; no reflection axis can map P1 onto L while passing through P1.`,
      };
    }
  }

  // Orthogonal projection of P2 onto L: P_proj = P2 - signedDist * nL
  const P_proj: Point2D = sub2D(P2, scale2D(nL, signedDist));

  // Scalar parameter of P_proj along line L from anchor A
  const t_proj = dot2D(sub2D(P_proj, A), v);

  // Discriminant: Delta = R^2 - h^2
  const disc = R * R - h * h;

  // Case A: No intersection (Circle does not reach line L: h > R)
  if (disc < -tol) {
    return {
      status: 'NO_SOLUTION',
      cardinality: 'ZERO',
      condition,
      rule,
      solutions: [],
      diagnostic: `No real solutions exist. Distance from pivot point P2 to target line (h = ${h.toFixed(6)}) strictly exceeds radius R = ||P1 - P2|| = ${R.toFixed(6)} (disc = ${disc.toExponential(4)} < 0). Circle does not intersect target line.`,
    };
  }

  // Helper to build a concrete fold axis for target point Q in L
  function buildFoldAxisForTarget(Q: Point2D, tParam: number, indexLabel: string): ConcreteSolution {
    const dChord = dist2D(P1, Q);

    if (dChord < tol) {
      // P1 == Q (P1 is on L and target is P1 itself)
      // Since R >= tol, P1 != P2; axis is the unique line connecting P1 and P2
      const axisDir = normalize2D(sub2D(P2, P1));
      return {
        axis: { point: P2, direction: axisDir },
        targetPoint: Q,
        parameterValue: tParam,
        description: `Solution ${indexLabel}: Identity fold on P1; axis passes through P1 and P2.`,
      };
    }

    // Standard perpendicular bisector
    const chord = sub2D(Q, P1);
    const nAxis: Point2D = normalize2D(chord);
    const uAxis: Point2D = [-nAxis[1], nAxis[0]];

    // Explicitly anchored at pivot P2 (P2 is equidistant from P1 and Q since ||P1 - P2|| == ||Q - P2|| = R)
    return {
      axis: {
        point: [P2[0], P2[1]],
        direction: uAxis,
      },
      targetPoint: Q,
      parameterValue: tParam,
      description: `Solution ${indexLabel}: Reflection axis reflecting P1 to Q(${Q[0].toFixed(4)}, ${Q[1].toFixed(4)}) and passing through pivot P2(${P2[0]}, ${P2[1]}).`,
    };
  }

  // Case B: Tangency (1 unique solution: h == R)
  if (Math.abs(disc) <= tol) {
    const Q = P_proj;
    const sol = buildFoldAxisForTarget(Q, t_proj, '1 of 1 (tangent)');
    return {
      status: 'UNIQUE',
      cardinality: 'FINITE_UNIQUE',
      condition,
      rule,
      solutions: [sol],
      diagnostic: `Unique tangent solution. Distance from pivot point P2 to target line equals radius R = ${R.toFixed(6)} (disc = ${disc.toExponential(4)}). Single contact point on line.`,
    };
  }

  // Case C: Secant (2 distinct solutions: h < R)
  const offset = Math.sqrt(Math.max(0, disc));
  const t1 = t_proj + offset;
  const t2 = t_proj - offset;

  const Q1 = add2D(P_proj, scale2D(v, offset));
  const Q2 = add2D(P_proj, scale2D(v, -offset));

  const sol1 = buildFoldAxisForTarget(Q1, t1, '1 of 2');
  const sol2 = buildFoldAxisForTarget(Q2, t2, '2 of 2');

  return {
    status: 'FINITE_MULTIPLE',
    cardinality: 'FINITE_MULTIPLE',
    condition,
    rule,
    solutions: [sol1, sol2],
    diagnostic: `Exactly two distinct solutions found (Huzita Axiom 5). Distance h = ${h.toFixed(6)} < R = ${R.toFixed(6)}. Circle intersects line L at two distinct points Q1(${Q1[0].toFixed(4)}, ${Q1[1].toFixed(4)}) and Q2(${Q2[0].toFixed(4)}, ${Q2[1].toFixed(4)}).`,
  };
}
