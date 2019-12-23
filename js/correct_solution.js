var final1 = {
  startPoint: [0,0,0],
  direction: 'x',
};
var final2 = {
  startPoint: [0,0,2],
  direction: 'x',
};
var final5 = {
  startPoint: [3,-1,-2],
  direction: 'z',
};
var final6 = {
  startPoint: [3,1,-2],
  direction: 'z',
};
var final3 = {
  startPoint: [2,-3, 1],
  direction: 'y',
};
var final4 = {
  startPoint: [4,-3,1],
  direction: 'y',
};

var finalPositions = [
  final1,
  final2,
  final3,
  final4,
  final5,
  final6,
]

finalPositions.forEach(function(finalPosition) {
  finalPosition.vertices = generateVertices(finalPosition);
});

function generateVertices(final) {
  var all_vertices = [];
  for (var i =0; i < 8; i++) {
    if (final.direction === 'x') {
      all_vertices.push([final.startPoint[0] + i, final.startPoint[1], final.startPoint[2]])
      all_vertices.push([final.startPoint[0] + i, final.startPoint[1] + 1, final.startPoint[2]])
      all_vertices.push([final.startPoint[0] + i, final.startPoint[1], final.startPoint[2] + 1])
      all_vertices.push([final.startPoint[0] + i, final.startPoint[1] + 1, final.startPoint[2] + 1])
    } else if(final.direction == 'y') {
      all_vertices.push([final.startPoint[0], final.startPoint[1] + i, final.startPoint[2]])
      all_vertices.push([final.startPoint[0]+1, final.startPoint[1] + i, final.startPoint[2]])
      all_vertices.push([final.startPoint[0], final.startPoint[1] + i, final.startPoint[2]+1])
      all_vertices.push([final.startPoint[0]+1, final.startPoint[1] + i, final.startPoint[2]+1])
    } else {
      all_vertices.push([final.startPoint[0], final.startPoint[1], final.startPoint[2] + i])
      all_vertices.push([final.startPoint[0] + 1, final.startPoint[1], final.startPoint[2] + i])
      all_vertices.push([final.startPoint[0], final.startPoint[1] + 1, final.startPoint[2] + i])
      all_vertices.push([final.startPoint[0] + 1, final.startPoint[1] + 1, final.startPoint[2] + i])
    }
  }
  return all_vertices
}

var colors = [
  new THREE.Color( 0xff0000 ),
]

var colorIndex = 0;

// _.flatten([
//   // generateVertices(final1),
//   // generateVertices(final2),
//   // generateVertices(final3),
//   // generateVertices(final4),
//   // generateVertices(final5),
//   // generateVertices(final6),
// ]).forEach(function(coord) {
//   drawBox(coord, 0xffa500);
// })
