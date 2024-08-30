import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, material;
let controls;
let pause = true;

function blackBodyColor(value) {
    // Ensure the value is within [0, 1]
    value = Math.min(Math.max(value, 0), 1);

    // Define color stops
    const colors = [
        { pos: 0, color: { r: 0, g: 0, b: 0 } },      // Black
        { pos: 0.2, color: { r: 0.545, g: 0, b: 0 } },  // Dark Red
        { pos: 0.4, color: { r: 1, g: 0.27, b: 0 } }, // OrangeRed
        { pos: 0.6, color: { r: 1, g: 1, b: 0 } },// Yellow
        { pos: 0.8, color: { r: 1, g: 1, b: 1 } }, // White
        { pos: 1.0, color: { r: 0, g: 0, b: 1 } }   // Blue
    ];

    // Find the two nearest color stops
    let start = colors[0], end = colors[colors.length - 1];
    for (let i = 0; i < colors.length - 1; i++) {
        if (value >= colors[i].pos && value <= colors[i + 1].pos) {
            start = colors[i];
            end = colors[i + 1];
            break;
        }
    }
    // Interpolate between the start and end colors
    const mix = (value - start.pos) / (end.pos - start.pos);
    const r = start.color.r + (end.color.r - start.color.r) * mix;
    const g = start.color.g + (end.color.g - start.color.g) * mix;
    const b = start.color.b + (end.color.b - start.color.b) * mix;
    return [r, g, b];
}

