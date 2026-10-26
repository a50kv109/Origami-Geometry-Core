import assert from 'assert';
import { DefaultBranchSelector } from '../branchSelector';
import { ReflectionProblem } from '../domains/2d_reflection';
import { TetrahedronProblem } from '../domains/3d_tetrahedron';

async function runExperiment() {
  console.log('--- EXP-GGR-01: Cross-Domain Branch Selection ---');

  // 1. Domain A: 2D Reflection
  const problem2D = new ReflectionProblem({x: 0, y: 0}, {a: 1, b: 0, c: 0});
  const solutions2D = problem2D.solve();
  console.log('2D Solutions found:', solutions2D.solutions.length);
  assert.equal(solutions2D.type, 'DISCRETE_FINITE');
  assert.equal(solutions2D.solutions.length, 2);

  const selector2D = new DefaultBranchSelector('MINIMAL_DISPLACEMENT');
  const choice2D = selector2D.select(solutions2D.solutions);
  console.log('2D Choice:', choice2D?.id);
  assert.ok(choice2D !== null);

  const verification2D = problem2D.verify(choice2D!);
  console.log('2D Verification:', verification2D.isValid);
  assert.ok(verification2D.isValid);

  // 2. Domain B: 3D Tetrahedron
  const vertices = { A: {x:0, y:0, z:1}, B: {x:1, y:0, z:0}, C: {x:0, y:1, z:0}, D: {x:0, y:0, z:0} };
  const problem3D = new TetrahedronProblem(vertices);
  const solutions3D = problem3D.solve();
  console.log('3D Solutions found:', solutions3D.solutions.length);
  assert.equal(solutions3D.type, 'DISCRETE_FINITE');

  const selector3D = new DefaultBranchSelector('PARITY');
  const choice3D = selector3D.select(solutions3D.solutions, { parity: 1 });
  console.log('3D Choice (Parity 1):', choice3D?.paritySign);
  assert.equal(choice3D?.paritySign, 1);

  // 3. Test Failure: Insufficient policy
  const invalidSelector = new DefaultBranchSelector('EXPLICIT_INDEX');
  const invalidChoice = invalidSelector.select(solutions3D.solutions, { index: 99 });
  console.log('Invalid Choice (Index 99):', invalidChoice);
  assert.equal(invalidChoice, null);

  // 4. Test Failure: Intentional wrong solution
  const wrongSolution = { ...solutions2D.solutions[0], displacementNorm: 5.0 };
  const verification2DWrong = problem2D.verify(wrongSolution);
  console.log('2D Verification (Wrong Solution):', verification2DWrong.isValid);
  assert.equal(verification2DWrong.isValid, false);

  console.log('--- All tests passed ---');
}

runExperiment().catch(console.error);
