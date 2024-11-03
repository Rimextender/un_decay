// @ts-nocheck
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createInspector } from 'three-inspect/vanilla'
import { GeneralLights } from "../physics/general_lights";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { GuiHud } from "./ui";
import { PlayerControls } from "../physics/controls/player-controller";
import { SoundManager } from "./sound-manager";

export { SceneManager }


const SCENE_DEFAULT = "default";

function SceneManager(canvas) {
    const clock = new THREE.Clock();

    const screenDimensions = {
        width: canvas.width,
        height: canvas.height,
    };

    const scene = buildScene();
    const renderer = buildRender(screenDimensions);
    let camera = buildCamera(screenDimensions);
    let uiCamera = buildCamera(screenDimensions)
    const controls = buildControls()
    const playerControls = new PlayerControls(camera, renderer.domElement)
    PlayerControls.instance = playerControls
    const uiScene = new THREE.Scene()
    const ui = new GuiHud()
    GuiHud.instance = ui
    ui.mount(uiScene, uiCamera)

    const soundManager = new SoundManager()
    SoundManager.instance = soundManager
    soundManager.mount(camera)

    const scenes = new Map();
    const sceneGroups = new Map();
    let activeScenes = new Set();
    this.activeScenes = activeScenes;
    addEventListeners()

    activeScenes.add(SCENE_DEFAULT);

    function addEventListeners() {
        document.body.addEventListener('set-camera', (e) => {
            const newCamera = e.detail.camera
            camera = newCamera
        })
    }

    function buildScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#000");

        return scene;
    }

    function buildRender({ width, height }) {
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
        });
        const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
        renderer.setPixelRatio(DPR);
        renderer.setSize(width, height);
        renderer.autoClear = false;
        renderer.autoClearDepth = false;

        return renderer;
    }

    function buildCamera({ width, height }) {
        const aspectRatio = width / height;
        const fieldOfView = 60;
        const nearPlane = 1;
        const farPlane = 100;
        const camera = new THREE.PerspectiveCamera(
            fieldOfView,
            aspectRatio,
            nearPlane,
            farPlane
        );

        return camera;
    }

    function buildControls() {
        camera.position.z -= 10
        camera.position.y += 2
        return new OrbitControls(camera, renderer.domElement);
    }

    function buildInspector() {

        const inspector = createInspector(document.body, {
            scene,
            camera,
            renderer,
        })

    }

    this.setScene = function (sceneConfig, name) {
        const sceneName = name || sceneConfig.sceneName
        const subjects = sceneConfig.subjects

        this.activeScenes.add(sceneName);
        sceneConfig.onLoad?.()

        if (scenes.has(sceneName)) {
        } else {
            scenes.set(sceneName, subjects || []);
            const sceneGroup = new THREE.Group();
            sceneGroup.name = `${sceneName}`
            scene.add(sceneGroup);
            sceneGroups.set(sceneName, sceneGroup);

            if (subjects.length > 0) {
                sceneGroup.add(...subjects.map((s) => s.mesh));
            }
        }
    };

    this.activateScene = function (sceneName) {
        if (scenes.has(sceneName)) {
            this.activeScenes.add(sceneName);
            const sceneGroup = sceneGroups.get(sceneName);

            if (sceneGroup.parent !== scene) {
                scene.add(sceneGroup);
            }
        } else {
            console.log(`ERROR: no scene named ${sceneName}`);
        }
    };

    this.hideScene = function (sceneName) {
        this.activeScenes.delete(sceneName);
        const sceneGroup = sceneGroups.get(sceneName);

        if (sceneGroup) {
            scene.remove(sceneGroup);
        }
    };

    function createDefaultScene() {
        const defaultSceneSubjects = [

            //new GeneralLights()
        ];

        return { subjects: defaultSceneSubjects };
    }

    this.update = function () {
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        controls.update(delta);
        ui.update?.(delta, elapsedTime)
        playerControls.update(delta)

        activeScenes.forEach((activeScene) => {
            const sceneSubjects = scenes.get(activeScene);

            for (let i = 0; i < sceneSubjects.length; i++)
                sceneSubjects[i].update?.(delta, elapsedTime);
        });

        renderer.clear()
        renderer.render(scene, camera);
        renderer.clearDepth()
        renderer.render(uiScene, uiCamera);
    };

    this.onWindowResize = function () {
        const { width, height } = canvas;

        screenDimensions.width = width;
        screenDimensions.height = height;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        uiCamera.aspect = width / height;
        uiCamera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    this.setScene(createDefaultScene(), SCENE_DEFAULT);
}

SceneManager.gltfLoader = new GLTFLoader();

SceneManager.emit = function (name, detail, bubbles) {
    var data = {};

    if (bubbles === undefined) { bubbles = true; }
    data.bubbles = !!bubbles;
    data.detail = detail;

    document.body.dispatchEvent(new CustomEvent(name, data));
}

SceneManager.listen = function (eventName, callback, once = false) {
    document.body.addEventListener(eventName, callback,
        {
            once: once
        })
}
