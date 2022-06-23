import _ from 'lodash';
import { Permutation, BaseN, PowerSet } from 'js-combinatorics';
import PuzzleSolutionInitializer from './puzzle_state_initializer.js';
import PuzzleSolution from './puzzle_solution.js';

const POSSIBLE_MOVE_DESCRIPTIONS = [
  { direction: 'x', amount: 1 },
  { direction: 'x', amount: -1 },
  { direction: 'y', amount: 1 },
  { direction: 'y', amount: -1 },
  { direction: 'z', amount: 1 },
  { direction: 'z', amount: -1 },
]

const NUM_MOVEMENT_UNITS_TO_REMOVE_BLOCK = 10;

class PuzzleSolver {
  static moveBlockFromDescription(block, moveDescription) {
    if (moveDescription.direction === 'x') {
      block.translateX(moveDescription.amount);
    } else if (moveDescription.direction === 'y') {
      block.translateY(moveDescription.amount);
    } else if (moveDescription.direction === 'z') {
      block.translateZ(moveDescription.amount);
    }
  }

  static allBlocksAssignedToFinalPositionsPermutations() {
    const numBlocks = _.times(6)
    const answer = new Permutation(numBlocks)
    return answer.toArray();
  };

  static allBlockToOrientationMappings() {
    // There are 6 blocks, and each block can be in one of 8 orientations for a
    // given position. If the returned array is [8,5,4,3,2,1,0], That means the
    // block in the first position is in orientation #8, the block in the second
    // position is in orientation #5, etc.
    return new BaseN(_.times(8), 6).toArray();
  }

  static forEachIfCondition(collection, condition, callback) {
    _.forEach(collection, item => {
      if (!condition()) {
        return false; // Exit out of the current forEach loop.
      }

      callback(item);
    });
  }

  static attemptToRemoveBlockFromPuzzle(puzzleSolution) {
    let didRemoveBlock = false;
    const currentPuzzleState = puzzleSolution.currentPuzzleState();

    PuzzleSolver.forEachIfCondition(_.times(currentPuzzleState.blocks.length), () => !didRemoveBlock, blockIndex => {
      PuzzleSolver.forEachIfCondition(POSSIBLE_MOVE_DESCRIPTIONS, () => !didRemoveBlock, moveDescription => {
        const newPuzzleSolution = new PuzzleSolution([currentPuzzleState]);

        const canRemoveBlock = _.every(_.times(NUM_MOVEMENT_UNITS_TO_REMOVE_BLOCK), () => {
          newPuzzleSolution.duplicateCurrentPuzzleState();
          const blockToMove = newPuzzleSolution.currentPuzzleState().blocks[blockIndex]
          PuzzleSolver.moveBlockFromDescription(blockToMove, moveDescription);
          return newPuzzleSolution.currentPuzzleState().hasNoOverlap()
        });

        if (canRemoveBlock) {
          puzzleSolution.append(newPuzzleSolution);
          puzzleSolution.currentPuzzleState().removeBlock(blockIndex);
          didRemoveBlock = true;
        }
      });
    });

    return didRemoveBlock;
  }

  static moveBlocks(puzzleSolution, blockIndexes, moveDescription) {
    puzzleSolution.duplicateCurrentPuzzleState();

    _.forEach(blockIndexes, blockIndex => {
      const blockToMove = puzzleSolution.currentPuzzleState().blocks[blockIndex]
      PuzzleSolver.moveBlockFromDescription(blockToMove, moveDescription);
    });

    // TODO: How do we avoid having to call this explicitly?
    puzzleSolution.currentPuzzleState().computeAndSaveSignature();
  };

  static unwindPuzzle(puzzleSolution) {
    if (puzzleSolution.isFinished()) {
      return;
    }

    const didRemoveBlock = PuzzleSolver.attemptToRemoveBlockFromPuzzle(puzzleSolution);

    if (didRemoveBlock) {
      PuzzleSolver.unwindPuzzle(puzzleSolution);

      if (puzzleSolution.isFinished()) {
        return;
      } else {
        _.forEach(_.times(NUM_MOVEMENT_UNITS_TO_REMOVE_BLOCK), () => puzzleSolution.popLastPuzzleState());
      }
    }

    // All combinations of blocks that could be moved at a time e.g, just block 1,
    // blocks 1 and 3, etc
    const numBlocksRemaining = puzzleSolution.currentPuzzleState().blocks.length;
    const blockCombs = new PowerSet(_.times(numBlocksRemaining)).toArray();
    let sortedBlockCombs = _.sortBy(blockCombs, comb => comb.length);
    sortedBlockCombs = _.reject(sortedBlockCombs, comb => comb.length === numBlocksRemaining || comb.length === 0)

    _.forEach(sortedBlockCombs, function(blockIndexes) {
      _.forEach(POSSIBLE_MOVE_DESCRIPTIONS, moveDescription => {
        if (puzzleSolution.isFinished()) {
          return false; // Exit out of the current forEach loop.
        }

        PuzzleSolver.moveBlocks(puzzleSolution, blockIndexes, moveDescription);

        if (puzzleSolution.currentPuzzleState().hasNoOverlap() && puzzleSolution.hasNoDuplicates()) {
          PuzzleSolver.unwindPuzzle(puzzleSolution);

          if (puzzleSolution.isFinished()) {
            return false; // Exit out of the current forEach loop.
          } else {
            puzzleSolution.popLastPuzzleState();
          }
        } else {
          puzzleSolution.popLastPuzzleState();
        }
      });
    });
  };

  static solve() {
    _.forEach(PuzzleSolver.allBlocksAssignedToFinalPositionsPermutations(), blocksAssignedToFinalPositionPermutation => {
      _.forEach(PuzzleSolver.allBlockToOrientationMappings(), blockToOrientationMapping => {
        const puzzleSolution = PuzzleSolutionInitializer.createInitialPuzzleSolution(
          blocksAssignedToFinalPositionPermutation,
          blockToOrientationMapping
        );

        if (!puzzleSolution.puzzleStates[0].hasNoOverlap()) {
          return;
        }

        PuzzleSolver.unwindPuzzle(puzzleSolution);
      });
    });
  };
}

export default PuzzleSolver;
