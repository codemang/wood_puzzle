vertices1 = [
  [0,0,0],
  [1,0,0],
  [2,0,0],
  [3,0,0],
  [4,0,0],
  [5,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [4,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [3,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [4,1,1],
  [6,1,1],
  [7,1,1],
]

vertices2 = [
  [0,0,0],
  [1,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [3,1,0],
  [4,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [2,1,1],
  [4,1,1],
  [5,1,1],
  [6,1,1],
  [7,1,1],
]

vertices3 = [
  [0,0,0],
  [1,0,0],
  [2,0,0],
  [3,0,0],
  [4,0,0],
  [5,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [3,0,1],
  [5,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [6,1,1],
  [7,1,1],
]

vertices4 = [
  [0,0,0],
  [1,0,0],
  [2,0,0],
  [3,0,0],
  [4,0,0],
  [5,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [6,1,1],
  [7,1,1],
]

vertices5 = [
  [0,0,0],
  [1,0,0],
  [2,0,0],
  [5,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [2,1,1],
  [3,1,1],
  [4,1,1],
  [5,1,1],
  [6,1,1],
  [7,1,1],
]

vertices6 = [
  [0,0,0],
  [1,0,0],
  [2,0,0],
  [6,0,0],
  [7,0,0],

  [0,1,0],
  [1,1,0],
  [2,1,0],
  [3,1,0],
  [4,1,0],
  [5,1,0],
  [6,1,0],
  [7,1,0],

  [0,0,1],
  [1,0,1],
  [2,0,1],
  [3,0,1],
  [5,0,1],
  [6,0,1],
  [7,0,1],

  [0,1,1],
  [1,1,1],
  [2,1,1],
  [5,1,1],
  [6,1,1],
  [7,1,1],
]

function generateWoodBlock(vertices, index) {
  return {
    origVertices: vertices,
    index: index,
  };
}

var blocks = _.map([
  vertices1,
  vertices2,
  vertices3,
  vertices4,
  vertices5,
  vertices6,
], generateWoodBlock);

function moveBlock(block, finalPosition) {
  var blockMinVertex = findMinVertex(block);
  var finalPositionMinVertex = findMinVertex(finalPosition.vertices);
  var offset = _.map([0,1,2], function(index) {
    return finalPositionMinVertex[index] - blockMinVertex[index];
  });
  var translationM = new THREE.Matrix4().makeTranslation(...offset);
  return applyMatrixToBlock(block, translationM);
}

function applyMatrixToBlock(block, matrix) {
  var blockAfterMutation = []
  block.forEach(function(vertex) {
    blockAfterMutation.push(new THREE.Vector3(...vertex).applyMatrix4(matrix).toArray());
  });
  return blockAfterMutation;
}

function moveBlockToFinalPosition(blockIndex, finalPositionIndex) {
  var rotation = new THREE.Matrix4();

  if (finalPositions[finalPositionIndex].direction === 'y') {
    var rotation = new THREE.Matrix4().makeRotationZ(Math.PI / 2);
  } else if (finalPositions[finalPositionIndex].direction === 'z') {
    var rotation = new THREE.Matrix4().makeRotationY(Math.PI / 2);
  }

  var rotatedBlock = applyMatrixToBlock(blocks[blockIndex].origVertices, rotation);
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

function findMinVertex(block) {
  return _.minBy(block, _.sum);
};
