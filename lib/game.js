import { SceneManager } from "./core/scene-manager";
import * as THREE from 'three';
import { HallwayScene } from "./scenes/hallway";
import { Service } from "./core/service";

const canvas = document.getElementById("canvas");
const sceneManager = new SceneManager(canvas);

bindEventListeners();
render();
loadGame();

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
    console.log(canvas.offsetWidth, canvas.offsetHeight);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    sceneManager.onWindowResize();
}

function render() {
    requestAnimationFrame(render);
    sceneManager.update();
}

