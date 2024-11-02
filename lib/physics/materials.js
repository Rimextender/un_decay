import * as THREE from "three";
const PhysicsMaterials = {
    wall: new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5, side: THREE.DoubleSide, }),
    floor: new THREE.MeshBasicMaterial({ color: 0x800080, transparent: true, opacity: 0.5, side: THREE.DoubleSide, }),
}

export { PhysicsMaterials }