class particleSystem {
	// [-0.5, 0.5]^3
	getRandomVec() {
		return [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
	}
	getFixedPosition() {
		return [0,0,0];
	}
	getRandomColor() {
		return [Math.random(), Math.random(), Math.random()];
	}
	getWhiteColor() {
		return [1, 1, 1]; // r, g, b
	}

	constructor(nParticles) {
		this.m_nParticles = nParticles;

		//this.BrownianWalkInit();
		//this.gravityFallInit();
		this.gravityAttractInit();
		// depthTest: false,
		const sprite = new THREE.TextureLoader().load('textures/disc.png');
		sprite.colorSpace = THREE.SRGBColorSpace;
		material = new THREE.PointsMaterial({
			size: 0.03,
			sizeAttenuation: true,
			map: sprite,
			alphaTest: 0.5,
			blending: THREE.AdditiveBlending, 
			transparent: true,
			vertexColors: true // Use vertex colors
		});
		this.m_allParticles = new THREE.Points(this.m_geometry, material);
		this.m_positions = this.m_allParticles.geometry.attributes.position.array;
		this.m_color = this.m_allParticles.geometry.attributes.color.array;
	}

	// update particles.
	update() {
		//this.BrownianWalk();
		//this.gravityFall();
		this.gravityAttract();
		this.m_allParticles.geometry.attributes.position.needsUpdate = true;
		this.m_allParticles.geometry.attributes.color.needsUpdate = true;
	}

	BrownianWalkInit() {
		this.m_geometry = new THREE.BufferGeometry();
		const vertices = [];
		const colors = [];
		for (let i = 0; i < this.m_nParticles; i++) {
			const P = this.getRandomVec()
			vertices.push(0, P[1], P[2]); // x,y,z coordinates
			const C = this.getWhiteColor()
			colors.push(C[0], C[1], C[2]); // Add the color for this vertex
		}
		this.m_geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		this.m_geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	}
	BrownianWalk() {
		const displacementScale = 0.03; // Control the "energy" of the motion
		// update position and color
		for (let i = 0; i < this.m_positions.length; i += 3) {
			// For each vertex (particle), add a small random displacement
			this.m_positions[i] +=     (Math.random() - 0.5) * displacementScale; // x
			this.m_positions[i + 1] += (Math.random() - 0.5) * displacementScale; // y
			this.m_positions[i + 2] += (Math.random() - 0.5) * displacementScale; // z
			// compute the distance from the center.
			let dist = Math.sqrt(this.m_positions[i] * this.m_positions[i] + this.m_positions[i + 1] * this.m_positions[i + 1] + this.m_positions[i + 2] * this.m_positions[i + 2]);
			// reset to origin if moved to far.
			if (dist > 1.3) {
				this.m_positions[i] = 0;
				this.m_positions[i + 1] = 0;
				this.m_positions[i + 2] = 0;
				dist = 0.0;
			}
			let color = blackBodyColor(dist);
			this.m_color[i] = color[0];
			this.m_color[i + 1] = color[1];
			this.m_color[i + 2] = color[2];
		}
	}
	
	gravityFallInit() {
		this.m_geometry = new THREE.BufferGeometry();
		const vertices = [];
		const colors = [];
		for (let i = 0; i < this.m_nParticles; i++) {
			vertices.push(0, 0, 0);
			const C = this.getRandomColor()
			colors.push(C[0], C[1], C[2]); // Add the color for this vertex
		}
		this.m_geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		this.m_geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		this.m_velocity = new Float32Array(this.m_nParticles * 3);
		for (let i = 0; i < this.m_velocity.length; i += 3) {
			const V = this.getRandomVec()
			this.m_velocity[i] = V[0];
			this.m_velocity[i + 1] = 0.5 + V[1];
			this.m_velocity[i + 2] = V[2];
		}

		// Create a metallic material with a gold tint
		const metalMaterial = new THREE.MeshStandardMaterial({
			color: 0xFFD700, // Gold color
			metalness: 0.9, // Fully metallic
			roughness: 0.1 // A bit of roughness to simulate gold's reflectivity
		});
		const boxGeometry = new THREE.BoxGeometry(2, 0.2, 2)
		// add cube to the scene
		const cube = new THREE.Mesh(boxGeometry, metalMaterial);
		cube.position.set(0, -1.1, 0);
		scene.add(cube);
	}

	gravityFall() {
		const a = -1.0;  // acceleration
		const dt = 1.0/60.0;  // timestep
		for (let i = 0; i < this.m_positions.length; i += 3) {
			this.m_velocity[i + 1] += a * dt;
			this.m_positions[i] += this.m_velocity[i] * dt; // v_x
			this.m_positions[i + 1] += this.m_velocity[i + 1] * dt; // v_y
			this.m_positions[i + 2] += this.m_velocity[i + 2] * dt; // v_z

			// compute the distance from the center.
			let dist = Math.sqrt(this.m_velocity[i] * this.m_velocity[i] + this.m_velocity[i + 1] * this.m_velocity[i + 1] + this.m_velocity[i + 2] * this.m_velocity[i + 2]);
			let color = blackBodyColor(dist * 0.5);
			this.m_color[i] = color[0];
			this.m_color[i + 1] = color[1];
			this.m_color[i + 2] = color[2];

			// bounce on obstacle
			if (this.m_positions[i + 1] < -1.0 && Math.abs(this.m_positions[i]) < 1.0 && Math.abs(this.m_positions[i + 2]) < 1.0) {
				this.m_velocity[i + 1] = 0.6 * Math.abs(this.m_velocity[i + 1]);
			}

			// reset
			if (this.m_positions[i + 1] < -2.0) {
				this.m_positions[i] = 0;
				this.m_positions[i + 1] = 0;
				this.m_positions[i + 2] = 0;
				this.m_velocity[i + 1] = 0.5 + Math.random(); // [0, 1]
			}
		}
	}

	gravityAttractInit() {
		this.m_geometry = new THREE.BufferGeometry();
		const vertices = [];
		const colors = [];
		for (let i = 0; i < this.m_nParticles; i++) {
			const P = this.getRandomVec();
			vertices.push(P[0] * 2.0, P[1] * 2.0, P[2] * 2.0);
			const C = this.getRandomColor();
			colors.push(C[0], C[1], C[2]); // Add the color for this vertex
		}
		this.m_geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		this.m_geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		this.m_velocity = new Float32Array(this.m_nParticles * 3);
		for (let i = 0; i < this.m_velocity.length; i += 3) {
			const V = this.getRandomVec()
			this.m_velocity[i] = V[0];
			this.m_velocity[i + 1] = V[1];
			this.m_velocity[i + 2] = V[2];
		}
		
		// Create a metallic material with a gold tint
		const metalMaterial = new THREE.MeshStandardMaterial({
			color: 0xFFD700, // Gold color
			metalness: 0.9, // Fully metallic
			roughness: 0.1 // A bit of roughness to simulate gold's reflectivity
		});
		const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); // radius, widthSegments, heightSegments
		const sphere = new THREE.Mesh(sphereGeometry, metalMaterial);
		// [0,0,0]: center of gravity
		sphere.position.set(0, 0, 0)
		scene.add(sphere);
        
        // Add another planet
        const newPlanetMaterial = new THREE.MeshStandardMaterial({
            color: 0x00FF00, // Green color
            metalness: 0.5, // Semi-metallic
            roughness: 0.5 // Moderate roughness
        });
        const newPlanetGeometry = new THREE.SphereGeometry(0.3, 32, 32); // radius, widthSegments, heightSegments
        const newPlanet = new THREE.Mesh(newPlanetGeometry, newPlanetMaterial);
        // Set the position of the new planet
        newPlanet.position.set(2, 0, 0); // Adjust the position as needed
        scene.add(newPlanet);        
	}

