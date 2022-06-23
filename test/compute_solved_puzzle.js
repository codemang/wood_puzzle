import PuzzleSolutionInitializer from '../src/puzzle_state_initializer';
import PuzzleSolver from '../src/puzzle_solver';

const computeSolvedPuzzle = () => {
  const blockToFinalPositionMapping = [1, 5, 2, 3, 4, 0];
  const blockToOrientationMapping = [7, 7, 1, 7, 5, 1];

  const puzzleSolution = PuzzleSolutionInitializer.createInitialPuzzleSolution(
    blockToFinalPositionMapping,
    blockToOrientationMapping,
  );

  PuzzleSolver.unwindPuzzle(puzzleSolution);
  console.log(puzzleSolution); // eslint-disable-line no-console
};

computeSolvedPuzzle();
