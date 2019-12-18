correct_1 = [
  [0,0,0],
  'x',
]
correct_2 = [
  [0,0,2],
  'x',
]
correct_5 = [
  [3,-1,-2],
  'z',
]
correct_6 = [
  [3,1,-2],
  'z',
]
correct_3 = [
  [2,-3, 1],
  'y',
]
correct_4 = [
  [4,-3,1],
  'y',
]

function generate_correct(correct) {
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

function drawBox(position, color) {
  var geometry = new THREE.BoxGeometry(1,1,1);
  var material = new THREE.MeshBasicMaterial({ color: color });
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  cube.position.x = position[0]
  cube.position.y = position[1]
  cube.position.z = position[2]

  var geo = new THREE.EdgesGeometry(geometry);
  var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 4 } );
  var wireframe = new THREE.LineSegments( geo, mat );
  wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
  cube.add( wireframe );

  return cube;
}

var colors = [
  new THREE.Color( 0xff0000 ),
  new THREE.Color( 0x00ff00 ),
]

var colorIndex = 0;

var allPixels = generate_correct(correct_1);
var boxes = []
var index = 0
_.flatten([
  generate_correct(correct_1),
  generate_correct(correct_2),
  generate_correct(correct_3),
  generate_correct(correct_4),
  generate_correct(correct_5),
  generate_correct(correct_6),
]).forEach(function(coord) {
  drawBox(coord, colors[colorIndex]);
  colorIndex = colorIndex === 0 ? 1 : 0;
})


// var intervalId = setInterval(function() {
//   boxes.forEach(function(box) {
//     scene.remove(box);
//   })
//
//   if (index === allPixels.length) {
//     clearInterval(intervalId);
//     return;
//   }
//   for (var i =0; i < 4; i++) {
//     colorIndex = colorIndex === 0 ? 1 : 0;
//     drawBox(allPixels[index], colors[colorIndex]);
//     index += 1;
//   }
// }, 2000)
