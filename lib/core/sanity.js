// @ts-nocheck
import * as THREE from "three";
import ANIME from 'animejs/lib/anime.es.js';
import { SoundManager } from "./sound-manager";
import { GuiHud } from "./ui";
import * as AFX from 'audio-effects';
import { SceneManager } from "./scene-manager";
import { HallwayScene } from "../scenes/hallway";
import { EndRoom } from "../scenes/room";

export { SanityMeter }

function SanityMeter() {
    const mesh = new THREE.Group();
    this.mesh = mesh
    this.timer = 0
    this.sanity = 100
    this.cycles = 0
    this.errors = 0
    this.lastCheckCycle = 0
    this.gameLevel = 0
    this.cutscenePlaying = false

    this.sanityLevel = 0
    this.oldSanityLevel = -1

    this.enabled = false
    this.activePath = null
    this.activePoints = null
    const greenBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.15), new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }))
    const redBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.07), new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 }))
    const blueBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.8 }))

    const path = new THREE.Path();
    const scale = 0.3
    const size = 1
    path.lineTo(0, size);
    path.lineTo(0, size);
    path.lineTo(size, size);
    path.lineTo(size, 0);
    path.closePath()

    let currentPathTime = 0

    this.activePath = path

    const points = path.getPoints();
    this.activePoints = points
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });

    let line = new THREE.Line(geometry, material);
    line.position.x -= size / 2
    line.position.y -= size / 2
    mesh.add(line);
    mesh.scale.set(scale, scale, scale)
    line.add(blueBeacon)

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

    const minOffset = 0.1;

    this.placeBead = function (point) {
        const clone = greenBeacon.clone()
        clone.position.x = point.x
        clone.position.y = point.y
        clone.position.z = 0
        point.mesh = clone
        line.add(clone)
    }

    this.createPoints = function (amount = 4, startOffset = 0.1) {
        const pointsIndex = Math.floor(Math.random() * (this.gameLevel == 0 ? 3 : SanityPath.easy.length))

        const pathConfig = SanityPath.easy[pointsIndex]
        const path = pathConfig.create()
        path.closePath()
        this.activePath = path

        const points = path.getPoints();
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });

        line.geometry = geometry

        let pathPos

        pathPos = path.getPoint(0);
        blueBeacon.position.set(pathPos.x, pathPos.y, 0)
        if (pathConfig.points.length > 0) {
            pathConfig.points.forEach(offset => {
                pathPos = path.getPoint(offset);
                this.activePoints.push(pathPos)
                this.placeBead(pathPos)
            });
        } else {
            let offset = startOffset
            for (let i = 0; i < amount; i++) {
                offset = offset + 0.05 + Math.random() * 0.4
                offset = offset % 1
                pathPos = path.getPoint(offset);
                this.activePoints.push(pathPos)
                this.placeBead(pathPos)
            }
        }



        //mesh.remove(line);
        // line = new THREE.Line(geometry, material);
        // line.position.x -= size / 2
        // line.position.y -= size / 2
        //mesh.add(line);
    }


    this.checkClear = function () {
        if (this.activePoints.length > 0) {
            this.errors += 1
            this.sanity -= Math.log(this.errors) * 2.5;
            this.sanity = THREE.MathUtils.clamp(this.sanity, 0, 100)
            GuiHud.instance.setValue('sanity', 'sanity', this.sanity / 100)
            SoundManager.instance.playSound('painful_hit', false, 0.3)
        } else {
            this.onClear()
        }

    }

    this.onClear = function () {
        SoundManager.instance.playSound('confirm_upbeat')
        this.createPoints()
    }

    this.doBeep = function () {
        var pathPos = this.activePath.getPoint(currentPathTime);
        let pointHit
        this.activePoints.forEach((point, index) => {
            const dist = point.distanceTo(pathPos)

            if (dist < 0.2) {
                pointHit = point
                this.activePoints.splice(index, 1);
                pointHit.mesh.visible = false
            }
        });

        if (pointHit) {
            this.sanity += 1
            SoundManager.instance.playSound('crack')
        } else {
            this.errors += 1;
            this.sanity -= Math.log(this.errors) * 2.5;
            SoundManager.instance.playSound('error_chip')
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
        this.sanity = THREE.MathUtils.clamp(this.sanity, 0, 100)
        GuiHud.instance.setValue('sanity', 'sanity', this.sanity / 100)
    }

    this.onLoad = function () {
    }

    this.setBPM = function (BPM) {
        this.bpm = BPM
        this.beatDuration = 60 / BPM
    }

    this.checkSanity = function () {
        this.sanityLevel = Math.round((100 - this.sanity) / 20)

        if (this.sanityLevel != this.oldSanityLevel) {
            SceneManager.emit('sanity-level-change', this.sanityLevel)
            const listener = SoundManager.instance.listener

            switch (this.sanityLevel) {
                case 0:
                    SoundManager.instance.setMusicFilters([])
                    break;
                case 1:
                    // const reverb = new AFX.Reverb(listener.context, SoundManager.instance.sounds['reverb_1'].buffer);
                    // reverb.wet = 0.8;
                    // reverb.level = 0.3;
                    // fetch('assets/snd/reverb_4.wav')
                    //     .then(response => response.arrayBuffer())
                    //     .then(buffer => {
                    //         reverb.buffer = buffer;
                    //     });


                    const flanger2 = new AFX.Flanger(listener.context)
                    flanger2.delay = 0.1
                    flanger2.depth = 5
                    flanger2.feedback = 0.3
                    flanger2.speed = 5
                    SoundManager.instance.setMusicFilters({
                        'flang': flanger2,
                    })

                    break;
                case 2:
                    const flanger1 = new AFX.Flanger(listener.context)
                    flanger1.delay = 0.1
                    flanger1.depth = 10
                    flanger1.feedback = 0.3
                    flanger1.speed = this.beatDuration
                    SoundManager.instance.setMusicFilters({
                        'flang': flanger1,
                    })
                    break;
                case 3:
                    const flanger3 = new AFX.Flanger(listener.context)
                    flanger3.delay = 0.3
                    flanger3.depth = 100
                    flanger3.feedback = 0.8
                    flanger3.speed = 0.3
                    const distortion2 = new AFX.Distortion(listener.context)
                    distortion2.intensity = 15; // Set the intensity to 200
                    distortion2.gain = 1.5; // Set the gain to 100
                    distortion2.lowPassFilter = true; // Enable the lowpass filter
                    const tremolo3 = new AFX.Tremolo(listener.context);
                    tremolo3.speed = this.beatDuration; // Set the speed to 1Hz
                    SoundManager.instance.setMusicFilters({ 'trem': tremolo3, 'flanger': flanger3, 'dist': distortion2, })
                    break;
                case 4:
                    const tremolo0 = new AFX.Tremolo(listener.context);
                    tremolo0.speed = this.beatDuration * 8; // Set the speed to 1Hz
                    const flanger0 = new AFX.Flanger(listener.context)
                    flanger0.delay = 0.3
                    flanger0.depth = 10
                    flanger0.feedback = 0.8
                    flanger0.speed = this.beatDuration
                    SoundManager.instance.setMusicFilters({ 'trem': tremolo0, 'flang': flanger0 })
                    break;
                case 5:
                    const flanger = new AFX.Flanger(listener.context)
                    flanger.delay = 0.3
                    flanger.depth = 100
                    flanger.feedback = 0.8
                    flanger.speed = 2
                    const distortion = new AFX.Distortion(listener.context)
                    distortion.intensity = 30; // Set the intensity to 200
                    distortion.gain = 2; // Set the gain to 100
                    distortion.lowPassFilter = true; // Enable the lowpass filter
                    const tremolo = new AFX.Tremolo(listener.context);
                    tremolo.speed = 0.1; // Set the speed to 1Hz
                    SoundManager.instance.setMusicFilters({ 'trem': tremolo, 'flanger': flanger, 'dist': distortion, })
                    break;
                default:
                    break;
            }
        }

        switch (this.sanityLevel) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                SoundManager.instance.setMusicDetune(0)
                break;
            case 4:
                SoundManager.instance.setMusicDetune(Math.random() * (100) - 200)
                break;
            case 5:
                const flang = SoundManager.instance.musicFilters['flanger']
                flang.delay = 0.1 + Math.random() * 0.6
                flang.depth = Math.random() * 4 * 10
                flang.feedback = Math.random() * 0.8
                flang.speed = Math.random() * 2
                const tremolo = SoundManager.instance.musicFilters['trem']
                tremolo.speed = Math.random() * 3; // Set the speed to 1Hz
                SoundManager.instance.setMusicDetune(Math.random() * (300) - 600)
                break;
            default:
                break;
        }

    }

    this.endLevel0 = function () {
        this.cutscenePlaying = true
        this.gameLevel = 1
        this.setBPM(130 / 4)
        this.timer = 0;
        this.cycles = 0
        this.errors = 0
        this.sanity = 100
        ANIME({
            targets: this,
            sanity: [0, 100],
            round: 1,

            change: (anim) => {
                const t = anim.progress / 100;

                GuiHud.instance.setValue('sanity', 'sanity', this.sanity / 100)
            },
            complete: () => {
                this.cutscenePlaying = false
                GuiHud.instance.showTip(`Go!`, 'tip-go', 300)

            },
            easing: "easeOutQuad",
            duration: (this.beatDuration * 4 * 1000) * 0.9,
        });

        SoundManager.instance.playMusic('ok')
    }

    this.endLevel1 = function () {
        this.cutscenePlaying = true
        this.gameLevel = 2
        this.setBPM(128 / 4)
        this.timer = 0;
        this.cycles = 0
        this.errors = 0
        this.sanity = 100
        ANIME({
            targets: this,
            sanity: [0, 100],
            round: 1,

            change: (anim) => {
                const t = anim.progress / 100;

                GuiHud.instance.setValue('sanity', 'sanity', this.sanity / 100)
            },
            complete: () => {
                this.cutscenePlaying = false
                GuiHud.instance.showTip(`Go!`, 'tip-go', 300)

            },
            easing: "easeOutQuad",
            duration: (this.beatDuration * 4 * 1000) * 0.9,
        });

        SoundManager.instance.playMusic('alter_me')
    }

    this.endLevel2 = function () {
        this.gameLevel = 3
        SceneManager.instance.hideScene(HallwayScene.sceneName)
        SceneManager.instance.setScene(new EndRoom(), EndRoom.sceneName)
        SoundManager.instance.playMusic('defeat')
        GuiHud.instance.loadPreset(GuiPreset.liveReaction)
    }

    this.update = function (dt, t) {
        if (!this.enabled) return
        this.timer += dt

        this.cycles = Math.floor(this.timer / this.beatDuration)

        currentPathTime = (this.timer % this.beatDuration) / this.beatDuration

        if (!this.cutscenePlaying)
            if (currentPathTime > 0.9 && this.lastCheckCycle != this.cycles) {
                this.lastCheckCycle = this.cycles
                this.checkClear()
                this.checkSanity()
            }

        var pos = this.activePath.getPoint(currentPathTime);

        beacon.position.x = pos.x;
        beacon.position.y = pos.y;
        beacon.position.z = 0;

        switch (this.gameLevel) {
            case 0:
                if (this.timer > 142) {
                    this.endLevel0()
                }
                break;
            case 1:
                if (this.timer > 75) {
                    this.endLevel1()
                }
                break;
            case 2:
                if (this.timer > 127) {
                    this.endLevel2()
                }
            default:
                break;
        }

    };

    this.setBPM(180 / 8)
}

