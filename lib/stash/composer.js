import { EffectComposer, HalftonePass, OutputPass, RenderPass } from "three/examples/jsm/Addons.js";

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
// * 		Shape (1 = Dot, 2 = Ellipse, 3 = Line, 4 = Square)
// *		Blending Mode (1 = Linear, 2 = Multiply, 3 = Add, 4 = Lighter, 5 = Darker)
const halftonePass = new HalftonePass(scene, camera,
    {
        shape: 1,
        radius: 0.3,
        rotateR: 0,
        rotateB: 0,
        rotateG: 0,
        scatter: 0,
        blending: 1,
        blendingMode: 1,
        greyscale: false,
        disable: false,
    }
);
composer.addPass(halftonePass);

const outputPass = new OutputPass();
composer.addPass(outputPass);