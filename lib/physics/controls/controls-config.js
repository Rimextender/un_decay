// @ts-nocheck
import { KeyCodes, Keys } from "./keycodes";

const KeyActions = {
    // implemented
    A_SanityBeep: 'A_SanityBeep',
    A_Continue: 'A_Continue',
    A_Start: 'A_Start',
    // unimplemented
    A_MoveRunToggle: 'A_MoveRunToggle',

}

const KeyboardControlsConfig = new Map([
    [KeyCodes.KeyX, KeyActions.A_SanityBeep],
    [KeyCodes.KeyE, KeyActions.A_Continue],
    [KeyCodes.Enter, KeyActions.A_Start],
])

const KeyNames = new Map([
    [KeyCodes.KeyX, 'X'],
    [KeyCodes.Enter, 'Enter'],
])


KeyboardControlsConfig.getKeyOf = function (actionName) {
    const actionKey = Array.from(this.entries()).find(
        ([key, action]) => action === actionName
    );
    if (actionKey)
        return actionKey[0]
}

export { KeyboardControlsConfig, KeyActions, KeyNames };