// @ts-nocheck
import * as THREE from "three";

export { SanityMeter }

function SanityMeter() {
    const mesh = new THREE.Group();
    this.mesh = mesh

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial())
    mesh.add(beacon)

    const greenBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.15), new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }))
    const redBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.07), new THREE.MeshBasicMaterial())

    const path = new THREE.Path();
    const size = 3
    path.lineTo(0, size);
    path.lineTo(0, size);
    path.lineTo(size, size);
    path.lineTo(size, 0);
    path.lineTo(0, 0);

    const points = path.getPoints();
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });

    const line = new THREE.Line(geometry, material);
    mesh.add(line);

    points.forEach(point => {
        const clone = greenBeacon.clone()
        clone.position.x = point.x
        clone.position.y = point.y
        line.add(clone)
    });

    this.mount = function (scene) {
        scene.add(mesh)
    }

    this.onLoad = function () {

    }

    this.update = function (dt, t) {
        var pos = path.getPoint((t % 5) / 5);

        beacon.position.x = pos.x;
        beacon.position.y = pos.y;
        beacon.position.z = 0;

    };
}

