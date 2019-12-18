// Base scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setSize( window.innerWidth, window.innerHeight );
scene.background = new THREE.Color( 0xffffff );
document.body.appendChild( renderer.domElement );

// Raycaster
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

// Needed to make gltf file not black
// https://stackoverflow.com/questions/51716689/three-js-gltf-model-is-dark
renderer.gammaOutput = true
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

// Hardcoded so that curb ramp is in view on load
camera.position.z = 400;
camera.up.set(0,1,1);
var controls = new THREE.OrbitControls( camera, renderer.domElement );

var axesHelper = new THREE.AxesHelper( 30 );
scene.add( axesHelper );

let clock = new THREE.Clock();
function animate() {

  requestAnimationFrame( animate );
  controls.update(clock.getDelta());
  renderer.render( scene, camera );
}


animate();
