// @ts-nocheck
import {
	Controls,
	MathUtils,
	Quaternion,
	Vector3
} from 'three';
import { KeyActions, KeyboardControlsConfig } from './controls-config';
import { PlayerPhysics, PP } from './physics_config';
import * as THREE from 'three';
import { SceneManager } from '../../core/scene-manager';
import { SoundManager } from '../../core/sound-manager';
import { SanityMeter } from '../../core/sanity';

export { PlayerControls };
KeyboardControlsConfig, KeyActions

const _EPS = 0.000001;
const _changeEvent = { type: 'change' };

// TODO: implement action buffering (eg allowing jump to queue before landing)

class PlayerControls extends Controls {

	constructor(object, domElement = null) {

		super(object.mesh, domElement);
		const mesh = object.mesh
		this.rollSpeed = 0.005;
		this.moveVector = new Vector3(0, 0, 0);

		this.dragToLook = false;
		this.autoForward = false;

		this.frameActions = new Set()
		this.holdActions = new Set()
		this.frameReleaseActions = new Set()

		// event listeners

		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this._onContextMenu = onContextMenu.bind(this);

		//

		if (domElement !== null) {
			this.connect();
		}

	}

	connect() {
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
		this.domElement.addEventListener('contextmenu', this._onContextMenu);
	}
	disconnect() {
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
		this.domElement.removeEventListener('contextmenu', this._onContextMenu);
	}
	dispose() {
		this.disconnect();
	}

	update(dt, t) {
		if (this.enabled === false) return;

		this.handleActions(dt, t);
		return;
	}

	onKeyDown(event) {
		if (event.altKey || this.enabled === false) {
			return;
		}

		const keyPressed = event.code;
		if (KeyboardControlsConfig.has(keyPressed) && !event.repeat) {
			this.frameActions.add(KeyboardControlsConfig.get(keyPressed))
		}
	}

	onKeyUp(event) {
		if (this.enabled === false) return;

		const keyPressed = event.code;
		if (KeyboardControlsConfig.has(keyPressed)) {
			this.frameReleaseActions.add(KeyboardControlsConfig.get(keyPressed))
		}
	}

	handleActions(dt, t) {
		this.performFrameActions(dt, t)
		this.performHoldActions(dt, t)

		if (this.frameActions.size > 0) {
			this.holdActions.add(...this.frameActions)
		}

		if (this.frameReleaseActions.size > 0) {
			this.holdActions.delete(...this.frameReleaseActions)
			this.frameReleaseActions.clear()
		}

		this.frameActions.clear()
	}

	performFrameActions(dt, t) {
		const actions = this.frameActions;
		const moveVector = this.moveVector;

		actions.forEach(action => {
			switch (action) {
				case KeyActions.A_SanityBeep:
					SanityMeter.instance.doBeep()
					break;
				case KeyActions.A_Continue:
					SceneManager.emit('player-continue')
					break;
				case KeyActions.A_Start:
					SceneManager.emit('player-start')
					break;
				default:
					break;
			}
		});
	}

	performHoldActions(dt, t) {
		const actions = this.holdActions;
		const moveVector = this.moveVector;

		actions.forEach(action => {
			switch (action) {
				case KeyActions.A_MoveX:
					if (moveVector.x < PlayerPhysics.hWalkSpeedUpLimit) {
						moveVector.x += PlayerPhysics.hWalkAcceleration * dt * PP.baseGameSpeed;
						MathUtils.clamp(moveVector.x, Number.NEGATIVE_INFINITY, PP.hWalkSpeedUpLimit)
					}
					break;
				case KeyActions.A_MoveXn:
					if (moveVector.x > -PlayerPhysics.hWalkSpeedUpLimit) {
						moveVector.x -= PlayerPhysics.hWalkAcceleration * dt * PP.baseGameSpeed;
						MathUtils.clamp(moveVector.x, PP.hWalkSpeedUpLimit, Number.POSITIVE_INFINITY)
					}
					break;
				case KeyActions.A_MoveYn:
					if (moveVector.z < PlayerPhysics.vWalkSpeedUpLimit) {
						moveVector.z += PlayerPhysics.vWalkAcceleration * dt * PP.baseGameSpeed;
						MathUtils.clamp(moveVector.z, Number.NEGATIVE_INFINITY, PP.vWalkSpeedUpLimit)
					}
					break;
				case KeyActions.A_MoveY:
					if (moveVector.z > -PlayerPhysics.vWalkSpeedUpLimit) {
						moveVector.z -= PlayerPhysics.vWalkAcceleration * dt * PP.baseGameSpeed;
						MathUtils.clamp(moveVector.z, PP.vWalkSpeedUpLimit, Number.POSITIVE_INFINITY)
					}
					break;
				case KeyActions.A_MoveJump:
					break;
				case KeyActions.A_MoveRun:
					break;
				default:
					break;
			}
		});
	}

	dampMoveVector(dt, t) {
		this.moveVector.x *= Math.pow(1 - PP.hDamping, dt * PP.baseGameSpeed)
		if (Math.abs(this.moveVector.x) < 0.001) this.moveVector.x = 0
		this.moveVector.z *= Math.pow(1 - PP.vDamping, dt * PP.baseGameSpeed)
		if (Math.abs(this.moveVector.z) < 0.001) this.moveVector.z = 0
	}
}

function onContextMenu(event) {
	if (this.enabled === false) return;
	event.preventDefault();
}
