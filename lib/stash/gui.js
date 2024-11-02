// @ts-nocheck

// https://lil-gui.georgealways.com/
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export function createLilGui() {
    const gui = new GUI();
    const guiData = {
        guid: 'lil-gui',
        showCollisionGeometry: true,
        isGrounded: false,
        // myFunction: function () { },
        groundDistance: 1,
    };

    window.guiData = guiData

    document.body.addEventListener('gui-add-text', e => {
        const guid = e.detail.guid;
        const data = e.detail.data;
    })

    // gui.add(guiData, 'showCollisionGeometry'); // Button
    gui.add(guiData, 'guid');
    gui.add(guiData, 'showCollisionGeometry');
    gui.add(guiData, 'isGrounded').listen();
    gui.add(guiData, 'groundDistance').listen();

    // // Add sliders to number fields by passing min and max
    // gui.add(guiData, 'myNumber', 0, 1);
    // gui.add(guiData, 'myNumber', 0, 100, 2); // snap to even numbers

    // // Create dropdowns by passing an array or object of named values
    // gui.add(guiData, 'myNumber', [0, 1, 2]);
    // gui.add(guiData, 'myNumber', { Label1: 0, Label2: 1, Label3: 2 });

    // // Chainable methods
    // gui.add(guiData, 'myProperty')
    //     .name('Custom Name')
    //     .onChange(value => {
    //         console.log(value);
    //     });

    // Create color pickers for multiple color formats
    // const colorFormats = {
    //     string: '#ffffff',
    //     int: 0xffffff,
    //     object: { r: 1, g: 1, b: 1 },
    //     array: [1, 1, 1]
    // };

    // gui.addColor(colorFormats, 'string');
}