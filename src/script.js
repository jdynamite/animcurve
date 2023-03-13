import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xf0f0f0)

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height)
camera.position.set(-5, 3, 10)
scene.add(camera)

// Background and grid
scene.add(new THREE.AmbientLight( 0xf0f0f0))
const light = new THREE.SpotLight(0xffffff, 1)
light.position.set(5, 13, 5)
light.angle = Math.PI * 0.2
light.castShadow = true
// light.shadow.camera.near = 200
// light.shadow.camera.far = 2000
light.shadow.bias = .00001
light.shadow.mapSize.width = 1024
light.shadow.mapSize.height = 1024
scene.add(light)

const plane = new THREE.PlaneGeometry(2000, 2000)
plane.rotateX(-Math.PI/2) // rotate 90
const planeMtl = new THREE.ShadowMaterial({color: 0x000000, opacity: 0.2})
const planeMesh = new THREE.Mesh(plane, planeMtl)
planeMesh.position.y = -0.5
planeMesh.receiveShadow = true
scene.add(planeMesh)

const helper = new THREE.GridHelper(20, 20)
helper.position.y -= 0.5
helper.material.opacity = 0.25
helper.material.transparent = true
scene.add(helper)

// Curve
const curve = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( -1, 0, 0 ),
	new THREE.Vector3( -.3, .3, 0 ),
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( .3, -.3, 0 ),
	new THREE.Vector3( 1, 0, 0 )
] );
const points = curve.getPoints( 50 );
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const material = new THREE.LineBasicMaterial( { color: 0xaaaaaa } );

// Create the final object to add to the scene
curve.mesh = new THREE.Line( geometry, material );
curve.mesh.castShadow = true
const curveGroup = new THREE.Group()

curveGroup.add(curve.mesh);
curveGroup.position.set(-2, 1.5, -2)
scene.add(curveGroup)

// Cube
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
    new THREE.MeshLambertMaterial({ color: 0xcc3fd3 })
)
mesh.castShadow = true
scene.add(mesh)
camera.lookAt(mesh.position)

// Curve Orb
const orb = new THREE.Mesh(
    new THREE.SphereGeometry(),
    new THREE.MeshBasicMaterial({color: 0x009900})
)
orb.scale.multiplyScalar(0.1)
scene.add(orb)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas, antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.shadowMap.enabled = true

// Animate
let curveT = 0.0;

document.addEventListener('keydown', (event) => {
    if (event.key == "w") {
        curveT += 0.1
        curveT = curveT % 1.0
    }
    else if (event.key == "s" && curveT >= 0.1) {
        curveT -= 0.1
    }
})

// Controls
const controls = new OrbitControls(camera, canvas)
controls.damping = 0.2
controls.update();

const tick = () =>
{
    let curveAtT = curve.getPointAt(curveT)
    mesh.position.x = curve.getPointAt(curveT).y * 10;
    curveAtT.add(curveGroup.position) 
    orb.position.set(...curveAtT)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}


// controls.addEventListener('change', tick)
tick()
