// @ts-nocheck
import { SceneManager } from "./core/scene-manager";
import * as THREE from 'three';
import { HallwayScene } from "./scenes/hallway";
import { Service } from "./core/service";
import { SoundManager } from "./core/sound-manager";
import { GuiHud, GuiPreset } from "./core/ui";
import { KeyActions, KeyboardControlsConfig, KeyNames } from "./physics/controls/controls-config";
import { PlayerControls } from "./physics/controls/player-controller";
import { EndRoom } from "./scenes/room";

const SKIP_START = false

const canvas = document.getElementById("canvas");
const sceneManager = new SceneManager(canvas);

bindEventListeners();
render();

const startKey = KeyboardControlsConfig.getKeyOf(KeyActions.A_Start);
SceneManager.listen(`resolve-action-${KeyActions.A_Start}`, e => {
    loadGame()
    return GuiHud.instance.hideTip('tip-start');
}, true)
SceneManager.instance = sceneManager
if (SKIP_START) {
    SceneManager.emit(`resolve-action-${KeyActions.A_Start}`)
} else {
    GuiHud.instance.showTip(`Press ${startKey} to start`, 'tip-start')
    PlayerControls.instance.waitForKeyResolution(KeyActions.A_Start)
}

const service = new Service()

function loadGame() {

    sceneManager.setScene(new HallwayScene(), HallwayScene.sceneName)
    //sceneManager.hideScene("default");
    // sceneManager.setScene("test", SquareFieldMap());
    // sceneManager.hideScene("test");
    // sceneManager.setScene("limmyroom", LimmyRoom());
    // sceneManager.setScene("platform", ThePlatform());
    // sceneManager.activateScene("platform");
}

function bindEventListeners() {
    window.onresize = () => resizeCanvas(canvas);
    resizeCanvas(canvas);
}

function resizeCanvas(canvas) {
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    sceneManager.onWindowResize();
}

function render() {
    requestAnimationFrame(render);
    sceneManager.update();
}

