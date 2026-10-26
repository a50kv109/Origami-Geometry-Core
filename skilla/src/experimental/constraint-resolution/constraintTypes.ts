/**
 * Skilla Experimental Geometry Lab — Constraint Resolution Types
 * Module: src/experimental/constraint-resolution/constraintTypes.ts
 *
 * Research Insight INS-001: Explicit Constraint Resolution and Geometric Solution Multiplicity.
 *
 * Strictly separates:
 * 1. GeometricCondition — the requested constraint (e.g., P -> L)
 * 2. SolutionSet — the raw geometric manifold (continuous family, already satisfied, empty)
 * 3. SelectionRule — the supplementary condition used to select concrete instances
 * 4. ConstructionOperation — constructing a concrete Line2D axis
 * 5. Verification — independent invariant auditing
 */

import { Point2D, Line2D } from '../../core/reflection';

/**
 * Geometric constraint specification
 */
export interface PointToLineCondition {
  type: 'POINT_TO_LINE';
  point: Point2D;
  targetLine: Line2D;
  description?: string;
}

export type GeometricCondition = PointToLineCondition;

/**
 * Multiplicity and cardinality classifications
 */
export type ConstraintCardinality =
  | 'ZERO'
  | 'FINITE_UNIQUE'
  | 'FINITE_MULTIPLE'
  | 'INFINITE_CONTINUOUS_1D'
  | 'ALREADY_SATISFIED_INFINITE';

/**
 * Symbolic / algebraic line equation in standard form: a*x + b*y + c = 0
 */
export interface AlgebraicLineEquation {
  a: number;
  b: number;
  c: number;
}

/**
 * Parametric description of a 1D continuous family of fold axes.
 * For any parameter t within the domain, a concrete fold axis and target point can be evaluated.
 */
export interface ParametricFamily1D {
  parameterSymbol: string;
  defaultDomain: [number, number];
  /**
   * Evaluates the fold axis for a given scalar parameter t
   */
  evaluateAxis: (t: number) => Line2D;
  /**
   * Evaluates the target point Q(t) on the target line L
   */
  evaluateTargetPoint: (t: number) => Point2D;
  /**
   * Returns symbolic / analytical equation coefficients a(t)*x + b(t)*y + c(t) = 0
   */
  evaluateEquation: (t: number) => AlgebraicLineEquation;
}

/**
 * Branch details for degenerate case when point already lies on target line (P in L)
 */
export interface AlreadySatisfiedBranches {
  /**
   * Branch 1: Pencil of lines passing through point P (identity on P)
   * Evaluator maps rotation angle theta to a Line2D with anchor P and direction [cos theta, sin theta]
   */
  pencilThroughPoint: (theta: number) => Line2D;
  /**
   * Branch 2: Lines perpendicular to target line L (reflects P to another point on L)
   * Evaluator maps scalar offset s to a Line2D perpendicular to L at anchor A + s * v
   */
  perpendicularsToLine: (offset: number) => Line2D;
}

/**
 * Result of resolving a geometric constraint BEFORE applying any selection rule.
 * Strictly avoids guessing or collapsing a continuous family into an arbitrary single axis.
 */
export type ConstraintResolution =
  | {
      status: 'CONTINUOUS_FAMILY';
      cardinality: 'INFINITE_CONTINUOUS_1D';
      condition: GeometricCondition;
      family: ParametricFamily1D;
      axis: null;
      diagnostic: string;
    }
  | {
      status: 'ALREADY_SATISFIED';
      cardinality: 'ALREADY_SATISFIED_INFINITE';
      condition: GeometricCondition;
      branches: AlreadySatisfiedBranches;
      axis: null;
      diagnostic: string;
    }
  | {
      status: 'NO_SOLUTION';
      cardinality: 'ZERO';
      condition: GeometricCondition;
      axis: null;
      diagnostic: string;
    }
  | {
      status: 'INVALID_INPUT';
      cardinality: 'ZERO';
      condition?: GeometricCondition;
      axis: null;
      diagnostic: string;
    };

/**
 * Selection rules to bind/reduce the solution space to concrete solutions.
 */
export interface PassesThroughPointRule {
  type: 'PASSES_THROUGH_POINT';
  /**
   * Required fixed point through which the fold axis must pass (Huzita Axiom 5).
   */
  point: Point2D;
}

export type SelectionRule = PassesThroughPointRule;

/**
 * Concrete resolved solution after binding a selection rule.
 */
export interface ConcreteSolution {
  axis: Line2D;
  targetPoint: Point2D;
  parameterValue?: number;
  description: string;
}

/**
 * Result of binding a selection rule to an underlying constraint manifold.
 */
export type ResolvedSelectionResult =
  | {
      status: 'UNIQUE';
      cardinality: 'FINITE_UNIQUE';
      condition: GeometricCondition;
      rule: SelectionRule;
      solutions: [ConcreteSolution];
      diagnostic: string;
    }
  | {
      status: 'FINITE_MULTIPLE';
      cardinality: 'FINITE_MULTIPLE';
      condition: GeometricCondition;
      rule: SelectionRule;
      solutions: ConcreteSolution[];
      diagnostic: string;
    }
  | {
      status: 'NO_SOLUTION';
      cardinality: 'ZERO';
      condition: GeometricCondition;
      rule: SelectionRule;
      solutions: [];
      diagnostic: string;
    }
  | {
      status: 'ALREADY_SATISFIED';
      cardinality: 'ALREADY_SATISFIED_INFINITE';
      condition: GeometricCondition;
      rule: SelectionRule;
      solutions: ConcreteSolution[];
      pencil?: (theta: number) => Line2D;
      diagnostic: string;
    }
  | {
      status: 'INVALID_INPUT';
      cardinality: 'ZERO';
      condition?: GeometricCondition;
      rule?: SelectionRule;
      solutions: [];
      diagnostic: string;
    };
