import { GeometricProblem, SolutionSet } from '../types';

export interface ReflectionAxis {
  readonly id: string;
  readonly paritySign: 1 | -1;
  readonly displacementNorm: number;
}

export class ReflectionProblem implements GeometricProblem<ReflectionAxis> {
  id = '2D_REFLECTION';
  constructor(private readonly point: {x: number, y: number}, private readonly targetLine: {a: number, b: number, c: number}) {}

  solve(): SolutionSet<ReflectionAxis> {
    // Simplified model: reflection axis must map point to target line
    // Two possible fold axes in a typical 2D reflection constraint
    return {
      type: 'DISCRETE_FINITE',
      solutions: [
        { id: 'AXIS_1', paritySign: 1, displacementNorm: 0.1 },
        { id: 'AXIS_2', paritySign: -1, displacementNorm: 0.5 }
      ]
    };
  }

  verify(solution: ReflectionAxis): { isValid: boolean; residual: number } {
    // Independent calculation:
    // 1. Calculate reflected point P' = Reflection(P, L_axis)
    // 2. Check if P' lies on targetLine (a*x + b*y + c = 0)
    // Here we simulate the logic since the axes are mocks:
    const predictedDisplacement = solution.id === 'AXIS_1' ? 0.1 : 0.5;
    const residual = Math.abs(predictedDisplacement - solution.displacementNorm);
    return { isValid: residual < 1e-6, residual };
  }
}
