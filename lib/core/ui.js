// @ts-nocheck
import * as THREE from "three";
import ThreeMeshUI from 'three-mesh-ui';
import Background from "three/src/renderers/common/Background.js";
import { SanityMeter } from "./sanity";
import { KeyActions, KeyboardControlsConfig } from "../physics/controls/controls-config";

export { GuiHud, GuiPreset }

const GuiPreset = {
    liveReaction: 'live-reaction',
    sanity: 'sanity',
}

function GuiHud() {
    const mesh = new THREE.Group()
    this.mesh = mesh;
    const size = new THREE.Vector2(0, 0)
    let container, proxyContainer;

    const sanityMeter = new SanityMeter()
    sanityMeter.mesh.position.set(0, -1.5, 0)
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
                    autoLayout: false,
                    contentDirection: 'column',
                    alignItems: "center",
                }).add(
                    new ThreeMeshUI.Text({
                        content: `Press ${startKey} to start`,
                        fontColor: new THREE.Color(0xFFFFFF),
                        fontSize: 0.1,

                    }),
                );
            ui.autoLayout = false
            ui.position.y -= 1
            container.add(ui)
        },
        'live-reaction': (container) => {
            container.add(createLiveReactionText(size.x, size.y))
        },
        'sanity': (container) => {
            sanityMeter.enabled = true
            sanityMeter.mount(mesh)
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
            padding: 0.1,
            backgroundOpacity: 0,
            // fontFamily: "assets/fonts/msdf/Monofett-msdf.json",
            // fontTexture: "assets/fonts/msdf/Monofett.png",
            fontFamily: "./assets/fonts/msdf/RobotoMono-msdf.json",
            fontTexture: "./assets/fonts/msdf/RobotoMono.png",
        })

        container = new ThreeMeshUI.Block({
            width: w,
            height: h,
            backgroundOpacity: 0,
            fontFamily: "./assets/fonts/msdf/RobotoMono-msdf.json",
            fontTexture: "./assets/fonts/msdf/RobotoMono.png",
        })

        proxyContainer.add(container)

        mesh.add(proxyContainer);
    }

    this.mount = function (scene, camera) {
        const distance = 3;
        var vFOV = THREE.MathUtils.degToRad(camera.fov); // convert vertical fov to radians
        var height = 2 * Math.tan(vFOV / 2) * distance; // visible height
        var width = height * camera.aspect; // visible width

        mesh.position.z -= distance;
        size.height = height;
        size.width = width;

        this.createUi(width, height)
        scene.add(mesh)
    }

    this.update = function (dt, t) {
        ThreeMeshUI.update();
        sanityMeter.update(dt, t)
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
                content: "LIVE NOAH REACTION",
                justifyContent: "center",
                fontColor: new THREE.Color(0xFFFFFF),
                fontSize: 0.4,
                backgroundColor: new THREE.Color(0xFFFFFF),
                backgroundOpacity: 1,
            }),
        );
    return ui;
}