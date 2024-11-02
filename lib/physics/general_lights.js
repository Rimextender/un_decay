import * as THREE from "three";

const OBJ_NAME = 'GeneralLights'
function GeneralLights() {
    const mesh = new THREE.Group()
    mesh.name = OBJ_NAME
    this.mesh = mesh;
    const light = new THREE.AmbientLight("#222222", 50);
    this.mesh.add(light)

    this.update = function (dt) {
    };
}
export { GeneralLights }