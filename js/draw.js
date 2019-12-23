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
