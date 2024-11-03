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
import { Actor } from "./actor";

export { HallwayScene }

const noah2Model = 'assets/models/noah_two.glb'
const NoahTwoAnimation = {
    idle: 'Idle',
    walk: 'Walk',
}

function HallwayScene() {
    let firstLoad = true;

    const noahActor = new Actor({
        model: noah2Model,
        animations: [NoahTwoAnimation.idle, NoahTwoAnimation.walk],
        position: new THREE.Vector3(0, -10, 0)
    })

    const genLight = new THREE.AmbientLight("#222222", 50);
    const redLight = new THREE.PointLight(0xff0000, 0, 5)
    const redLight2 = new THREE.PointLight(0xff0000, 0, 5)
    redLight.position.z -= 2
    redLight2.position.z = 2
    redLight2.position.y = 1.5
    noahActor.mesh.add(genLight)
    noahActor.mesh.add(redLight)
    noahActor.mesh.add(redLight2)
    this.subjects = [
        noahActor,
    ];

    this.update = function (dt, t) {
        noahActor.mesh.position.z += 3 * dt
    }

    this.onLoad = async function () {
        firstLoad = false;

        await noahActor.modelLoaded;

        const povCam = noahActor.mesh.getObjectByName("camera-pov");

        const normalFace = noahActor.mesh.getObjectByName("NormalFace");
        const secondFace = noahActor.mesh.getObjectByName("SecondFace");
        secondFace.visible = false

        SceneManager.listen('sanity-level-change', (e => {
            const beatDuration = SanityMeter.instance.beatDuration
            const level = e.detail;
            genLight.intensity = 50 * (5 - level)
            redLight2.intensity = 20 - 20 * (5 - level)
            povCam.zoom = 1 + level * 0.3
            povCam.updateProjectionMatrix();

            if (SanityMeter.instance.gameLevel == 0) {
                noahActor.playAnimation(NoahTwoAnimation.walk, beatDuration / 2 * level)
            }

            if (level == 5) {
                redLight.intensity = 10 * level
                secondFace.visible = true
                normalFace.visible = false
            } else
                if (level >= 4) {
                    redLight.intensity = 20 * level
                    secondFace.visible = true
                    normalFace.visible = false
                } else
                    if (level > 2) {
                        redLight.intensity = 20 * level
                    }
                    else {
                        secondFace.visible = false
                        normalFace.visible = true
                    }
        }))

        noahActor.povCam = povCam
        if (povCam instanceof THREE.PerspectiveCamera) {
            const beatDuration = SanityMeter.instance.beatDuration

            SceneManager.emit('set-camera', {
                camera: povCam
            })
            povCam.rotation.x = Math.PI / 2
            povCam.zoom = 0.00001
            povCam.updateProjectionMatrix();


            ANIME({
                duration: beatDuration * 1000, // TODO set beatDuration * 4 * 1000 
                easing: 'easeInOutQuad',
                update: function (anim) {
                    const t = anim.progress / 100;
                    povCam.rotation.x = THREE.MathUtils.lerp(-Math.PI / 3, 0.054536486139429644, t)
                    povCam.zoom = THREE.MathUtils.lerp(0.00001, 1, t)
                    povCam.updateProjectionMatrix();
                },
                begin: function () {
                    noahActor.playAnimation(NoahTwoAnimation.walk, beatDuration / 2)

                    SanityMeter.instance.enabled = true
                    SoundManager.instance.playMusic('EndlessHole')
                },
                complete: function () {
                    GuiHud.instance.loadPreset(GuiPreset.sanity)
                    const beepKey = KeyboardControlsConfig.getKeyOf(KeyActions.A_SanityBeep);
                    GuiHud.instance.showTip(`Press ${KeyNames.get(beepKey)} to calm down`, 'tip-sanity')
                    PlayerControls.instance.waitForKeyResolution(KeyActions.A_SanityBeep)
                    SceneManager.listen(`resolve-action-${KeyActions.A_SanityBeep}`, e => GuiHud.instance.hideTip('tip-sanity'), true)
                },
            });

            povCam.updateProjectionMatrix();
        }
    }

}
HallwayScene.sceneName = 'hallway';

