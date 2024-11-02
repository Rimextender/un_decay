import { KeyCodes, Keys } from "./keycodes";

const KeyActions = {
    // implemented
    A_SanityBeep: 'A_MoveJump',
    A_Continue: 'A_MoveRun',
    // unimplemented
    A_MoveRunToggle: 'A_MoveRunToggle',

}

const KeyboardControlsConfig = new Map([
    [KeyCodes.KeyX, KeyActions.A_SanityBeep],
    [KeyCodes.KeyE, KeyActions.A_Continue],
])

export { KeyboardControlsConfig, KeyActions };