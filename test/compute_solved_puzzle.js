import PuzzleSolutionInitializer from '../src/puzzle_state_initializer.js';
import PuzzleSolver from '../src/puzzle_solver.js';

const computeSolvedPuzzle = () => {
  var blockToFinalPositionMapping =[1, 5, 2, 3, 4, 0];
  var blockToOrientationMapping = [7, 7, 1, 7, 5, 1];

  const puzzleSolution = PuzzleSolutionInitializer.createInitialPuzzleSolution(
    blockToFinalPositionMapping,
    blockToOrientationMapping
  );

  PuzzleSolver.unwindPuzzle(puzzleSolution);
  console.log(puzzleSolution);
};

computeSolvedPuzzle();
