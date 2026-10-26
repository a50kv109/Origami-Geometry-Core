/**
 * Skilla Experimental Geometry Lab — Point to Line Constraint Resolver
 * Module: src/experimental/constraint-resolution/pointToLineResolver.ts
 *
 * Research Insight INS-001: Explicit Constraint Resolution.
 * Solves: Given point P and line L, characterize all reflection axes m such that R_m(P) in L.
 *
 * Core Principle: Constraint != SolutionSet != SelectionRule != ConstructionOperation != Verification.
 * Strictly prevents premature collapse into a single axis when the condition is underconstrained.
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
} from '../../core/reflection';
import {
  ConstraintResolution,
  GeometricCondition,
  ParametricFamily1D,
  AlreadySatisfiedBranches,
  AlgebraicLineEquation,
} from './constraintTypes';

export interface ResolverOptions {
  /**
   * Distance threshold below which point P is considered incident to line L.
   * Default: 1.0e-10.
   */
  incidenceThreshold?: number;
}

const DEFAULT_INCIDENCE_THRESHOLD = 1.0e-10;

/**
 * Calculates Euclidean distance from a point P to an infinite 2D line L.
 */
export function pointLineDistance(p: Point2D, line: Line2D): number {
  if (!isValidPoint2D(p) || !line || !isValidPoint2D(line.point) || !isValidPoint2D(line.direction)) {
    return NaN;
  }
  const dirNorm = norm2D(line.direction);
  if (dirNorm === 0 || !Number.isFinite(dirNorm)) {
    return NaN;
  }
  const dir = normalize2D(line.direction);
  // Unit normal to line: [-dir[1], dir[0]]
  const normal: Point2D = [-dir[1], dir[0]];
  const diff = sub2D(p, line.point);
  return Math.abs(dot2D(diff, normal));
}

/**
 * Resolves the constraint R_m(P) in L without applying any heuristic selection rule.
 * Returns either:
 * - CONTINUOUS_FAMILY: When P not in L (infinitely many valid axes parameterized by t in R)
 * - ALREADY_SATISFIED: When P in L (pencil through P and perpendiculars to L)
 * - INVALID_INPUT: When coordinates or directions are non-finite/degenerate
 */
export function resolvePointToLineConstraint(
  p: Point2D,
  targetLine: Line2D,
  options?: ResolverOptions
): ConstraintResolution {
  // 1. Validation
  if (!isValidPoint2D(p) || !targetLine || !isValidPoint2D(targetLine.point) || !isValidPoint2D(targetLine.direction)) {
    return {
      status: 'INVALID_INPUT',
      cardinality: 'ZERO',
      axis: null,
      diagnostic: 'Invalid input: point coordinates and line parameters must be finite numbers.',
    };
  }

  const dirNorm = norm2D(targetLine.direction);
  if (dirNorm === 0 || !Number.isFinite(dirNorm)) {
    return {
      status: 'INVALID_INPUT',
      cardinality: 'ZERO',
      axis: null,
      diagnostic: 'Invalid input: target line direction vector must be non-zero and finite.',
    };
  }

  const v = normalize2D(targetLine.direction);
  const A = targetLine.point;
  const condition: GeometricCondition = {
    type: 'POINT_TO_LINE',
    point: [p[0], p[1]],
    targetLine: { point: [A[0], A[1]], direction: [v[0], v[1]] },
    description: `Fold axis m such that reflection across m maps P(${p[0]}, ${p[1]}) to line L`,
  };

  const epsIncidence = options?.incidenceThreshold ?? DEFAULT_INCIDENCE_THRESHOLD;
  const dist = pointLineDistance(p, { point: A, direction: v });

  // 2. Degenerate Case: P in L
  if (dist < epsIncidence) {
    const branches: AlreadySatisfiedBranches = {
      pencilThroughPoint: (theta: number): Line2D => {
        return {
          point: [p[0], p[1]],
          direction: [Math.cos(theta), Math.sin(theta)],
        };
      },
      perpendicularsToLine: (offset: number): Line2D => {
        const anchor: Point2D = add2D(A, scale2D(v, offset));
        const perpDir: Point2D = [-v[1], v[0]];
        return {
          point: anchor,
          direction: perpDir,
        };
      },
    };

    return {
      status: 'ALREADY_SATISFIED',
      cardinality: 'ALREADY_SATISFIED_INFINITE',
      condition,
      branches,
      axis: null,
      diagnostic: `Point P(${p[0]}, ${p[1]}) already lies on target line L (distance h = ${dist.toExponential(4)} < eps). Constraint is trivially satisfied; two infinite branches exist (pencil through P and perpendiculars to L). Refusing to select an arbitrary axis.`,
    };
  }

  // 3. Regular Case: P not in L -> Continuous 1D Family
  const family: ParametricFamily1D = {
    parameterSymbol: 't',
    defaultDomain: [-10, 10],

    evaluateTargetPoint: (t: number): Point2D => {
      // Q(t) = A + t * v
      return add2D(A, scale2D(v, t));
    },

    evaluateAxis: (t: number): Line2D => {
      const Q = add2D(A, scale2D(v, t));
      // Midpoint M(t) = (P + Q) / 2
      const midpoint: Point2D = scale2D(add2D(p, Q), 0.5);
      // Chord delta = Q - P
      const delta = sub2D(Q, p);
      const chordLen = norm2D(delta);
      // Unit normal n = delta / chordLen
      const n: Point2D = [delta[0] / chordLen, delta[1] / chordLen];
      // Unit axis direction u = [-n_y, n_x]
      const u: Point2D = [-n[1], n[0]];

      return {
        point: midpoint,
        direction: u,
      };
    },

    evaluateEquation: (t: number): AlgebraicLineEquation => {
      const Q = add2D(A, scale2D(v, t));
      const midpoint = scale2D(add2D(p, Q), 0.5);
      const delta = sub2D(Q, p);
      // delta_x * (x - M_x) + delta_y * (y - M_y) = 0
      // delta_x * x + delta_y * y - (delta_x * M_x + delta_y * M_y) = 0
      const a = delta[0];
      const b = delta[1];
      const c = -(delta[0] * midpoint[0] + delta[1] * midpoint[1]);
      return { a, b, c };
    },
  };

  return {
    status: 'CONTINUOUS_FAMILY',
    cardinality: 'INFINITE_CONTINUOUS_1D',
    condition,
    family,
    axis: null,
    diagnostic: `Point P does not lie on target line L (distance h = ${dist.toFixed(6)}). Unconstrained condition yields a 1D continuous family of fold axes parameterized by t in R. Refusing to select an arbitrary axis without an explicit SelectionRule.`,
  };
}
