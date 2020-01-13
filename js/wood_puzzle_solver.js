var stop = false;


function checkSolution(blockSolutionsTemp) {
  var vertexNames = _.map(_.flatten(blockSolutionsTemp), function(vertex) {
    return _.join(_.map(vertex, Math.round), '-');
  });

  return vertexNames.length === _.uniq(vertexNames).length;
}

function allBlockToOrientationMappings(callback) {
  // There are 6 blocks, and each block can be in one of 8 orientations for a given position.
  return Combinatorics.baseN(_.times(8), 6).toArray();

}

var unwindTranslations = {
  "x": new THREE.Matrix4().makeTranslation(1, 0, 0),
  "-x": new THREE.Matrix4().makeTranslation(-1, 0, 0),
  "y": new THREE.Matrix4().makeTranslation(0, 1, 0),
  "-y": new THREE.Matrix4().makeTranslation(0, -1, 0),
  "z": new THREE.Matrix4().makeTranslation(0, 0, 1),
  "-z": new THREE.Matrix4().makeTranslation(0, 0, -1),
};

function moveBlocksToOrigin(blocks) {
  var lowestVertex = null, lowestVertexSum = Infinity;
  _.forEach(blocks, function(block) {
    _.forEach(block, function(vertex) {
      if (_.sum(vertex) < lowestVertexSum) {
        lowestVertexSum = _.sum(vertex);
        lowestVertex = vertex;
      }
    });
  });

  var normalizedBlocks = [];
  _.forEach(blocks, function(block) {
    var newBlock = []
    _.forEach(block, function(vertex) {
      newBlock.push([Math.round(vertex[0] - lowestVertex[0]), Math.round(vertex[1] - lowestVertex[1]), Math.round(vertex[2] - lowestVertex[2])]);
      // newBlock.push([vertex[0] - 5, vertex[1] - 5, vertex[2] - 5]);
    });
    normalizedBlocks.push(newBlock)
  });

  return normalizedBlocks;
}

var intermediateBlockSignatures = new Set();
var intermediateBlockOrientations = []

var specialBlocks = [];
var special = false;
function moveBlocks(blockSolutions, blockIndexes, translation, translationName) {
  var clonedBlocks = _.cloneDeep(blockSolutions) ;
  _.forEach(blockIndexes, function(blockIndex) {
    clonedBlocks[blockIndex] = applyMatrixToBlock(clonedBlocks[blockIndex], translation);
  });

  var isValid = checkSolution(clonedBlocks)
  var normalizedBlocks = moveBlocksToOrigin(clonedBlocks)
  var signature = md5(normalizedBlocks)
  var succeeded = false;

  intermediateBlockOrientations.push({
    blocks: _.clone(clonedBlocks),
    signature: _.clone(signature),
    normalizedBlocks: _.clone(normalizedBlocks),
    translation: translationName,
    valid: true
  });

  if (signature === "43f6a7760e07862cfad379665b6f9acd") {
    special = true
  }

  if (special) {
    specialBlocks.push({
      blocks: _.clone(clonedBlocks),
      signature: _.clone(signature),
      normalizedBlocks: _.clone(normalizedBlocks),
      translation: translationName,
      valid: true
    });
  }

  if (!isValid) {
    _.last(intermediateBlockOrientations).valid = false;
    return false;
  }


  if (intermediateBlockSignatures.has(signature)) {
    _.last(intermediateBlockOrientations).valid = 'no signature';
    return false;
  }

  _.forEach(_.times(clonedBlocks.length), function(blockIndex) {
    var minDistance = minDistanceFromBlock(clonedBlocks, blockIndex);
    if (minDistance > 5) {
      clonedBlocks.splice(blockIndex, 1)
      specialBlocks.push({ blocks: _.clone(clonedBlocks) });
      if (clonedBlocks.length === 1) {
        // stop = true;
        succeeded = true;
        // console.log("Down to 1 block")
      }
      return false;
    }
  })

  intermediateBlockSignatures.add(signature);
  if (!succeeded) {
    var lastMoveSucceeded = unwindSolution(_.clone(clonedBlocks));
    // I'd like to maake this work.
    // if (!lastMoveSucceeded) {
    //   intermediateBlockOrientations.pop();
    // }
    return lastMoveSucceeded;
  }
  return true;
}

