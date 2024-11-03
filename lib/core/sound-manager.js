// @ts-nocheck
import * as THREE from "three";
import { element } from "three/webgpu";

export { SoundManager }

function SoundManager() {
    const listener = new THREE.AudioListener();
    const sound = new THREE.Audio(listener);
    const musicPlayer = new THREE.Audio(listener);

    const sounds = {
        'crack': {
            asset: 'assets/snd/crack.mp3',
        },
        'steps': {
            asset: 'assets/snd/steps.wav',
        }
    }

    const musicTracks = {
        'decline': {
            asset: 'assets/music/decline.mp3',
        },

    }

    const audioLoader = new THREE.AudioLoader();
    for (const key in sounds) {
        const element = sounds[key]
        audioLoader.load(element.asset, (buffer) => {
            element.buffer = buffer
        });
    }
    for (const key in musicTracks) {
        const element = musicTracks[key]
        audioLoader.load(element.asset, (buffer) => {
            element.buffer = buffer
        });
    }

    this.mount = function (camera) {
        camera.add(listener);
    }

    this.playSound = function (name, loop = false, volume = 0.5) {
        if (!name in sounds) return;
        sound.setBuffer(sounds[name].buffer);
        sound.setLoop(loop);
        sound.setVolume(volume);
        if (sound.isPlaying) sound.stop()
        sound.play();
    }

    this.playMusic = function (name, loop = true, volume = 0.5) {
        if (!name in musicTracks) return;
        musicPlayer.setBuffer(musicTracks[name].buffer);
        musicPlayer.setLoop(loop);
        musicPlayer.setVolume(volume);
        if (musicPlayer.isPlaying) musicPlayer.stop()
        musicPlayer.play();
    }

    document.body.addEventListener('play-sound', (e) => {
        const name = e.detail.name;
        const loop = e.detail.loop;
        const volume = e.detail.volume;

        this.playSound(name, loop, volume)
    })

    document.body.addEventListener('play-music', (e) => {
        const name = e.detail.name;
        const loop = e.detail.loop;
        const volume = e.detail.volume;

        this.playMusic(name, loop, volume)
    })
}
