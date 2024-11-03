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
import { degToRad, lerp, radToDeg } from "three/src/math/MathUtils.js";

export { EndRoom }

const noah2Model = 'assets/models/noah_two.glb'
const rileyModel = 'assets/models/riley.glb'

const skyboxStars = 'assets/props/billions_stars_skybox_hdri_panorama.glb';
const galaxy = 'assets/props/galaxy.glb';
const starsModel = 'assets/props/need_some_space.glb';
const sci_fi_room = 'assets/props/sci_fi_room.glb';
const sky_dome = 'assets/props/sky_dome._nebula_and_stars_space_hdri..glb';
const studio_room = 'assets/props/studio_room.glb';

const NoahTwoAnimation = {
    idle: 'Idle',
    walk: 'Walk',
}
const RileyAnimation = {
    fly: 'PoseFly',
}

function EndRoom() {
    let firstLoad = true;

    const noahActor = new Actor({
        model: noah2Model,
        animations: [NoahTwoAnimation.idle, NoahTwoAnimation.walk],
        position: new THREE.Vector3(0, -10, 0)
    })

    noahActor.mesh.position.set(1, 0.3, 0)
    noahActor.mesh.rotation.set(-Math.PI / 4, 0, Math.PI / 2)
    const rileyActor = new Actor({
        model: rileyModel,
        animations: [NoahTwoAnimation.idle, NoahTwoAnimation.walk],
        position: new THREE.Vector3(0, -10, 0)
    })
    rileyActor.mesh.position.set(0.1, 0, 1)
    rileyActor.mesh.rotation.set(0, -degToRad(135), 0)
    const roomActor = new Actor({
        model: studio_room,
        animations: [],
        position: new THREE.Vector3(0, -10, 0)
    })

    const dome = new Actor({
        model: skyboxStars,
        animations: [],
        position: new THREE.Vector3(0, -10, 0)
    })
    dome.mesh.scale.set(100, 100, 100)

    const blood = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }))
    blood.position.y = 0.1
    blood.rotation.x = degToRad(-90)
    const camera = new THREE.PerspectiveCamera()
    camera.position.set(0, 2, 6)
    SceneManager.emit('set-camera', {
        camera: camera
    })

    const genLight = new THREE.AmbientLight("#222222", 50);
    noahActor.mesh.add(genLight)
    roomActor.mesh.add(blood)
    this.subjects = [
        noahActor,
        rileyActor,
        roomActor,
        dome,
    ];

    const rileyStartPosition = new THREE.Vector3(0, 0, 0)
    rileyStartPosition.copy(rileyActor.mesh.position)
    const rileyEndPosition = new THREE.Vector3(0, 1.2, 2)

    const rileyStartRotation = new THREE.Euler(0, 0, 0)
    rileyStartRotation.copy(rileyActor.mesh.rotation)
    const rileyEndRotation = new THREE.Euler(0, 0, 0)

    const bloodScale = new THREE.Vector3(0.1, 0.1, 0.1)
    const bloodScaleTarget = new THREE.Vector3(1, 1, 1)

    this.onLoad = async function () {
        firstLoad = false;
        await noahActor.modelLoaded;
        await rileyActor.modelLoaded;
        const body = rileyActor.mesh.getObjectByName("Alpha_Surface_1");
        const bodyMat = body.material
        rileyActor.playAnimation(RileyAnimation.fly, 3000, false)
        noahActor.playAnimation(NoahTwoAnimation.idle, 1)
        ANIME({
            duration: 3000,
            easing: 'easeOutQuad',
            change: (anim) => {
                const t = anim.progress / 100;
                blood.scale.lerpVectors(bloodScale, bloodScaleTarget, t);

            },
        });
        SceneManager.listen(`resolve-action-${KeyActions.A_SanityBeep}`, e => {
            this.playSequence()
            return GuiHud.instance.hideTip('tip-gone');
        }, true)

        GuiHud.instance.showTip(`He is gone. Confirm: X`, 'tip-gone')
        PlayerControls.instance.waitForKeyResolution(KeyActions.A_SanityBeep)
    }

    this.playSequence = async function () {
        SoundManager.instance.playMusic('decline')

        await noahActor.modelLoaded;
        await rileyActor.modelLoaded;
        const body = rileyActor.mesh.getObjectByName("Alpha_Surface_1");
        const bodyMat = body.material
        rileyActor.playAnimation(RileyAnimation.fly, 3000, false)
        noahActor.playAnimation(NoahTwoAnimation.idle, 1)
        const normalFace = noahActor.mesh.getObjectByName("NormalFace");
        const secondFace = noahActor.mesh.getObjectByName("SecondFace");
        secondFace.visible = true
        ANIME({
            duration: 3000,
            easing: 'easeOutQuad',
            change: (anim) => {
                const t = anim.progress / 100;
            },
            complete: () => {
                noahActor.playAnimation(NoahTwoAnimation.idle, 10000)
                const proxy = new THREE.Group()
                proxy.add(camera)
                rileyActor.mesh.add(proxy)
                ANIME({
                    duration: 3000,
                    easing: 'easeInOutQuad',
                    begin: function () {
                        rileyActor.playAnimation(RileyAnimation.fly, 3, false)
                    },
                    update: function (anim) {
                        const t = anim.progress / 100;
                        rileyActor.mesh.position.lerpVectors(rileyStartPosition, rileyEndPosition, t);

                        proxy.rotation.y = lerp(degToRad(0), degToRad(180), t)
                        rileyActor.mesh.rotation.y = THREE.MathUtils.lerp(rileyStartRotation.y, -Math.PI, t)
                        if (bodyMat instanceof THREE.MeshStandardMaterial) {
                            bodyMat.emissiveIntensity = 1 - t
                        }
                    },
                    complete: function () {
                        ANIME({
                            duration: 30000,
                            easing: 'easeInOutQuad',
                            begin: function () {
                                rileyActor.playAnimation(RileyAnimation.fly, 3, false)
                            },
                            update: function (anim) {
                                const t = anim.progress / 100;
                                rileyActor.mesh.position.y += t * 0.2
                                camera.position.z += lerp(0, 0.01, t * t)
                                proxy.rotation.y += lerp(0.05, 0, t * t)

                                rileyActor.mesh.rotation.y = THREE.MathUtils.lerp(rileyStartRotation.y, -Math.PI, t)
                            },
                            complete: function () {
                            },
                        });
                    },
                });
            },
            easing: "easeOutQuad",
        });
    }
}
EndRoom.sceneName = 'endroom';

