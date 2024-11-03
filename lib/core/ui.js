// @ts-nocheck
import * as THREE from "three";
import ThreeMeshUI from 'three-mesh-ui';
import Background from "three/src/renderers/common/Background.js";
import { SanityMeter } from "./sanity";
import { KeyActions, KeyboardControlsConfig } from "../physics/controls/controls-config";
import ANIME from 'animejs/lib/anime.es.js';

export { GuiHud, GuiPreset }

const GuiPreset = {
    liveReaction: 'live-reaction',
    sanity: 'sanity',
}

const initialTipScale = new THREE.Vector3(0.1, 0.1, 0.1)
const targetTipScale = new THREE.Vector3(1, 1, 1)

function GuiHud() {
    const mesh = new THREE.Group()
    this.mesh = mesh;
    const size = new THREE.Vector2(0, 0)
    let container, proxyContainer;

    this.container
    const subjects = []
    this.subjects = subjects

    const sanityMeter = new SanityMeter()
    SanityMeter.instance = sanityMeter;

    const uiPresets = {
        'game-start': (container) => {
            const startKey = KeyboardControlsConfig.getKeyOf(KeyActions.A_Start);
            const ui =
                new ThreeMeshUI.Block({
                    width: size.x,
                    height: 0.2,
                    backgroundOpacity: 0.3,
                    backgroundColor: new THREE.Color(0x444444),
                    contentDirection: 'column',
                    alignItems: "end",
                }).add(
                    new ThreeMeshUI.Text({
                        content: `Press ${startKey} to start`,
                        fontColor: new THREE.Color(0xFFFFFF),
                        fontSize: size.x / 30,
                    }),
                );
            container.add(ui)
        },
        'live-reaction': (container) => {
            container.add(createLiveReactionText(size.x, size.y))
        },
        'sanity': (container) => {
            const meter = new THREE.Mesh(new THREE.PlaneGeometry(size.x / 5, size.x / 40),
                new THREE.MeshBasicMaterial({ color: 0x00FF00 })
            )

            const ui =
                new ThreeMeshUI.Block({
                    width: size.x / 5,
                    height: size.x / 40,
                    backgroundOpacity: 0.2,
                    backgroundColor: new THREE.Color(0xFF0000),
                })
                    .add(
                        sanityMeter.mesh
                    )
                    .add(
                        meter
                    )

            ui.autoLayout = false
            ui.position.y -= 0.55
            sanityMeter.mesh.position.y = 0.2
            container.add(ui)

            this.subjects['sanity'] = {
                values: new Map([
                    ['sanity', 100]
                ]),
                update: () => {
                    meter.scale.x = this.subjects['sanity'].values.get('sanity')
                }
            }
            // sanityMeter.mount(mesh)
        },
    }

    this.loadPreset = function (preset) {
        mesh.remove(proxyContainer);

        this.createUi()
        uiPresets[preset]?.(container)
    }

    this.createUi = function (w, h) {
        proxyContainer = new ThreeMeshUI.Block({
            width: w,
            height: h,
            backgroundOpacity: 0,
            backgroundColor: new THREE.Color(0x444444),
            // fontFamily: "assets/fonts/msdf/Monofett-msdf.json",
            // fontTexture: "assets/fonts/msdf/Monofett.png",
            fontFamily: "./assets/fonts/msdf/RobotoMono-msdf.json",
            fontTexture: "./assets/fonts/msdf/RobotoMono.png",
        })

        container = new ThreeMeshUI.Block({
            width: w,
            height: h,
            backgroundOpacity: 0,
            backgroundColor: new THREE.Color(0x444444),
            fontFamily: "./assets/fonts/msdf/RobotoMono-msdf.json",
            fontTexture: "./assets/fonts/msdf/RobotoMono.png",
        })

        proxyContainer.add(container)

        mesh.add(proxyContainer);
    }

    this.mount = function (scene, camera) {
        const distance = 1;
        var vFOV = THREE.MathUtils.degToRad(camera.fov); // convert vertical fov to radians
        var height = 2 * Math.tan(vFOV / 2) * distance; // visible height
        var width = height * camera.aspect; // visible width

        mesh.position.z -= distance;
        mesh.position.z -= 0.1;
        size.height = height;
        size.width = width;

        this.createUi(width, height)
        scene.add(mesh)
    }

    this.showTip = function (text = 'tip text', id, duration) {
        const block = new ThreeMeshUI.Block({
            width: size.x,
            height: 0.15,
            backgroundOpacity: 0.3,
            backgroundColor: new THREE.Color(0x444444),
            contentDirection: 'column',
            alignItems: "end",
            justifyContent: "end",
        }).add(
            new ThreeMeshUI.Text({
                content: text,
                fontColor: new THREE.Color(0xFFFFFF),
                fontSize: 0.1,
            }),
        );
        block.autoLayout = false
        block.name = id
        block.scale.copy(initialTipScale)

        container.add(block)

        ANIME({
            duration: 600,
            easing: 'easeInOutQuad',
            update: function (anim) {
                const t = anim.progress / 100;
                block.scale.lerpVectors(initialTipScale, targetTipScale, t);
                block.backgroundMaterial.opacity = t
                block.backgroundOpacity = t
            },
            complete: function () {

            },
        });

        if (duration) {
            setTimeout(() => {
                ANIME({
                    duration: 300,
                    easing: 'easeInOutQuad',
                    update: function (anim) {
                        const t = 1 - anim.progress / 100;
                        block.scale.lerpVectors(initialTipScale, targetTipScale, t);
                        block.backgroundMaterial.opacity = t
                        block.backgroundOpacity = t
                    },
                    complete: function () {
                        container.remove(block)
                    },
                });
            }, duration);
        }
    }

    this.hideTip = function (id) {
        container.remove(container.getObjectByName(id))
    }

    this.update = function (dt, t) {
        ThreeMeshUI.update();
        sanityMeter.update(dt, t)
    }

    this.setValue = function (name, label, value) {
        const segment = this.subjects[name]
        console.log(this.subjects);

        if (!segment) return;

        segment.values.set(label, value)
        segment.update()
    }
}

function createLiveReactionText(w, h) {
    const ui =
        new ThreeMeshUI.Block({
            width: w,
            height: w / 10,
            backgroundOpacity: 1,
            backgroundColor: new THREE.Color(0xFF0000),
        }).add(
            new ThreeMeshUI.Text({
                content: "LIVE NOA REACTION",
                justifyContent: "center",
                fontColor: new THREE.Color(0xFFFFFF),
                fontSize: w / 15,
                backgroundColor: new THREE.Color(0xFFFFFF),
                backgroundOpacity: 1,
            }),
        );
    return ui;
}