    gravityAttract() {
        const G_main = 0.3; // Gravitational constant for the main planet
        const G_new = -0.1;  // Gravitational constant for the new planet
        const dt = 1.0 / 60.0;  // timestep
        let minSpeed = 100000.0;
        let maxSpeed = 0;
    
        // Position of the main planet
        const mainPlanetPosition = new THREE.Vector3(0, 0, 0);
        // Position of the new planet
        const newPlanetPosition = new THREE.Vector3(2, 0, 0);
        const maxDistance = 5.0; // Maximum distance for color interpolation
    
        for (let i = 0; i < this.m_positions.length; i += 3) {
            // Compute acceleration due to main planet
            let P = new THREE.Vector3(this.m_positions[i], this.m_positions[i + 1], this.m_positions[i + 2]);
            let r = P.length();
            P.normalize();
            let a = -G_main / (r * r);
    
            this.m_velocity[i] += a * P.x * dt;
            this.m_velocity[i + 1] += a * P.y * dt;
            this.m_velocity[i + 2] += a * P.z * dt;
    
            // Compute acceleration due to new planet
            let P_new = new THREE.Vector3(this.m_positions[i], this.m_positions[i + 1], this.m_positions[i + 2]);
            let r_new = P_new.distanceTo(newPlanetPosition);
            let directionToNewPlanet = new THREE.Vector3().subVectors(newPlanetPosition, P_new).normalize();
            let a_new = -G_new / (r_new * r_new);
    
            this.m_velocity[i] += a_new * directionToNewPlanet.x * dt;
            this.m_velocity[i + 1] += a_new * directionToNewPlanet.y * dt;
            this.m_velocity[i + 2] += a_new * directionToNewPlanet.z * dt;
    
            // Update positions
            this.m_positions[i] += this.m_velocity[i] * dt;
            this.m_positions[i + 1] += this.m_velocity[i + 1] * dt;
            this.m_positions[i + 2] += this.m_velocity[i + 2] * dt;
    
            let speedMag = Math.sqrt(this.m_velocity[i] * this.m_velocity[i] + this.m_velocity[i + 1] * this.m_velocity[i + 1] + this.m_velocity[i + 2] * this.m_velocity[i + 2]);
            minSpeed = Math.min(speedMag, minSpeed);
            maxSpeed = Math.max(speedMag, maxSpeed);
    
            // Interpolate color based on distance to new planet
            const colorNear = new THREE.Color(0xff0000); // Red color
            const colorFar = new THREE.Color(0x0000ff); // Blue color
            const distanceFactor = Math.min(r_new / maxDistance, 1.0);
            const interpolatedColor = colorNear.clone().lerp(colorFar, distanceFactor);
    
            this.m_color[i] = interpolatedColor.r;
            this.m_color[i + 1] = interpolatedColor.g;
            this.m_color[i + 2] = interpolatedColor.b;
    
            // Reset if out of bounds
            if (r < 0.8 || r > 2.0) {
                this.m_positions[i] = Math.random() * 0.8 + 0.8; // x
                this.m_positions[i + 1] = 0; // y
                this.m_positions[i + 2] = 0; // z
                this.m_velocity[i] = 0;
                this.m_velocity[i + 1] = Math.abs(Math.random()) * 0.5 + 0.3; // v_y
                this.m_velocity[i + 2] = Math.abs(Math.random()) * 0.1; // v_z
            }
        }
    
        // Normalize speeds for color mapping
        const speedR = maxSpeed - minSpeed; // range of velocity
        for (let i = 0; i < this.m_positions.length; i += 3) {
            let speedMag = Math.sqrt(this.m_velocity[i] * this.m_velocity[i] + this.m_velocity[i + 1] * this.m_velocity[i + 1] + this.m_velocity[i + 2] * this.m_velocity[i + 2]);
            // Interpolate color based on speed
            const colorNear = new THREE.Color(0xff0000); // Red color
            const colorFar = new THREE.Color(0x0000ff); // Blue color
            const speedFactor = (speedMag - minSpeed) / speedR;
            const interpolatedColor = colorNear.clone().lerp(colorFar, speedFactor);
    
            this.m_color[i] = interpolatedColor.r;
            this.m_color[i + 1] = interpolatedColor.g;
            this.m_color[i + 2] = interpolatedColor.b;
        }
    }
}

let particleSys;

function onKeyDown(event) {
    if (event.key == 'p') {
		pause = !pause;
    }
}

function init() {

	camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 5;
	scene = new THREE.Scene();
	
	// add light.
	const directionLight = new THREE.DirectionalLight(0xffffff, 2)
	directionLight.position.set(0, 0, 10)
	scene.add(directionLight)

	const ambientLight = new THREE.AmbientLight(0xffffff, 1); // white light at 50% intensity
	scene.add(ambientLight)
	
	// 100K
	particleSys = new particleSystem(100000);

	scene.add(particleSys.m_allParticles);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);
	document.body.style.touchAction = 'none';
	
	// Adding OrbitControls
	controls = new OrbitControls(camera, renderer.domElement);
	window.addEventListener('resize', onWindowResize);
	window.addEventListener('keydown', onKeyDown, false);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	renderer.render(scene, camera);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	if (!pause)
		particleSys.update();
	render();
}

init();
animate();