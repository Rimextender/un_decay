// interesting find:
// cells of a cube 4 x 4 x 4 can easily be represent by base 4 number system
// i.e. cell 0 is 000
// cell on second layer at 0, 2 is 102 (yzx)

import * as THREE from 'three';


function generateComplex() {
    let scene = new THREE.Group();
    let rooms = []
    let indexMap = new Map()

    const side = 4;
    const size = side * side * side
    const instancedMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial(), size)
    let matrix = new THREE.Matrix4()
    for (let i = 0; i < size; i++) {
        const x = i % side;
        const y = Math.floor(i / (side * side))
        const z = Math.floor((i % (side * side)) / side)
        instancedMesh.getMatrixAt(i, matrix)
        matrix.setPosition(
            x * 10,
            y * 10,
            z * 10,
        );
        instancedMesh.setMatrixAt(i, matrix);
        indexMap[`${y}${z}${x}`] = i
    }

    instancedMesh.getMatrixAt(indexMap['333'], matrix)
    matrix.scale(new THREE.Vector3(4, 4, 4))
    instancedMesh.setMatrixAt(indexMap['333'], matrix);

    scene.add(instancedMesh)

    return scene
}

export { generateComplex }