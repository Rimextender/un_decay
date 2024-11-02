const PlayerPhysics = {
    baseGameSpeed: 1, //
    hDamping: 0.99,
    vDamping: 0.99,
    hWalkAcceleration: 0.5 * 100,
    vWalkAcceleration: 0.5 * 100,
    hWalkSpeedUpLimit: 1 * 50,
    vWalkSpeedUpLimit: 1 * 50,
}

const PP = PlayerPhysics;

export { PP, PlayerPhysics };