import _ from 'lodash';
import initialBlocksVertices from './initial_blocks_vertices';
import Block from './block';
import PuzzleState from './puzzle_state';
import PuzzleSolution from './puzzle_solution';

const final1 = {
  startPoint: [0, 0, 0],
  direction: 'x',
};
const final2 = {
  startPoint: [0, 0, 2],
  direction: 'x',
};
const final5 = {
  startPoint: [3, -1, -2],
  direction: 'z',
};
const final6 = {
  startPoint: [3, 1, -2],
  direction: 'z',
};
const final3 = {
  startPoint: [2, -3, 1],
  direction: 'y',
};
const final4 = {
  startPoint: [4, -3, 1],
  direction: 'y',
};

const finalPositions = [
  final1,
  final2,
  final3,
  final4,
  final5,
  final6,
];

class PuzzleSolutionInitializer {
  static createInitialPuzzleSolution(blockToFinalPositionMapping, blockToOrientationMapping) {
    const woodPuzzleState = new PuzzleState();

    _.forEach(blockToFinalPositionMapping, (blockIndex, finalPositionIndex) => {
      const initialBlockVertices = initialBlocksVertices[blockIndex];
      const block = new Block(initialBlockVertices, blockIndex);
      const finalPosition = finalPositions[finalPositionIndex];

      PuzzleSolutionInitializer.moveBlockToFinalPosition(block, finalPosition);

      PuzzleSolutionInitializer.orientBlock(
        block,
        finalPosition,
        blockToOrientationMapping[blockIndex],
      );

      woodPuzzleState.addBlock(block);
    });

    return new PuzzleSolution([woodPuzzleState]);
  }

  static moveBlock(block, finalPosition) {
    const blockMinVertex = block.minVertex();
    const finalPositionMinVertex = finalPosition.startPoint;

    const translationToFinalPosition = _.map([0, 1, 2], (index) => (
      finalPositionMinVertex[index] - blockMinVertex[index]
    ));

    block.translate(translationToFinalPosition);
  }

  static moveBlockToFinalPosition(block, finalPosition) {
    if (finalPosition.direction === 'y') {
      block.rotateZ(Math.PI / 2);
    } else if (finalPosition.direction === 'z') {
      block.rotateY(Math.PI / 2);
    }

    PuzzleSolutionInitializer.moveBlock(block, finalPosition);
  }

  static orientBlock(block, finalPosition, orientation) {
    const finalPositionCenter = PuzzleSolutionInitializer.calculateFinalPositionCenter(
      finalPosition,
    );

    const translationToOrigin = _.map(finalPositionCenter, (coord) => -coord);

    block.startTransformationChain();
    block.translate(translationToOrigin);

    if (finalPosition.direction === 'x') {
      block.rotateX((Math.PI / 2) * orientation);

      if (orientation > 3) {
        block.rotateZ(Math.PI);
      }
    } else if (finalPosition.direction === 'y') {
      block.rotateY((Math.PI / 2) * orientation);

      if (orientation > 3) {
        block.rotateX(Math.PI);
      }
    } else {
      block.rotateZ((Math.PI / 2) * orientation);

      if (orientation > 3) {
        block.rotateY(Math.PI);
      }
    }

    block.translate(finalPositionCenter);
    block.commitTransformationChain();
  }

  static calculateFinalPositionCenter(finalPosition) {
    if (finalPosition.direction === 'x') {
      return [
        finalPosition.startPoint[0] + 3.5,
        finalPosition.startPoint[1] + 0.5,
        finalPosition.startPoint[2] + 0.5,
      ];
    } if (finalPosition.direction === 'y') {
      return [
        finalPosition.startPoint[0] + 0.5,
        finalPosition.startPoint[1] + 3.5,
        finalPosition.startPoint[2] + 0.5,
      ];
    }

    return [
      finalPosition.startPoint[0] + 0.5,
      finalPosition.startPoint[1] + 0.5,
      finalPosition.startPoint[2] + 3.5,
    ];
  }
}

export default PuzzleSolutionInitializer;
