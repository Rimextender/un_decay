// @ts-nocheck
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SceneManager } from "../core/scene-manager";
import { Service } from "../core/service";
import { SoundManager } from "../core/sound-manager";
import ANIME from 'animejs/lib/anime.es.js';
import { GuiHud, GuiPreset } from "../core/ui";
import { KeyActions, KeyboardControlsConfig, KeyNames } from "../physics/controls/controls-config";
import { PlayerControls } from "../physics/controls/player-controller";
import { SanityMeter } from "../core/sanity";

export { Actor }

function Actor({ model, clips, position }) {
    const mesh = new THREE.Group()
    this.mesh = mesh;

    this.modelLoaded = new Promise((resolve) => {
        this.resolveDataLoaded = resolve;
    });

    const animations = [];
    let mixer;
    this.update = function (dt, t) {
        mixer?.update(dt)
    }

    this.playAnimation = function (name, duration, loop = true) {
        const clip = THREE.AnimationClip.findByName(animations, name);

        const action = mixer.clipAction(clip);
        if (action instanceof THREE.AnimationAction) {
            if (duration) action.setDuration(duration)
            //new THREE.AnimationAction().loop =
            action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce)
            action.clampWhenFinished = true;
            action.play();
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
            this.resolveDataLoaded("true");
        },
    );
}