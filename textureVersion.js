// Importing OrbitControls (make sure the path matches the version you are using)
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

// Creating the scene
var scene = new THREE.Scene();

// Creating the camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3);

// Creating the renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// add light.
const light = new THREE.PointLight(0xffffff, 1)
light.position.set(0, 5, 10)
scene.add(light)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // white light at 50% intensity
scene.add(ambientLight)

// load different color textures
const textureRock = new THREE.TextureLoader().load('textures/cracked+rock.jpg');
const textureGold = new THREE.TextureLoader().load('textures/intricateGold.png');
const textureUV = new THREE.TextureLoader().load('textures/uv_grid_opengl.jpg');
const displacementMap = new THREE.TextureLoader().load('textures/cracked+rock.jpg');
const bumpTexture = new THREE.TextureLoader().load('textures/earth_bumpmap.jpg');
const earthTexture = new THREE.TextureLoader().load('earth_normalmap_8192x4096.jpg');

textureRock.colorSpace = THREE.SRGBColorSpace;
textureGold.colorSpace = THREE.SRGBColorSpace;
textureUV.colorSpace = THREE.SRGBColorSpace;

const materialRock = new THREE.MeshStandardMaterial({ map: textureRock });
const materialGold = new THREE.MeshStandardMaterial({ map: textureGold });
const materialUV = new THREE.MeshStandardMaterial({ map: textureUV });
const materialDisplacement = new THREE.MeshStandardMaterial({ map: textureRock, displacementMap: displacementMap, displacementScale: 1.0});
const materialBump = new THREE.MeshStandardMaterial({ map: textureUV, bumpMap : bumpTexture, bumpScale : 0.15 });
const plainMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const earthMaterial = new THREE.MeshStandardMaterial({map: earthTexture});

const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); // radius, widthSegments, heightSegments
const sphere = new THREE.Mesh(sphereGeometry, earthMaterial);
sphere.position.set(0,0,0);
scene.add(sphere);



// Adding OrbitControls
var controls = new OrbitControls(camera, renderer.domElement);

// Adjust control settings if needed
controls.minDistance = 1;
controls.maxDistance = 10;
controls.enablePan = true;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    // Rendering the scene
    renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);
animate();