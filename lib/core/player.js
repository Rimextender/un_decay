import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { PlayerPhysicsControls } from '../physics/controls/player-physics-controller';
import { PlayerPhysics } from '../physics/controls/physics_config';
import { PlayerControls } from '../physics/controls/player-controller';

export { Player };

function Player(pos, renderer) {
    this.quaternion = new THREE.Quaternion()

    const mesh = new THREE.Group();
    this.mesh = mesh


    let controls = new PlayerControls(this, renderer.domElement)
    this.controls = controls;

    this.mount = function (scene, camera) {
        scene.add(mesh)
        // mesh.add(camera)
        // camera.position.y += 1.7
    }

    this.update = function (dt, t) {
        controls.update(dt, t)
    };

}
