correct1 = [
  [0,0,0],
  'x',
]
correct2 = [
  [0,0,2],
  'x',
]
correct5 = [
  [3,-1,-2],
  'z',
]
correct6 = [
  [3,1,-2],
  'z',
]
correct3 = [
  [2,-3, 1],
  'y',
]
correct4 = [
  [4,-3,1],
  'y',
]

correctPositions = [
  correct1,
  correct2,
  correct3,
  correct4,
  correct5,
  correct6,
]

function generateCorrect(correct) {
  var all_vertices = [];
  for (var i =0; i < 8; i++) {
    if (correct[1] === 'x') {
      all_vertices.push([correct[0][0] + i, correct[0][1], correct[0][2]])
      all_vertices.push([correct[0][0] + i, correct[0][1] + 1, correct[0][2]])
      all_vertices.push([correct[0][0] + i, correct[0][1], correct[0][2] + 1])
      all_vertices.push([correct[0][0] + i, correct[0][1] + 1, correct[0][2] + 1])
    } else if(correct[1] == 'y') {
      all_vertices.push([correct[0][0], correct[0][1] + i, correct[0][2]])
      all_vertices.push([correct[0][0]+1, correct[0][1] + i, correct[0][2]])
      all_vertices.push([correct[0][0], correct[0][1] + i, correct[0][2]+1])
      all_vertices.push([correct[0][0]+1, correct[0][1] + i, correct[0][2]+1])
    } else {
      all_vertices.push([correct[0][0], correct[0][1], correct[0][2] + i])
      all_vertices.push([correct[0][0] + 1, correct[0][1], correct[0][2] + i])
      all_vertices.push([correct[0][0], correct[0][1] + 1, correct[0][2] + i])
      all_vertices.push([correct[0][0] + 1, correct[0][1] + 1, correct[0][2] + i])
    }
  }
  return all_vertices
}

var colors = [
  new THREE.Color( 0xff0000 ),
  new THREE.Color( 0x00ff00 ),
]

var colorIndex = 0;

// _.flatten([
//   generateCorrect(correct1),
//   generateCorrect(correct2),
//   generateCorrect(correct3),
//   generateCorrect(correct4),
//   generateCorrect(correct5),
//   generateCorrect(correct6),
// ]).forEach(function(coord) {
//   drawBox(coord, colors[colorIndex]);
//   colorIndex = colorIndex === 0 ? 1 : 0;
// })
