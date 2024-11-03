// @ts-nocheck
import * as THREE from "three";
import ANIME from 'animejs/lib/anime.es.js';
import { SoundManager } from "./sound-manager";

export { SanityMeter }

function SanityMeter() {
    const mesh = new THREE.Group();
    this.mesh = mesh

    this.enabled = false

    const greenBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.15), new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }))
    const redBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.07), new THREE.MeshBasicMaterial())

    const path = new THREE.Path();
    const scale = 0.3
    const size = 1
    path.lineTo(0, size);
    path.lineTo(0, size);
    path.lineTo(size, size);
    path.lineTo(size, 0);
    path.closePath()

    let currentPathTime = 0

    const points = path.getPoints();
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });

    const line = new THREE.Line(geometry, material);
    line.position.x -= size / 2
    line.position.y -= size / 2
    mesh.add(line);
    mesh.scale.set(scale, scale, scale)

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial())
    line.add(beacon)

    points.splice(0, 1)
    points.pop()
    points.forEach(point => {
        const clone = greenBeacon.clone()
        clone.position.x = point.x
        clone.position.y = point.y
        point.mesh = clone
        line.add(clone)
    });

    this.mount = function (scene) {
        scene.add(mesh)
    }

    this.onLoad = function () {

    }

    this.doBeep = function () {
        var pathPos = path.getPoint(currentPathTime);
        let pointHit
        points.forEach((point, index) => {
            const dist = point.distanceTo(pathPos)
            if (dist < 0.1) {
                pointHit = point
                points.splice(index, 1);
            }

        });
        if (pointHit) {
            SoundManager.instance.playSound('crack')
            pointHit.mesh.visible = false
        } else {
            SoundManager.instance.playSound('steps')
        }
        beacon.scale.set(2, 2, 2)
        ANIME({
            targets: [beacon.scale],
            x: `1`,
            y: `1`,
            z: `1`,
            easing: "easeOutQuad",
            duration: 150,
        });
    }

    this.update = function (dt, t) {
        if (!this.enabled) return
        currentPathTime = (t % 5) / 5
        var pos = path.getPoint(currentPathTime);

        beacon.position.x = pos.x;
        beacon.position.y = pos.y;
        beacon.position.z = 0;
    };
}

