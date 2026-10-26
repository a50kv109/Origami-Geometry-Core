export type SolutionType = 'EMPTY' | 'UNIQUE' | 'DISCRETE_FINITE' | 'CONTINUOUS_FAMILY';

export interface SolutionSet<T> {
  readonly type: SolutionType;
  readonly solutions: readonly T[];
}

export interface GeometricProblem<T> {
  readonly id: string;
  readonly solve: () => SolutionSet<T>;
  readonly verify: (solution: T) => { readonly isValid: boolean; readonly residual: number };
}

export type BranchPolicy = 'PARITY' | 'MINIMAL_DISPLACEMENT' | 'EXPLICIT_INDEX';

export interface BranchSelector<T> {
  readonly policy: BranchPolicy;
  readonly select: (solutions: readonly T[], context?: any) => T | null;
}