const xmul = 0.005
const ymul = 0.005
const xoff = 0;
const yoff = 0;
const scale = 0.3
const size = 1

const SanityPath = {
    easy: [
        {
            create: function () {
                const ctx = new THREE.Path();
                ctx.moveTo(349 * xmul + xoff, 87 * ymul + yoff);
                ctx.bezierCurveTo(369 * xmul + xoff, 87 * ymul + yoff, 622 * xmul + xoff, 108 * ymul + yoff, 602 * xmul + xoff, 108 * ymul + yoff)
                ctx.bezierCurveTo(582 * xmul + xoff, 108 * ymul + yoff, 497 * xmul + xoff, 237 * ymul + yoff, 477 * xmul + xoff, 237 * ymul + yoff)
                ctx.bezierCurveTo(457 * xmul + xoff, 237 * ymul + yoff, 240 * xmul + xoff, 233 * ymul + yoff, 220 * xmul + xoff, 233 * ymul + yoff)
                ctx.bezierCurveTo(200 * xmul + xoff, 233 * ymul + yoff, 163 * xmul + xoff, 81 * ymul + yoff, 143 * xmul + xoff, 81 * ymul + yoff)

                return ctx;
            },
            points: [
                0.25, 0.5, 0.75
            ],
            amount: 4,
        },
        {
            create: function () {
                const ctx = new THREE.Path();
                ctx.moveTo(90 * xmul + xoff, 70 * ymul + yoff);
                ctx.bezierCurveTo(70 * xmul + xoff, 70 * ymul + yoff, 193 * xmul + xoff, 202 * ymul + yoff, 173 * xmul + xoff, 202 * ymul + yoff)
                ctx.bezierCurveTo(153 * xmul + xoff, 202 * ymul + yoff, 285 * xmul + xoff, 72 * ymul + yoff, 265 * xmul + xoff, 72 * ymul + yoff)
                ctx.bezierCurveTo(245 * xmul + xoff, 72 * ymul + yoff, 329 * xmul + xoff, 209 * ymul + yoff, 309 * xmul + xoff, 209 * ymul + yoff)
                ctx.bezierCurveTo(289 * xmul + xoff, 209 * ymul + yoff, 443 * xmul + xoff, 89 * ymul + yoff, 423 * xmul + xoff, 89 * ymul + yoff)
                return ctx;
            },
            points: [
                0.125,
                0.25, 0.5, 0.625, 0.75
            ],
            amount: 4,
        },
        {
            create: function () {
                const ctx = new THREE.Path();
                ctx.moveTo(338 * xmul + xoff, 68 * ymul + yoff);
                ctx.bezierCurveTo(318 * xmul + xoff, 68 * ymul + yoff, 92 * xmul + xoff, 70 * ymul + yoff, 72 * xmul + xoff, 70 * ymul + yoff)
                ctx.bezierCurveTo(52 * xmul + xoff, 70 * ymul + yoff, 77 * xmul + xoff, 263 * ymul + yoff, 57 * xmul + xoff, 263 * ymul + yoff)
                ctx.bezierCurveTo(37 * xmul + xoff, 263 * ymul + yoff, 168 * xmul + xoff, 425 * ymul + yoff, 148 * xmul + xoff, 425 * ymul + yoff)
                ctx.bezierCurveTo(128 * xmul + xoff, 425 * ymul + yoff, 303 * xmul + xoff, 318 * ymul + yoff, 283 * xmul + xoff, 318 * ymul + yoff)
                ctx.bezierCurveTo(263 * xmul + xoff, 318 * ymul + yoff, 409 * xmul + xoff, 420 * ymul + yoff, 389 * xmul + xoff, 420 * ymul + yoff)
                ctx.bezierCurveTo(369 * xmul + xoff, 420 * ymul + yoff, 699 * xmul + xoff, 295 * ymul + yoff, 679 * xmul + xoff, 295 * ymul + yoff)
                ctx.bezierCurveTo(659 * xmul + xoff, 295 * ymul + yoff, 886 * xmul + xoff, 243 * ymul + yoff, 866 * xmul + xoff, 243 * ymul + yoff)
                ctx.bezierCurveTo(846 * xmul + xoff, 243 * ymul + yoff, 605 * xmul + xoff, 59 * ymul + yoff, 585 * xmul + xoff, 59 * ymul + yoff)
                return ctx;
            },
            points: [
                0.125,
                0.25, 0.5, 0.625, 0.75
            ],
            amount: 4,
        }, {
            create: function () {
                const ctx = new THREE.Path();
                ctx.moveTo(119 * xmul + xoff, 68 * ymul + yoff);
                ctx.bezierCurveTo(99 * xmul + xoff, 68 * ymul + yoff, 186 * xmul + xoff, 307 * ymul + yoff, 166 * xmul + xoff, 307 * ymul + yoff)
                ctx.bezierCurveTo(146 * xmul + xoff, 307 * ymul + yoff, 402 * xmul + xoff, 56 * ymul + yoff, 382 * xmul + xoff, 56 * ymul + yoff)
                ctx.bezierCurveTo(362 * xmul + xoff, 55.99999999999999 * ymul + yoff, 457 * xmul + xoff, 300 * ymul + yoff, 437 * xmul + xoff, 300 * ymul + yoff)
                ctx.bezierCurveTo(417 * xmul + xoff, 300 * ymul + yoff, 653 * xmul + xoff, 85 * ymul + yoff, 633 * xmul + xoff, 85 * ymul + yoff)
                ctx.bezierCurveTo(613 * xmul + xoff, 85 * ymul + yoff, 789 * xmul + xoff, 316 * ymul + yoff, 769 * xmul + xoff, 316 * ymul + yoff)
                ctx.bezierCurveTo(749 * xmul + xoff, 316 * ymul + yoff, 905 * xmul + xoff, 109 * ymul + yoff, 885 * xmul + xoff, 109 * ymul + yoff)
                ctx.bezierCurveTo(865 * xmul + xoff, 109 * ymul + yoff, 448 * xmul + xoff, 10 * ymul + yoff, 428 * xmul + xoff, 10 * ymul + yoff)
                ctx.bezierCurveTo(408 * xmul + xoff, 9.999999999999996 * ymul + yoff, 193 * xmul + xoff, 38 * ymul + yoff, 173 * xmul + xoff, 38 * ymul + yoff)
                return ctx;
            },
            points: [
                0.125,
                0.25, 0.5, 0.625, 0.75
            ],
            amount: 4,
        }, {
            create: function () {
                const ctx = new THREE.Path();
                ctx.moveTo(76 * xmul + xoff, 149 * ymul + yoff);
                ctx.bezierCurveTo(56 * xmul + xoff, 149 * ymul + yoff, 95 * xmul + xoff, 361 * ymul + yoff, 75 * xmul + xoff, 361 * ymul + yoff)
                ctx.bezierCurveTo(55 * xmul + xoff, 361 * ymul + yoff, 59 * xmul + xoff, 263 * ymul + yoff, 39 * xmul + xoff, 263 * ymul + yoff)
                ctx.bezierCurveTo(19 * xmul + xoff, 263 * ymul + yoff, 180 * xmul + xoff, 178 * ymul + yoff, 160 * xmul + xoff, 178 * ymul + yoff)
                ctx.bezierCurveTo(140 * xmul + xoff, 178 * ymul + yoff, 300 * xmul + xoff, 235 * ymul + yoff, 280 * xmul + xoff, 235 * ymul + yoff)
                ctx.bezierCurveTo(260 * xmul + xoff, 235 * ymul + yoff, 217 * xmul + xoff, 315 * ymul + yoff, 197 * xmul + xoff, 315 * ymul + yoff)
                ctx.bezierCurveTo(177 * xmul + xoff, 315 * ymul + yoff, 277 * xmul + xoff, 130 * ymul + yoff, 257 * xmul + xoff, 130 * ymul + yoff)
                ctx.bezierCurveTo(237 * xmul + xoff, 130 * ymul + yoff, 664 * xmul + xoff, 232 * ymul + yoff, 644 * xmul + xoff, 232 * ymul + yoff)
                ctx.bezierCurveTo(624 * xmul + xoff, 232 * ymul + yoff, 489 * xmul + xoff, 358 * ymul + yoff, 469 * xmul + xoff, 358 * ymul + yoff)
                return ctx;
            },
            points: [
                0.125,
                0.25, 0.5, 0.625, 0.75
            ],
            amount: 4,
        }, {
            create: function () {
                const ctx = new THREE.Path();
                ctx.moveTo(471 * xmul + xoff, 126 * ymul + yoff);
                ctx.bezierCurveTo(451 * xmul + xoff, 126 * ymul + yoff, 495 * xmul + xoff, 158 * ymul + yoff, 475 * xmul + xoff, 158 * ymul + yoff)
                ctx.bezierCurveTo(455 * xmul + xoff, 158 * ymul + yoff, 436 * xmul + xoff, 154 * ymul + yoff, 416 * xmul + xoff, 154 * ymul + yoff)
                ctx.bezierCurveTo(396 * xmul + xoff, 154 * ymul + yoff, 440 * xmul + xoff, 69 * ymul + yoff, 420 * xmul + xoff, 69 * ymul + yoff)
                ctx.bezierCurveTo(400 * xmul + xoff, 69 * ymul + yoff, 701 * xmul + xoff, 69 * ymul + yoff, 681 * xmul + xoff, 69 * ymul + yoff)
                ctx.bezierCurveTo(661 * xmul + xoff, 69 * ymul + yoff, 688 * xmul + xoff, 202 * ymul + yoff, 668 * xmul + xoff, 202 * ymul + yoff)
                ctx.bezierCurveTo(648 * xmul + xoff, 202 * ymul + yoff, 346 * xmul + xoff, 247 * ymul + yoff, 326 * xmul + xoff, 247 * ymul + yoff)
                ctx.bezierCurveTo(306 * xmul + xoff, 247 * ymul + yoff, 311 * xmul + xoff, 31 * ymul + yoff, 291 * xmul + xoff, 31 * ymul + yoff)
                ctx.bezierCurveTo(271 * xmul + xoff, 30.999999999999996 * ymul + yoff, 748 * xmul + xoff, 25 * ymul + yoff, 728 * xmul + xoff, 25 * ymul + yoff)
                ctx.bezierCurveTo(708 * xmul + xoff, 24.999999999999996 * ymul + yoff, 759 * xmul + xoff, 338 * ymul + yoff, 739 * xmul + xoff, 338 * ymul + yoff)
                ctx.bezierCurveTo(719 * xmul + xoff, 338 * ymul + yoff, 465 * xmul + xoff, 366 * ymul + yoff, 445 * xmul + xoff, 366 * ymul + yoff)
                return ctx;
            },
            points: [
                0.125,
                0.25, 0.5, 0.625, 0.75
            ],
            amount: 4,
        }, {
            create: function () {
                const ctx = new THREE.Path();
                ctx.moveTo(394 * xmul + xoff, 332 * ymul + yoff);
                ctx.bezierCurveTo(374 * xmul + xoff, 332 * ymul + yoff, 302 * xmul + xoff, 223 * ymul + yoff, 282 * xmul + xoff, 223 * ymul + yoff)
                ctx.bezierCurveTo(262 * xmul + xoff, 223 * ymul + yoff, 312 * xmul + xoff, 171 * ymul + yoff, 292 * xmul + xoff, 171 * ymul + yoff)
                ctx.bezierCurveTo(272 * xmul + xoff, 171 * ymul + yoff, 341 * xmul + xoff, 148 * ymul + yoff, 321 * xmul + xoff, 148 * ymul + yoff)
                ctx.bezierCurveTo(301 * xmul + xoff, 148 * ymul + yoff, 378 * xmul + xoff, 181 * ymul + yoff, 358 * xmul + xoff, 181 * ymul + yoff)
                ctx.bezierCurveTo(338 * xmul + xoff, 181 * ymul + yoff, 402 * xmul + xoff, 209 * ymul + yoff, 382 * xmul + xoff, 209 * ymul + yoff)
                ctx.bezierCurveTo(362 * xmul + xoff, 209 * ymul + yoff, 436 * xmul + xoff, 187 * ymul + yoff, 416 * xmul + xoff, 187 * ymul + yoff)
                ctx.bezierCurveTo(396 * xmul + xoff, 187 * ymul + yoff, 460 * xmul + xoff, 158 * ymul + yoff, 440 * xmul + xoff, 158 * ymul + yoff)
                ctx.bezierCurveTo(420 * xmul + xoff, 158 * ymul + yoff, 501 * xmul + xoff, 156 * ymul + yoff, 481 * xmul + xoff, 156 * ymul + yoff)
                ctx.bezierCurveTo(461 * xmul + xoff, 156 * ymul + yoff, 522 * xmul + xoff, 186 * ymul + yoff, 502 * xmul + xoff, 186 * ymul + yoff)
                ctx.bezierCurveTo(482 * xmul + xoff, 186 * ymul + yoff, 511 * xmul + xoff, 236 * ymul + yoff, 491 * xmul + xoff, 236 * ymul + yoff)
                ctx.bezierCurveTo(471 * xmul + xoff, 236 * ymul + yoff, 480 * xmul + xoff, 295 * ymul + yoff, 460 * xmul + xoff, 295 * ymul + yoff)
                ctx.bezierCurveTo(440 * xmul + xoff, 295 * ymul + yoff, 440 * xmul + xoff, 320 * ymul + yoff, 420 * xmul + xoff, 320 * ymul + yoff)
                return ctx;
            },
            points: [
                0.125,
                0.25, 0.5, 0.625, 0.75
            ],
            amount: 4,
        },
    ]
}