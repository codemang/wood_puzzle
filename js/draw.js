var cubes = []

function drawBox(position, hexColor) {
  var geometry = new THREE.BoxGeometry(1,1,1);
  var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(hexColor) });
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  cube.position.x = position[0]
  cube.position.y = position[1]
  cube.position.z = position[2]
  cubes.push(cube);

  var geo = new THREE.EdgesGeometry(geometry);
  var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 4 } );
  var wireframe = new THREE.LineSegments( geo, mat );
  wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
  cube.add( wireframe );

  return cube;
}

function clearCubes() {
  cubes.forEach(function(cube) {
    scene.remove(cube);
  })
}

function drawBlock(block, color = 0xff0000) {
  block.forEach(function(vertex, index) {
    var newColor = color;
    // if (index === 5) {
      // newColor = 0xff0000;
    // }
    drawBox(vertex, newColor);
  });
}


function drawBlocks(blocks, color) {
  _.forEach(blocks, function(block) {
    drawBlock(block, color)
  });
}

var index = 0;
function next() {
  var colors = [
    0xff0000,//red
    0x00ff00,//green
    0x0000ff,//blue
    0xFFA500,//orange
    0x800080,//purple
    0xffff00,//yellow
  ];
  index += 1;
  clearCubes();
  _.forEach(intermediateBlockOrientations[index].blocks, function(block, index) {
    drawBlock(block.origVertices, colors[block.index])
  });
  console.log(`Translation: ${intermediateBlockOrientations[index].translation}, valid: ${intermediateBlockOrientations[index].valid}`)
}

function prev() {
  var colors = [
    0xff0000,//red
    0x00ff00,//green
    0x0000ff,//blue
    0xFFA500,//orange
    0x800080,//purple
    0xffff00,//yellow
  ];
  clearCubes();
  _.forEach(intermediateBlockOrientations[index].blocks, function(block, index) {
    drawBlock(block.origVertices, colors[block.index])
  });
  index -= 1;
}

function drawFinal() {
  index = 75
  var intervalId = setInterval(function() {
    if (index >= 0) {
      prev();
    } else {
      clearInterval(intervalId)
    }
  }, 100)
}
