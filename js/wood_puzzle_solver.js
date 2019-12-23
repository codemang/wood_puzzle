var blocks = [0,1,2,3,4,5]

var finalPositionToWoodBlockMatching = {
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
};

var orientations = {
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
}

var blockSolutions = []

function calculateFinalPositionCenter(finalPosition) {
  if (finalPosition.direction === 'x') {
    return [finalPosition.startPoint[0] + 3.5, finalPosition.startPoint[1] + 0.5, finalPosition.startPoint[2] + 0.5]
  } else if (finalPosition.direction === 'y') {
    return [finalPosition.startPoint[0] + 0.5, finalPosition.startPoint[1] + 3.5, finalPosition.startPoint[2] + 0.5]
  } else {
    return [finalPosition.startPoint[0] + 0.5, finalPosition.startPoint[1] + 0.5, finalPosition.startPoint[2] + 3.5]
  }
}

function moveBlock(block, finalPosition) {
  var blockMinVertex = findMinVertex(block);
  var finalPositionMinVertex = findMinVertex(finalPosition.vertices);
  var offset = _.map([0,1,2], function(index) {
    return finalPositionMinVertex[index] - blockMinVertex[index];
  });
  var translationM = new THREE.Matrix4().makeTranslation(...offset);
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

function moveBlockToFinalPosition(woodBlockIndex, finalPositionIndex) {
  var rotation = new THREE.Matrix4();

  if (finalPositions[finalPositionIndex].direction === 'y') {
    var rotation = new THREE.Matrix4().makeRotationZ(Math.PI / 2);
  } else if (finalPositions[finalPositionIndex].direction === 'z') {
    var rotation = new THREE.Matrix4().makeRotationY(Math.PI / 2);
  }

  var rotatedBlock = applyMatrixToBlock(woodBlocks[woodBlockIndex], rotation);
  var movedBlock = moveBlock(rotatedBlock, finalPositions[finalPositionIndex]);
  return movedBlock;
}

function orientBlock(block, finalPositionIndex, orientation) {
  var finalPosition = finalPositions[finalPositionIndex];
  var finalPositionCenter = calculateFinalPositionCenter(finalPosition);

  var negativeCenter = _.map(finalPositionCenter, function(coord) {
    return -coord;
  })

  var translationToCenter = new THREE.Matrix4().makeTranslation(...negativeCenter);
  var translationFromCenter = new THREE.Matrix4().makeTranslation(...finalPositionCenter);

  if (finalPosition.direction === 'x') {
    var rotation1 = new THREE.Matrix4().makeRotationX((Math.PI / 2) * orientation);
    var rotation2 = new THREE.Matrix4()
    if (orientation > 3) {
      rotation2 = rotation2.makeRotationZ(Math.PI);
    }
  } else if (finalPosition.direction === 'y') {
    var rotation1 = new THREE.Matrix4().makeRotationY((Math.PI / 2) * orientation);
    var rotation2 = new THREE.Matrix4()
    if (orientation > 3) {
      rotation2 = rotation2.makeRotationX(Math.PI);
    }
  } else {
    var rotation1 = new THREE.Matrix4().makeRotationZ((Math.PI / 2) * orientation);
    var rotation2 = new THREE.Matrix4()
    if (orientation > 3) {
      rotation2 = rotation2.makeRotationY(Math.PI);
    }
  }

  var finalBlocks = [];
  block.forEach(function(vertex) {
    var result = new THREE.Vector3(...vertex)
      .applyMatrix4(translationToCenter)
      .applyMatrix4(rotation1)
      .applyMatrix4(rotation2)
      .applyMatrix4(translationFromCenter)
      .toArray()

    finalBlocks.push(result)
  });


  return finalBlocks;
}

overlapCount = 0;
function checkSolution() {
  var uniquenessHash = {}
  var noOverlap = true;
  _.forEach(blockSolutions, function(blockSolution) {
    _.forEach(blockSolution, function(vertex) {
      var name = _.join(_.map(vertex, Math.round), '-');
      if (uniquenessHash[name]) {
        overlapCount += 1;
        if (overlapCount % 1000 === 0) {
          // console.log("Overlap");
        }
        noOverlap = false;
        return false;
      } else {
        uniquenessHash[name] = true;
      }
    })

    if (!noOverlap) {
      return false;
    }
  })

  return noOverlap;
}

function undoSolution() {

}

function permutateOrientations(finalPositionNumber = 0) {
  var blockIndex = finalPositionToWoodBlockMatching[finalPositionNumber];

  if (blockIndex === undefined) {
    var solution = checkSolution();
    if (solution) {
      // blockSolutions.forEach(function(block) {
      //   drawBlock(block)
      // });
      console.log("Found");
      return;
      // undoSolution();
      // exit
    } else {
      return;
    }
  }

  [0,1,2,3,4,5,6,7].forEach(function(orientation) {
    orientations[finalPositionNumber] = orientation
    var movedBlock = moveBlockToFinalPosition(blockIndex, finalPositionNumber);
    var finalBlock = orientBlock(movedBlock, finalPositionNumber, orientation);
    blockSolutions.push(finalBlock);
    // drawBlock(finalBlock);
    permutateOrientations(finalPositionNumber + 1)
    blockSolutions.pop();
  });
}

var count = 0;
function permutateFinalPositions(blocksLeft) {
  if (_.isEmpty(blocksLeft)) {
    count += 1
    if (count < 27) {
      return false;
    }
    // console.log("Count: "+count)
    permutateOrientations();
    return false;
  }

  var solved = false;
  var currentBlock = blocksLeft.shift();

  var finalPositionsWithNoWoodBlock = _.keys(_.pickBy(finalPositionToWoodBlockMatching, function(value, key) {
    return value === null;
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

permutateFinalPositions(blocks);

// for currentCorrectFinalPosition in correctFinalPositions
//   if currentCorrectFinalPosition.direction == 'x'
//     iterate through all 8 permutations
//   else
//   end
// end
