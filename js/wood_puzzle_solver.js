var isSolutionFound = false;

// Blocks can be moved 1 unit in 6 possible directions.
var unwindTranslations = {
  "x": new THREE.Matrix4().makeTranslation(1, 0, 0),
  "-x": new THREE.Matrix4().makeTranslation(-1, 0, 0),
  "y": new THREE.Matrix4().makeTranslation(0, 1, 0),
  "-y": new THREE.Matrix4().makeTranslation(0, -1, 0),
  "z": new THREE.Matrix4().makeTranslation(0, 0, 1),
  "-z": new THREE.Matrix4().makeTranslation(0, 0, -1),
};

// Tracks the unique signature of blocks seen as they are unwound. More on this
// later.
var intermediateBlockSignatures = new Set();

// Tracks the blocks themselves as they are unwound.
var intermediateBlockOrientations = []

function isThereOverlapAmongstBlocks(blocks) {
  var allVertices = _.flatten(blocks);
  var vertexNames = _.map(allVertices, function(vertex) {
    return _.join(_.map(vertex, Math.round), '-');
  });

  // If there are more total vertices than unique vertices, at least one vertex
  // is repeated, which means there's overlap.
  return vertexNames.length === _.uniq(vertexNames).length;
}

function allBlockToOrientationMappings(callback) {
  // There are 6 blocks, and each block can be in one of 8 orientations for a given position.
  return Combinatorics.baseN(_.times(8), 6).toArray();

}

function findSmallestVertex(blocks) {
  var smallestVertex = null, smallestVertexSum = Infinity;

  _.forEach(blocks, function(block) {
    _.forEach(block, function(vertex) {
      if (_.sum(vertex) < smallestVertexSum) {
        smallestVertexSum = _.sum(vertex);
        smallestVertex = vertex;
      }
    });
  });

  return smallestVertex;
}

function normalizeBlocks(blocks) {
  var smallestVertex = findSmallestVertex(blocks);
  var normalizedBlocks = [];

  _.forEach(blocks, function(block) {
    var newBlock = []
    _.forEach(block, function(vertex) {
      newBlock.push([Math.round(vertex[0] - smallestVertex[0]), Math.round(vertex[1] - smallestVertex[1]), Math.round(vertex[2] - smallestVertex[2])]);
    });
    normalizedBlocks.push(newBlock)
  });

  return normalizedBlocks;
}

function moveBlocks(blockSolutions, blockIndexes, translation, translationName) {
  var clonedBlocks = _.cloneDeep(blockSolutions) ;

  // Apply translation to blocks
  _.forEach(blockIndexes, function(blockIndex) {
    var newVertices = applyMatrixToBlock(clonedBlocks[blockIndex].origVertices, translation);
    clonedBlocks[blockIndex].origVertices = newVertices;
  });

  // Check if there is overlap amongst the blocks
  var isOverlap = isThereOverlapAmongstBlocks(_.map(clonedBlocks, 'origVertices'));

  if (!isOverlap) {
    return false;
  }

  // We want to generate and store a unique signature for the current orientation of
  // blocks. If we have seen this signature before, we can abort this branch of
  // the recursive operation, since we've already tried to solve the puzzle
  // this way. Importantly, we 'normalize' all the blocks (deterministically move
  // them to the origin) before generating the signature. That way, if we've
  // seen the same orientation at a different location, we know we can safely abort
  // this thread.
  var normalizedBlocks = normalizeBlocks(_.map(clonedBlocks, 'origVertices'));
  var signature = md5(normalizedBlocks)

  if (intermediateBlockSignatures.has(signature)) {
    return false;
  }

  // If there is no overlap and we haven't seen this orientation before, then
  // so far so good. Track the current orientations of all blocks and recurse.
  intermediateBlockSignatures.add(signature);
  intermediateBlockOrientations.push({
    blocks: clonedBlocks,
  });

  return unwindSolution(_.clone(clonedBlocks));
}

function unwindSolution(blockSolutions) {
  var removedBlockExplicitly = false;

  _.forEach(_.times(blockSolutions.length), function(blockIndex) {
    tempIntermediateBlockOrientations = checkIfBlockCanBeRemoved(blockSolutions, blockIndex)

    if (tempIntermediateBlockOrientations.length > 0) {
      removedBlockExplicitly = true;

      _.forEach(tempIntermediateBlockOrientations, function(tempIntermediateBlockOrientation) {
        intermediateBlockOrientations.push({
          blocks: tempIntermediateBlockOrientation,
        });
      });

      blockSolutions.splice(blockIndex, 1)
    }

    if (removedBlockExplicitly) {
      return false;
    }
  });

  if (removedBlockExplicitly) {
    unwindSolution(blockSolutions);
    return;
  }

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
      if (found) { return false; }
    });
    if (found) { return false; }
  })

  return found;
}

// For each block, try to move it 10 times in a single direction, for all 6
// possible directions. If it never hits another block in those 10 times, that
// means it has successfully escaped the puzzle.
function checkIfBlockCanBeRemoved(blocks, blockIndexToRemove) {
  var tempIntermediateBlockOrientations = [];

  _.some(_.values(unwindTranslations), function(unwindTranslation) {
    var newBlocks = _.cloneDeep(blocks);

    return _.every(_.times(10), function() {
      var newVertices = applyMatrixToBlock(newBlocks[blockIndexToRemove].origVertices, unwindTranslation);
      newBlocks[blockIndexToRemove].origVertices = newVertices;

      if (isThereOverlapAmongstBlocks(_.map(newBlocks, 'origVertices'))) {
        tempIntermediateBlockOrientations.push(_.cloneDeep(newBlocks));
        return true;
      }

      tempIntermediateBlockOrientations = [];
      return false;
    });
  });

  return tempIntermediateBlockOrientations;
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
    blocks.push(generateWoodBlock(finalBlock, blockIndex));
  });

  return blocks;
}

var blockToFinalPositionMapping =[1, 5, 2, 3, 4, 0];
var blockToOrientationMapping = [7, 7, 1, 7, 5, 1];

function checkSolutionAndUnwind(blockToFinalPositionMapping, blockToOrientationMapping) {
    var blocksInFinalPosition = moveBlocksToFinalPositionsWithOrientations(
      blockToFinalPositionMapping,
      blockToOrientationMapping
    )

    var isNoOverlapBetweenBlocks = isThereOverlapAmongstBlocks(_.map(blocksInFinalPosition, 'origVertices'))

    if (isNoOverlapBetweenBlocks) {
      intermediateBlockOrientations = [];
      intermediateBlockSignatures.clear()

      intermediateBlockOrientations.push({
        blocks: blocksInFinalPosition,
      });
      isSolutionFound = unwindSolution(blocksInFinalPosition)
    }
}

function solve() {
  _.forEach(allBlockToFinalPositionMappings(), function(blockToFinalPositionMapping) {
    if (isSolutionFound) { return true; }
    _.forEach(allBlockToOrientationMappings(), function(blockToOrientationMapping) {
      if (isSolutionFound) { return true; }
      checkSolutionAndUnwind(blockToFinalPositionMapping, blockToOrientationMapping)
    });
  });
}

checkSolutionAndUnwind(blockToFinalPositionMapping, blockToOrientationMapping)
