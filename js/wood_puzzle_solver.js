var occupiedCoordinates = {}

function updateOccupiedCoordinates(localOccupiedCoordinates, modifier) {

}

function compute() {
}


var blocks = [0,1,2,3,4,5]

var finalPositionToWoodBlockMatching = {
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
};

var testPositions = {
  0: 1,
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
};

orientations = {
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
}

function calculateFinalPositionCenter(finalPosition) {
  if (finalPosition.direction === 'x') {
    return [finalPosition.startPoint[0] + 3.5, finalPosition.startPoint[1] + 0.5, finalPosition.startPoint[2] + 0.5]
  }
}

  // var finalPositionCenter = calculateFinalPositionCenter(finalPosition);
function moveBlock(block, finalPosition) {
  var blockMinVertex = findMinVertex(block);
  var finalPositionMinVertex = findMinVertex(finalPosition.vertices);
  var offset = _.map([0,1,2], function(index) {
    return finalPositionMinVertex[index] - blockMinVertex[index];
  });
  var translationM = new THREE.Matrix4().makeTranslation(offset[0], offset[1], offset[2]);
  return applyMatrixToBlock(block, translationM);
}

function findMinVertex(block) {
  return _.minBy(block, _.sum);
};

function applyMatrixToBlock(block, matrix) {
  var blockAfterMutation = []
  block.forEach(function(vertex) {
    blockAfterMutation.push(new THREE.Vector3(...vertex).applyMatrix4(matrix).toArray());
  });
  return blockAfterMutation;
}

function moveBlockToFinalPosition(woodBlockIndex, finalPositionIndex, orientation) {
  drawBlock(woodBlocks[woodBlockIndex])
  var newBlock = null;
  var rotation = new THREE.Matrix4();

  // X axis
  if (finalPositions[finalPositionIndex].direction === 'y') {
    var rotation = new THREE.Matrix4().makeRotationZ(Math.PI / 2);
  } else if (finalPositions[finalPositionIndex].direction === 'z') {
    var rotation = new THREE.Matrix4().makeRotationY(Math.PI / 2);
  }

  var rotatedBlock = applyMatrixToBlock(woodBlocks[woodBlockIndex], rotation);
  var movedBlock = moveBlock(rotatedBlock, finalPositions[finalPositionIndex]);
  drawBlock(rotatedBlock, 0x00ff00);
  drawBlock(movedBlock, 0x0000ff);

  // setTimeout(function() {
  //   drawBlock(newBlock)
  // }, 3000);
}

moveBlockToFinalPosition(0,5,1)

function permutateOrientations(positions) {
  positions.forEach(function(blockNumber, finalPositionNumber) {
    [1,2,3,4,5,6,7,8].forEach(function(orientation) {
      orientations[finalPositionNumber] = orientation
      moveBlockToFinalPosition(blockNumber, finalPositionNumber, orientation);
    });
  });
}

function permutateFinalPositions(blocksLeft) {
  if (_.isEmpty(blocksLeft)) {
    permutateOrientations();
    return false;
  }

  var solved = false;
  var currentBlock = blocksLeft.shift();

  var finalPositionsWithNoWoodBlock = _.keys(_.pickBy(finalPositionToWoodBlockMatching, function(value, key) {
    return !value;
  }));

  for(var i=0; i < finalPositionsWithNoWoodBlock.length; i++) {
    finalPositionToWoodBlockMatching[finalPositionsWithNoWoodBlock[i]] = currentBlock;
    var isSolved = permutateFinalPositions(blocksLeft);

    if (isSolved) {
      solved = true;
      break;
    }

    finalPositionToWoodBlockMatching[finalPositionsWithNoWoodBlock[i]] = null;
  }
  blocks.unshift(currentBlock)

  return solved;
}

// permutateFinalPositions(blocks);

// for currentCorrectFinalPosition in correctFinalPositions
//   if currentCorrectFinalPosition.direction == 'x'
//     iterate through all 8 permutations
//   else
//   end
// end
