import { GeometricProblem, SolutionSet } from '../types';
import { 
  CanonicalGeometryState, 
  constructExplicitTetrahedron, 
  computeDerivedMetrics,
  Point3D 
} from '../../core/index';

export interface TetrahedronSolution {
  readonly state: CanonicalGeometryState;
  readonly paritySign: 1 | -1;
  readonly displacementNorm: number; // For MINIMAL_DISPLACEMENT
}

export class TetrahedronProblem implements GeometricProblem<TetrahedronSolution> {
  id = '3D_TETRAHEDRON';
  constructor(private readonly vertices: Record<string, Point3D>) {}

  solve(): SolutionSet<TetrahedronSolution> {
    const res = constructExplicitTetrahedron(this.vertices as any);
    if (!res.success || !res.canonicalState) return { type: 'EMPTY', solutions: [] };

    const metrics = computeDerivedMetrics(res.canonicalState);
    const parity = metrics.global.signedVolume > 0 ? 1 : -1;
    
    // In this domain, DISCRETE_FINITE is a chiral pair (parity 1 and -1)
    return {
      type: 'DISCRETE_FINITE',
      solutions: [
        { state: res.canonicalState, paritySign: parity, displacementNorm: 0.0 },
        { state: res.canonicalState, paritySign: -parity as any, displacementNorm: 1.0 }
      ]
    };
  }

  verify(solution: TetrahedronSolution): { isValid: boolean; residual: number } {
    const metrics = computeDerivedMetrics(solution.state);
    return { 
        isValid: Math.abs(metrics.global.signedVolume) > 1e-7, 
        residual: metrics.global.signedVolume 
    };
  }
}