var didnt_find_it = 0
function unwindSolution(blockSolutions) {
  // All combinations of blocks that could be moved at a time e.g, just block 1,
  // blocks 1 and 3, etc
  var blockCombs = Combinatorics.power(_.times(blockSolutions.length)).toArray();
  var sortedBlockCombs = _.sortBy(blockCombs, function(comb) { return comb.length });
  sortedBlockCombs.shift(); // First elm is always empty array.
  sortedBlockCombs.pop(); // Last elm is always full set
  sortedBlockCombs = _.reject(sortedBlockCombs, function(comb) { return comb.length === 6 })

  var found = false
  _.forEach(sortedBlockCombs, function(blockIndexes) {
    _.forEach(unwindTranslations, function(translation, translationName) {
      found = moveBlocks(blockSolutions, blockIndexes, translation, translationName)
      // console.log("Why returning: "+found)
      if (found) { return false; }
    });
    if (found) { return false; }
  })
  didnt_find_it += 1
  // console.log(didnt_find_it)
  if (didnt_find_it > 2000) {
    console.log("Exiting")
    exit()
  }
  return found;
}


function mindDistanceFromVertexToBlock(vertex, block) {
  return _.min(_.map(block, function(blockVertex) {
    return new THREE.Vector3(...vertex).distanceTo(new THREE.Vector3(...blockVertex));
  }));
}

function minDistanceFromBlock(blockSolution, targetIndex) {
  var otherIndexes = _.difference(_.times(blockSolution.length), [targetIndex])
  return _.min(_.map(otherIndexes, function(blockIndex) {
    var minDistance1 = mindDistanceFromVertexToBlock(_.first(blockSolution[targetIndex]), blockSolution[blockIndex]);
    var minDistance2 = mindDistanceFromVertexToBlock(_.last(blockSolution[targetIndex]), blockSolution[blockIndex]);
    return _.min([minDistance2, minDistance2]);
  }));
}

var blah = []
function unwindThreeAtATime(blockSolutions) {
  blah = []
  var couldUnwind = true;
  cmb = Combinatorics.combination(blocks, 3).toArray();
  _.forEach(cmb, function(comb) {
    intermediateBlockOrientations = [];
    intermediateBlockSignatures.clear()
    var newBlocks = [
      _.clone(blockSolutions[comb[0]]),
      _.clone(blockSolutions[comb[1]]),
      _.clone(blockSolutions[comb[2]]),
    ]
    if (!unwindSolution(newBlocks)) {
      couldUnwind = false;
    }
    console.log("Did unwind: "+couldUnwind)
    blah.push(_.clone(intermediateBlockOrientations))
  });

  return couldUnwind;
}

function allBlockToFinalPositionMappings() {
  // There are 6 blocks to move. Each block can be in one of 6 final positions.
  // The result of this function is an array of all possible matchings. A
  // matching is an array of 6 integers. The position of each integer indicates
  // the final position, and the integer indicates which block. E.g, if one of the
  // matchings is [3,1,4,5,2,0], that means the fourth block (3 + 1 due to
  // zero indexing) should be placed in the first final position, and the first
  // block should be in the last final position.
  var numBlocks = _.times(blocks.length)
  var knownOffset = 224
  return Combinatorics.permutation(numBlocks).toArray().slice(knownOffset);
}

function moveBlocksToFinalPositionsWithOrientations(blockToFinalPositionMapping, blockToOrientationMapping) {
  var blocks = []

  _.forEach(blockToFinalPositionMapping, function(blockIndex, finalPositionIndex) {
    var movedBlock = moveBlockToFinalPosition(blockIndex, finalPositionIndex);
    var finalBlock = orientBlock(movedBlock, finalPositionIndex, blockToOrientationMapping[blockIndex]);
    blocks.push(finalBlock);
  });

  return blocks;
}

// _.forEach(allBlockToFinalPositionMappings(), function(blockToFinalPositionMapping) {
//   if (stop) { return true; }
//   _.forEach(allBlockToOrientationMappings(), function(blockToOrientationMapping) {
//     if (stop) { return true; }
//     checkSolutionAndUnwind(blockToFinalPositionMapping, blockToOrientationMapping)
//   });
// });

blockToFinalPositionMapping =[1, 5, 2, 3, 4, 0];
blockToOrientationMapping = [7, 7, 1, 7, 2, 1];

function checkSolutionAndUnwind(blockToFinalPositionMapping, blockToOrientationMapping) {
    var blocksInFinalPosition = moveBlocksToFinalPositionsWithOrientations(
      blockToFinalPositionMapping,
      blockToOrientationMapping
    )

    var solution = checkSolution(blocksInFinalPosition)

    if (solution) {
      drawBlocks(blocksInFinalPosition)
      var couldUnwindThree = unwindThreeAtATime(_.cloneDeep(blockSolutions))
      if (couldUnwindThree) {
        intermediateBlockOrientations = [];
        intermediateBlockSignatures.clear()
        stop = unwindSolution(blockSolutions, _.cloneDeep(blockSolutions))
        if (stop) {
          console.log("Stopping")
        }
      }
    }
}

checkSolutionAndUnwind(blockToFinalPositionMapping, blockToOrientationMapping)
console.log("Done")
