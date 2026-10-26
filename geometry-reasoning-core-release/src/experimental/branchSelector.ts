import { BranchSelector, BranchPolicy, SolutionType, SolutionSet } from './types';

export class DefaultBranchSelector<T> implements BranchSelector<T> {
  constructor(public readonly policy: BranchPolicy) {}

  select(solutions: readonly T[], context?: any): T | null {
    if (solutions.length === 0) return null;
    if (solutions.length === 1) return solutions[0];

    switch (this.policy) {
      case 'EXPLICIT_INDEX':
        const index = context?.index;
        return typeof index === 'number' && index >= 0 && index < solutions.length 
          ? solutions[index] 
          : null;

      case 'PARITY':
        // context expects { parity: 1 | -1 }
        const parity = context?.parity;
        return solutions.find((s: any) => s.paritySign === parity) || null;

      case 'MINIMAL_DISPLACEMENT':
        // context expects { reference: T }
        // Assumes solutions have displacementNorm
        const validSolutions = solutions.filter((s: any) => typeof s.displacementNorm === 'number');
        if (validSolutions.length === 0) return null;
        return validSolutions.reduce((prev: any, curr: any) => 
          prev.displacementNorm < curr.displacementNorm ? prev : curr
        );
        
      default:
        return null;
    }
  }
}
