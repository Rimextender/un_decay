// @ts-nocheck
import { SceneManager } from "./core/scene-manager";
import * as THREE from 'three';
import { HallwayScene } from "./scenes/hallway";
import { Service } from "./core/service";
import { SoundManager } from "./core/sound-manager";
import { GuiHud, GuiPreset } from "./core/ui";

const SKIP_START = false

const canvas = document.getElementById("canvas");
const sceneManager = new SceneManager(canvas);

bindEventListeners();
render();
GuiHud.instance.loadPreset('game-start')

SceneManager.listen('player-start', e => loadGame(), true)

if (SKIP_START) {
    SceneManager.emit('player-start')
}

const service = new Service()

function loadGame() {
    GuiHud.instance.loadPreset(GuiPreset.sanity)
    GuiHud.instance.loadPreset(GuiPreset.liveReaction)
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

