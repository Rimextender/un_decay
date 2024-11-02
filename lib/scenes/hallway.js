// @ts-nocheck
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SceneManager } from "../core/scene-manager";
import { Service } from "../core/service";

export { HallwayScene }

const noah2Model = 'assets/models/noah_two.glb'
const NoahTwoAnimation = {
    idle: 'Idle',
    walk: 'Walk',
}

function HallwayScene() {
    this.onActivate = function () {

    }

    this.subjects = [
        new Actor({
            model: noah2Model,
            animations: [NoahTwoAnimation.idle, NoahTwoAnimation.walk],
            position: new THREE.Vector3(0, -10, 0)
        }),
    ];
}
HallwayScene.sceneName = 'hallway';

// ** //

function Actor({ model, clips, position }) {
    const mesh = new THREE.Group()
    this.mesh = mesh;

    const animations = [];
    let mixer;
    this.update = function (dt, t) {
        mixer?.update(dt)
        mesh.position.z += 3 * dt
    }

    this.playAnimation = function (name) {
        const clip = THREE.AnimationClip.findByName(animations, name);
        console.log(clip);

        const action = mixer.clipAction(clip);
        action.play();

        const povCam = mesh.getObjectByName("camera-pov");
        console.log(povCam);
        console.log(mesh);

        if (povCam instanceof THREE.PerspectiveCamera) {

            SceneManager.emit('set-camera', {
                camera: povCam
            })
        }
    }

    this.onModelLoad = function () {

    }

    Service.gltfLoader.load(
        // resource URL
        model,
        (gltf) => {
            mesh.add(gltf.scene);
            mixer = new THREE.AnimationMixer(gltf.scene);
            animations.push(...gltf.animations)
            this.playAnimation(NoahTwoAnimation.walk)
        },
    );
}