// @ts-nocheck
import * as THREE from 'three';
import { BokehPass, EffectComposer, FlyControls, GlitchPass, GLTFLoader, HalftonePass, OrbitControls, OutputPass, RenderPass } from 'three/examples/jsm/Addons.js';
import { generateComplex } from './lib/gen/complex';
import * as CANNON from 'cannon-es'
import { Player } from './lib/core/player';
import CannonDebugger from 'cannon-es-debugger';
import { createLilGui } from './lib/stash/gui';
import { SanityMeter } from './lib/core/sanity';
import { SoundManager } from './lib/core/sound-manager';
import { mix } from 'three/webgpu';

createLilGui()

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.autoClear = false;

const clock = new THREE.Clock();
const loader = new THREE.ObjectLoader();
const soundManager = new SoundManager()
soundManager.mount(camera)

let controls = new OrbitControls(camera, renderer.domElement)
controls.update()
let freeControls = new OrbitControls(overviewCamera, renderer.domElement)
camera.position.z = 10;

const player = new Player(new THREE.Vector3(3, 10, 0), renderer, false)
subjects.push(player)
player.mount(sceneContainer, camera)

const levelGeometry = new THREE.Group()
levelGeometry.layers.set(1)
sceneContainer.add(levelGeometry)


const gltfLoader = new GLTFLoader();

// Optional: Provide a DRACOgltfLoader instance to decode compressed mesh data

// Load a glTF resource
gltfLoader.load(
    // resource URL
    'assets/models/noah8.glb',
    function (gltf) {
        scene.add(gltf.scene);
        const light = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(light);
        const mixer = new THREE.AnimationMixer(gltf.scene);
        subjects.push(mixer)
        console.log(gltf.scene);


        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

        const clip = THREE.AnimationClip.findByName(gltf.animations, 'Armature.001|mixamo.com|Layer0');
        const action = mixer.clipAction(clip);
        action.play();

    },
    // called while loading is progressing
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
        console.log('An error happened');
    }
);

function createSanityMeter() {
    const sanityMeter = new SanityMeter()
    subjects.push(sanityMeter)
    sanityMeter.mount(scene)
}

//loadAxisHelper()
createSanityMeter()

function loadAxisHelper() {
    loader.load(
        "josef4/AxisHelpers.json",
        (obj) => {
            obj.traverse(o => {

                if (o.material) {
                    console.log(o.material);
                    o.material.tranparent = true
                    o.material.opacity = 0.5
                }
            })
            scene.add(obj);
        },
    );
}


function setScene(sceneName, children) {
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);
    sceneGroups.set(sceneName, sceneGroup);

    if (children.length > 0) {
        sceneGroup.add(...children.map((s) => s.mesh));
    }

    subjects.add(...children)
}


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    const dt = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    // controls.update(dt, elapsedTime);

    subjects.forEach(s => {
        s.update(dt, elapsedTime)
    });

    renderer.clear();
    renderer.render(scene, camera);
}


renderer.setAnimationLoop(animate);
