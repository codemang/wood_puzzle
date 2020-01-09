var blocks = [0,1,2,3,4,5]
var stop = false;
function exit( status ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Brett Zamir (http://brettz9.blogspot.com)
    // +      input by: Paul
    // +   bugfixed by: Hyam Singer (http://www.impact-computing.com/)
    // +   improved by: Philip Peterson
    // +   bugfixed by: Brett Zamir (http://brettz9.blogspot.com)
    // %        note 1: Should be considered expirimental. Please comment on this function.
    // *     example 1: exit();
    // *     returns 1: null

    var i;

    if (typeof status === 'string') {
        alert(status);
    }

    window.addEventListener('error', function (e) {e.preventDefault();e.stopPropagation();}, false);

    var handlers = [
        'copy', 'cut', 'paste',
        'beforeunload', 'blur', 'change', 'click', 'contextmenu', 'dblclick', 'focus', 'keydown', 'keypress', 'keyup', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll',
        'DOMNodeInserted', 'DOMNodeRemoved', 'DOMNodeRemovedFromDocument', 'DOMNodeInsertedIntoDocument', 'DOMAttrModified', 'DOMCharacterDataModified', 'DOMElementNameChanged', 'DOMAttributeNameChanged', 'DOMActivate', 'DOMFocusIn', 'DOMFocusOut', 'online', 'offline', 'textInput',
        'abort', 'close', 'dragdrop', 'load', 'paint', 'reset', 'select', 'submit', 'unload'
    ];

    function stopPropagation (e) {
        e.stopPropagation();
        // e.preventDefault(); // Stop for the form controls, etc., too?
    }
    for (i=0; i < handlers.length; i++) {
        window.addEventListener(handlers[i], function (e) {stopPropagation(e);}, true);
    }

    if (window.stop) {
        window.stop();
    }

    throw '';
}
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

function checkSolution(blockSolutionsTemp) {
  var uniquenessHash = {}
  var noOverlap = true;

  _.forEach(blockSolutionsTemp, function(blockSolution) {
    _.forEach(blockSolution, function(vertex) {
      var name = _.join(_.map(vertex, Math.round), '-');
      if (uniquenessHash[name]) {
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

function permutateOrientations(blocks, callback, orientations = {}, blockToOrientIndex = 0, blockSolutions = []) {
  if (blockToOrientIndex === blocks.length) {
    callback(blockSolutions)
    return;
  }

  var blockName = blocks[blockToOrientIndex];

  [0,1,2,3,4,5,6,7].forEach(function(orientation) {
    orientations[blockName] = orientation;
    var movedBlock = moveBlockToFinalPosition(blocks[blockToOrientIndex], blockToOrientIndex);
    var finalBlock = orientBlock(movedBlock, blockToOrientIndex, orientation);
    blockSolutions.push(finalBlock);
    permutateOrientations(blocks, callback, orientations, blockToOrientIndex + 1, blockSolutions)
    blockSolutions.pop();
  });
}

var unwindSnapshots = [];

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
  // console.log("Unwinding solution")
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

var index = 0;
function prev() {
  clearCubes();
  drawBlocks(intermediateBlockOrientations[index].blocks)
  index -= 1;
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

function next() {
  index += 1;
  clearCubes();
  const colors = [
    0xff0000,//red
    0x00ff00,//green
    0x0000ff,//blue
    0xFFA500,//orange
    0x800080,//purple
    0xffff00,//yellow
  ]
  _.forEach(intermediateBlockOrientations[index].blocks, function(block, index) {
    drawBlock(block, colors[index])
  });
  console.log(`Translation: ${intermediateBlockOrientations[index].translation}, valid: ${intermediateBlockOrientations[index].valid}`)
}
function next1() {
  index += 1;
  clearCubes();
  const colors = [
    0xff0000,//red
    0x00ff00,//green
    0x0000ff,//blue
    0xFFA500,//orange
    0x800080,//purple
    0xffff00,//yellow
  ]

  _.forEach(specialBlocks[index].blocks, function(block, index) {
    drawBlock(block, colors[index])
  });

  console.log(`Translation: ${specialBlocks[index].translation}, valid: ${specialBlocks[index].valid}`)
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

function testThatMoveBlockToOriginWorks() {
  var test = [[[3,3,3], [3,3,4]]]
  drawBlock(test[0]);
  console.log(moveBlocksToOrigin(test))
  drawBlock(moveBlocksToOrigin(test)[0]);
}

function testThatMoveBlockToOriginWorks2() {
  var blah = [ [ [ 0, -10, 0 ], [ 1, -10, 0 ], [ 2, -10, 0 ], [ 3, -10, 0 ], [ 4, -10, 0 ], [ 5, -10, 0 ], [ 6, -10, 0 ], [ 7, -10, 0 ], [ 0, -9, 0 ], [ 1, -9, 0 ], [ 2, -9, 0 ], [ 4, -9, 0 ], [ 5, -9, 0 ], [ 6, -9, 0 ], [ 7, -9, 0 ], [ 0, -10, 1 ], [ 1, -10, 1 ], [ 3, -10, 1 ], [ 6, -10, 1 ], [ 7, -10, 1 ], [ 0, -9, 1 ], [ 1, -9, 1 ], [ 4, -9, 1 ], [ 6, -9, 1 ], [ 7, -9, 1 ] ], [ [ 7, -10, 3 ], [ 6, -10, 3 ], [ 5, -10, 3 ], [ 4, -10, 3 ], [ 3, -10, 3 ], [ 2, -10, 3 ], [ 1, -10, 3 ], [ 0, -10, 3 ], [ 7, -9, 3 ], [ 6, -9, 3 ], [ 5, -9, 3 ], [ 2, -9, 3 ], [ 1, -9, 3 ], [ 0, -9, 3 ], [ 7, -10, 1.9999999999999998 ], [ 6, -10, 1.9999999999999998 ], [ 4, -10, 1.9999999999999998 ], [ 2, -10, 1.9999999999999998 ], [ 1, -10, 1.9999999999999998 ], [ 0, -10, 1.9999999999999998 ], [ 7, -9, 2 ], [ 6, -9, 2 ], [ 1, -9, 2 ], [ 0, -9, 2 ] ], [ [ 3, -13, 1 ], [ 3, -12, 1 ], [ 3.0000000000000004, -7, 1 ], [ 3.0000000000000004, -6, 1 ], [ 2, -13, 1 ], [ 2, -12, 1 ], [ 2, -11, 1 ], [ 2, -10, 1 ], [ 2, -9, 1 ], [ 2.0000000000000004, -8, 1 ], [ 2.0000000000000004, -7, 1 ], [ 2.0000000000000004, -6, 1 ], [ 3, -13, 2 ], [ 3, -12, 2 ], [ 3.0000000000000004, -7, 2 ], [ 3.0000000000000004, -6, 2 ], [ 2, -13, 2 ], [ 2, -12, 2 ], [ 2, -11, 2 ], [ 2, -9, 2 ], [ 2.0000000000000004, -8, 2 ], [ 2.0000000000000004, -7, 2 ], [ 2.0000000000000004, -6, 2 ] ], [ [ 4, -6, 0.9999999999999998 ], [ 4, -7, 0.9999999999999999 ], [ 4, -8, 1 ], [ 4, -11, 1.0000000000000004 ], [ 4, -12, 1.0000000000000004 ], [ 4, -13, 1.0000000000000007 ], [ 5, -6, 0.9999999999999993 ], [ 5, -7, 0.9999999999999994 ], [ 5, -8, 0.9999999999999996 ], [ 5, -11, 1 ], [ 5, -12, 1 ], [ 5, -13, 1.0000000000000002 ], [ 4, -6, 1.9999999999999998 ], [ 4, -7, 2 ], [ 4, -12, 2.0000000000000004 ], [ 4, -13, 2.000000000000001 ], [ 5, -6, 1.9999999999999993 ], [ 5, -7, 1.9999999999999996 ], [ 5, -8, 1.9999999999999996 ], [ 5, -9, 1.9999999999999998 ], [ 5, -10, 2 ], [ 5, -11, 2 ], [ 5, -12, 2 ], [ 5, -13, 2 ] ], [ [ 3.0000000000000004, -11, -2 ], [ 3.0000000000000004, -11, -1 ], [ 3.0000000000000004, -11, 0 ], [ 3, -11, 0.9999999999999999 ], [ 3, -11, 2 ], [ 3, -11, 3 ], [ 3, -11, 4 ], [ 3, -11, 5 ], [ 4.000000000000001, -11, -2 ], [ 4, -11, -1 ], [ 4, -11, 0 ], [ 4, -11, 3 ], [ 4, -11, 4 ], [ 3.9999999999999996, -11, 5 ], [ 3.0000000000000004, -10, -2 ], [ 3, -10, -1 ], [ 2.9999999999999996, -10, 4 ], [ 2.9999999999999996, -10, 5 ], [ 4, -10, -2 ], [ 4, -10, -1 ], [ 3.9999999999999996, -10, 4 ], [ 3.9999999999999996, -10, 5 ] ], [ [ 4, -9, 5 ], [ 4, -9, 4 ], [ 4, -9, 3 ], [ 4, -9, -1 ], [ 4, -9, -2 ], [ 3, -9, 5 ], [ 3, -9, 4 ], [ 3, -9, 3 ], [ 3, -9, 2 ], [ 3, -9, 1 ], [ 3, -9, 0 ], [ 3, -9, -1 ], [ 3, -9, -2 ], [ 4, -8, 5 ], [ 4, -8, 4 ], [ 4, -8, 3 ], [ 4, -8, 2 ], [ 4, -8, 0 ], [ 4, -8, -1 ], [ 4, -8, -2 ], [ 3, -8, 5 ], [ 3, -8, 4 ], [ 3, -8, 3 ], [ 3, -8, 0 ], [ 3, -8, -1 ], [ 3, -8, -2 ] ] ];
  drawBlocks(blah)
  drawBlocks(moveBlocksToOrigin(blah), 0x00fff00)
}

var count = 0;
_.forEach(Combinatorics.permutation(blocks).toArray(), function(blocksPermutation) {
  if (stop) {
    return true;
  }
  count += 1
  // if (count < 27) {
  if (count < 225) {
    return;
  }
  permutateOrientations(blocksPermutation, function(blockSolutions) {
    var solution = checkSolution(blockSolutions, blocksPermutation);
    if (solution && !stop) {
      console.log(count)
      console.log("Checking three")
      var couldUnwindThree = unwindThreeAtATime(_.cloneDeep(blockSolutions))
      console.log("Done checking three")
      if (couldUnwindThree) {
        console.log("Could unwind 3")
        intermediateBlockOrientations = [];
        intermediateBlockSignatures.clear()
        console.log("Checking full")
        var couldUnwindSolution = unwindSolution(blockSolutions, _.cloneDeep(blockSolutions))
        console.log("Done checking full")
        console.log("Outcome")
        console.log(couldUnwindSolution)
        if (couldUnwindSolution) {
          console.log("WOOOOOOOOOO")
          stop = true;
        }
      } else {
        console.log("Coudlnt unwind 3")
      }
      // stop = true;
    }
  });
});
