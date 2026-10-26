/**
 * PCRS Research Lab — Construction Primitives
 * Module: src/construction/pointToPoint.ts
 *
 * Primitive B: FIND_FOLD_AXIS_POINT_TO_POINT (Huzita Axiom 2)
 *
 * Mathematical Specification:
 * Given two points P1, P2 in R^2, determine the fold axis L = (M, u)
 * such that rigid planar reflection across L maps P1 to P2: R_L(P1) = P2.
 *
 * Formulation:
 * 1. Midpoint (anchor on axis): M = (P1 + P2) / 2
 * 2. Difference vector: Delta = P2 - P1, d = ||Delta||_2
 * 3. Unit normal vector to axis (along chord): n = Delta / d
 * 4. Unit direction vector of axis (+90 deg rotation): u = (-n_y, n_x)^T
 *
 * Domain & Numerical Policies:
 * - Domain: Default calibrated domain max(|x|, |y|) <= 2.
 * - Separation threshold: eps_sep = 1.0e-10.
 *   - d == 0: Exact coincidence. Infinite fold axes exist. Status: COINCIDENT_POINTS_INFINITE_SOLUTIONS.
 *             The system strictly refuses to pick an arbitrary line.
 *   - 0 < d < eps_sep: Numerical instability due to catastrophic cancellation. Status: NUMERICAL_INSTABILITY.
 *   - d >= eps_sep: Unique solution. Status: UNIQUE_SOLUTION.
 * - Invalid coordinates (NaN, Infinity, non-numeric): Status: INVALID_COORDINATE (or exception thrown).
 */

import { Point2D, Line2D, isValidPoint2D } from '../core/reflection';

export type PointToPointMultiplicity = 'ONE' | 'INFINITE' | 'ZERO';

export type PointToPointStatus =
  | 'UNIQUE_SOLUTION'
  | 'COINCIDENT_POINTS_INFINITE_SOLUTIONS'
  | 'NUMERICAL_INSTABILITY'
  | 'INVALID_COORDINATE';

export interface PointToPointOptions {
  /**
   * Separation threshold below which two points are deemed numerically too close
   * to compute a stable normalized direction vector. Default: 1.0e-10.
   */
  separationThreshold?: number;
  /**
   * If true, throws Error on INVALID_COORDINATE instead of returning a status object.
   * Default: false.
   */
  throwOnInvalid?: boolean;
}

export interface PointToPointResult {
  /**
   * The constructed fold axis if a unique solution exists, or null.
   */
  axis: Line2D | null;
  /**
   * Midpoint M = (P1 + P2) / 2 if both points are valid, or null.
   */
  midpoint: Point2D | null;
  /**
   * Euclidean distance between P1 and P2: d = ||P2 - P1||_2.
   */
  distance: number;
  /**
   * Solution multiplicity: 'ONE' (unique line), 'INFINITE' (pencil of lines through P1), or 'ZERO' (rejected).
   */
  multiplicity: PointToPointMultiplicity;
  /**
   * Detailed diagnostic status.
   */
  status: PointToPointStatus;
  /**
   * Human-readable explanation.
   */
  diagnostic: string;
}

export const DEFAULT_POINT_TO_POINT_SEPARATION_THRESHOLD = 1.0e-10;

/**
 * Constructs the fold axis reflecting P1 into P2 (perpendicular bisector of segment P1P2).
 *
 * Implements Huzita Axiom 2 under strict zero-guesswork rules:
 * - Does NOT arbitrarily select an axis when P1 == P2 (returns multiplicity: 'INFINITE').
 * - Flags numerical instability when 0 < d < threshold (returns status: 'NUMERICAL_INSTABILITY').
 */
export function findFoldAxisPointToPoint(
  p1: Point2D,
  p2: Point2D,
  options?: PointToPointOptions
): PointToPointResult {
  const threshold = options?.separationThreshold ?? DEFAULT_POINT_TO_POINT_SEPARATION_THRESHOLD;
  const throwOnInvalid = options?.throwOnInvalid ?? false;

  // 1. Input coordinate finite check
  if (!isValidPoint2D(p1) || !isValidPoint2D(p2)) {
    if (throwOnInvalid) {
      throw new Error(
        `INVALID_COORDINATE: Inputs must be finite numeric 2D points. Received: p1=${JSON.stringify(
          p1
        )}, p2=${JSON.stringify(p2)}`
      );
    }
    return {
      axis: null,
      midpoint: null,
      distance: NaN,
      multiplicity: 'ZERO',
      status: 'INVALID_COORDINATE',
      diagnostic: `Inputs must be finite numeric 2D points. Received p1=${JSON.stringify(p1)}, p2=${JSON.stringify(p2)}`,
    };
  }

  // 2. Compute chord vector and Euclidean distance in Float64
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const dist = Math.sqrt(dx * dx + dy * dy);

  // 3. Exact Mathematical Coincidence check (d === 0)
  if (dist === 0) {
    return {
      axis: null,
      midpoint: [p1[0], p1[1]],
      distance: 0,
      multiplicity: 'INFINITE',
      status: 'COINCIDENT_POINTS_INFINITE_SOLUTIONS',
      diagnostic:
        'P1 and P2 are identical (distance = 0). Every line passing through P1 is a valid symmetry axis leaving P1 fixed. Arbitrary axis selection is strictly prohibited.',
    };
  }

  // 4. Numerical Instability check (0 < d < threshold)
  if (dist < threshold) {
    return {
      axis: null,
      midpoint: [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2],
      distance: dist,
      multiplicity: 'ZERO',
      status: 'NUMERICAL_INSTABILITY',
      diagnostic: `Distance between points (d = ${dist.toExponential(
        4
      )}) is below the calibrated numerical stability threshold (eps_sep = ${threshold.toExponential(
        1
      )}). Normalization would amplify subnormal floating-point cancellation noise.`,
    };
  }

  // 5. Unique Solution Construction: Perpendicular Bisector
  // Midpoint anchor: M = (P1 + P2) / 2
  const midpoint: Point2D = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

  // Unit normal pointing along chord from P1 to P2
  const nx = dx / dist;
  const ny = dy / dist;

  // Axis unit direction vector orthogonal to normal (+90 deg counter-clockwise)
  // u = (-ny, nx)^T such that u · n = -ny*nx + nx*ny = 0
  const ux = -ny;
  const uy = nx;

  const axis: Line2D = {
    point: midpoint,
    direction: [ux, uy],
  };

  return {
    axis,
    midpoint,
    distance: dist,
    multiplicity: 'ONE',
    status: 'UNIQUE_SOLUTION',
    diagnostic: `Perpendicular bisector successfully constructed at anchor [${midpoint[0]}, ${midpoint[1]}] with direction [${ux}, ${uy}].`,
  };
}
