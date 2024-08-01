// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const nWidth = width / Math.max(width, height) * 10;
const nHeight = height / Math.max(width, height) * 10;
//const camera = new THREE.OrthographicCamera(-nWidth / 2, nWidth / 2, nHeight / 2, -nHeight /2, 0.1, 1000);
scene.add(camera);

camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube
const bodyGeometry = new THREE.BoxGeometry(1,2)
//const geometry  = new THREE.SphereGeometry(1, 32, 16);
//const geometry = new THREE.TorusGeometry(0.8, 0.2, 16, 100)
const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
scene.add(body);

// 2. Create edge geometry and material
const edgeGeometry = new THREE.EdgesGeometry(bodyGeometry);
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Edge color
const bodyEdges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
scene.add(bodyEdges);

// 3. sphere geomtery/material
const sphereGeometry  = new THREE.SphereGeometry(0.5, 32, 16);
const headMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const sphereMesh = new THREE.Mesh(sphereGeometry, headMaterial);
scene.add(sphereMesh);
sphereMesh.position.y = 1

// 4. arms geometry
const armGeometry = new THREE.BoxGeometry(0.4, 2, 0.3);
const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
const armEdgeGeomtery = new THREE.EdgesGeometry(armGeometry);
const leftArmEdges = new THREE.LineSegments(armEdgeGeomtery, edgeMaterial);
const rightArmEdges = new THREE.LineSegments(armEdgeGeomtery, edgeMaterial);
scene.add(leftArm);
scene.add(leftArmEdges);
scene.add(rightArm);
scene.add(rightArmEdges);
leftArm.position.set(-0.71, -0.2);
leftArmEdges.position.set(-0.71, -0.2);
rightArm.position.set(0.71, -0.2);
rightArmEdges.position.set(0.71, -0.2);

// 5. legs geometry
const legsGeometry = new THREE.BoxGeometry(0.4, 2.3, 0.3);
const leftLeg = new THREE.Mesh(legsGeometry, bodyMaterial);
const rightLeg = new THREE.Mesh(legsGeometry, bodyMaterial);
const legEdgeGeometry = new THREE.EdgesGeometry(legsGeometry);
const leftLegEdges = new THREE.LineSegments(legEdgeGeometry, edgeMaterial);
const rightLegEdges = new THREE.LineSegments(legEdgeGeometry, edgeMaterial);
scene.add(rightLeg);
scene.add(rightLegEdges);
scene.add(leftLeg);
scene.add(leftLegEdges);
leftLeg.position.set(-0.25, -0.8);
leftLegEdges.position.set(-0.25, -0.8);
rightLeg.position.set(0.25, -0.8);
rightLegEdges.position.set(0.25, -0.8);

// use groups
const group = new THREE.Group();
const bodyGroup = new THREE.Group();
const armGroup = new THREE.Group();
const legGroup = new THREE.Group();

legGroup.add(leftLeg);
legGroup.add(leftLegEdges);
legGroup.add(rightLeg);
legGroup.add(rightLegEdges);

armGroup.add(leftArm);
armGroup.add(rightArm);
armGroup.add(leftArmEdges);
armGroup.add(rightArmEdges);

bodyGroup.add(body);
bodyGroup.add(bodyEdges);
bodyGroup.add(armGroup);
bodyGroup.add(legGroup);
bodyGroup.position.y += -0.4;

group.add(bodyGroup);
group.add(sphereMesh);
scene.add(group);


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    //group.rotation.x += 0.01;
    group.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();