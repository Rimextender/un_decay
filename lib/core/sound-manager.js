import * as THREE from "three";

export { SoundManager }

function SoundManager() {
    const listener = new THREE.AudioListener();

    // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/snd/crack.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        sound.play();
    });

    this.mount = function (camera) {
        camera.add(listener);
    }

    document.body.addEventListener('play-sound', (e) => {
        sound.play();
    })
}