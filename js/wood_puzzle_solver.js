var occupiedCoordinates = {}

function updateOccupiedCoordinates(localOccupiedCoordinates, modifier) {

}

function compute() {
}


var pieces = [1,2,3,4,5,6]

var finalPositions = {
  0: null,
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
};

function permutateFinalPositions(piecesLeft) {
  if (_.isEmpty(piecesLeft)) {
    return false;
  }

  var solved = false;
  var currentPiece = piecesLeft.shift();

  var positions = _.keys(_.pickBy(finalPositions, function(value, key) {
    return !value;
  }));

  for(var i=0; i < positions.length; i++) {
    finalPositions[positions[i]] = currentPiece;
    var isSolved = permutateFinalPositions(piecesLeft);

    if (isSolved) {
      solved = true;
      break;
    }
    finalPositions[positions[i]] = null;
  }
  pieces.unshift(currentPiece)

  return solved;
}

permutateFinalPositions(pieces);

// for currentCorrectFinalPosition in correctFinalPositions
//   if currentCorrectFinalPosition.direction == 'x'
//     iterate through all 8 permutations
//   else
//   end
// end
