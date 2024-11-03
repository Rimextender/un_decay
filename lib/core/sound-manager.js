// @ts-nocheck
import * as THREE from "three";
import { element } from "three/webgpu";
import * as AFX from 'audio-effects';

export { SoundManager }

function SoundManager() {
    const listener = new THREE.AudioListener();
    this.listener = listener
    const sound = new THREE.Audio(listener);
    const musicPlayer = new THREE.Audio(listener);

    this.soundFilters = {}
    this.musicFilters = {}

    const basePath = 'assets/snd/';
    const sounds = {
        'crack': {
            asset: 'assets/snd/crack.mp3',
        },
        'steps': {
            asset: 'assets/snd/steps.wav',
        }
    }

    const otherSounds = [
        'alarm.wav',
        'call_progress.wav',
        'chiptune_breaking.flac',
        'chip_banging.wav',
        'confirm_chime.wav',
        'confirm_eerie.wav',
        'confirm_hightech.wav',
        'confirm_select.wav',
        'confirm_upbeat.wav',
        'crack.mp3',
        // 'door_open.aiff',
        'eerie-distant-rumbling-sound.wav',
        'eerie-metalic-noise.mp3',
        'eerie-sfx-2.wav',
        'eerie-sfx.wav',
        'error_chip.wav',
        'error_crazy.wav',
        'error_deltarune.wav',
        'gunshot_1.wav',
        'painful_hit.wav',
        'steps.wav',
        'synthetic-eerie-scream-03.flac',
        'throw_gunshot.wav',
        'wrong_number.wav',
        'reverb_1.wav',
        'reverb_2.flac',
        'reverb_3.wav',
        'reverb_4.wav',
    ]
    otherSounds.forEach(element => {
        sounds[element.split('.')[0]] = { asset: `${basePath}/${element}` }
    });

    const baseMusicPath = 'assets/music/';
    const musicTracks = {
        'decline': {
            asset: 'assets/music/decline.mp3',
        },
        'alter_me': { asset: `${baseMusicPath}/alter_me.mp3` },
        'EndlessHole': { asset: `${baseMusicPath}/EndlessHole.mp3` },
        'ok': { asset: `${baseMusicPath}/ok.mp3` },
        'v': { asset: `${baseMusicPath}/v.mp3` },
        'DLAT_REMIX': { asset: `${baseMusicPath}/DLAT_remix_instrumental.mp3` },
        'defeat': { asset: `${baseMusicPath}/defeat.ogg` }

    }

    this.sounds = sounds
    this.musicTracks = musicTracks

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

    const tremolo = new AFX.Tremolo(listener.context);
    tremolo.speed = 100; // Set the speed to 1Hz

    const flanger = new AFX.Flanger(listener.context)
    flanger.delay = 0.3
    flanger.depth = 100
    flanger.feedback = 0.3
    flanger.speed = 2

    //musicPlayer.setFilter(flanger.node)
    //musicPlayer.setFilter(null)

    this.setSoundDetune = function (value) {
        sound.setDetune(value)
    }

    this.setMusicDetune = function (value) {
        musicPlayer.setDetune(value)
    }

    this.mount = function (camera) {
        camera.add(listener);
    }

    this.setSoundFilters = function (filters) {
        this.soundFilters = {}
        const filterList = []
        for (const key in filters) {
            const element = filters[key]
            filterList.push(element)
            this.soundFilters[key] = element;
        }
        sound.setFilters(filterList)
    }

    this.setMusicFilters = function (filters) {
        this.musicFilters = {}
        const filterList = []
        for (const key in filters) {
            const element = filters[key]

            filterList.push(element.node)
            this.musicFilters[key] = element;
        }
        musicPlayer.setFilters(filterList)
    }

    this.clearFilters = function () {
        musicPlayer.setFilters(null)
        sound.setFilters(null)
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
