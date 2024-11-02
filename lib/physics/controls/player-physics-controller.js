// @ts-nocheck
import {
	Controls,
	MathUtils,
	Quaternion,
	Vector3
} from 'three';
import { KeyActions, KeyboardControlsConfig } from './controls-config';
import { PlayerPhysics, PP } from './physics_config';
import * as CANNON from 'cannon-es'

export { PlayerPhysicsControls };
KeyboardControlsConfig, KeyActions

const _EPS = 0.000001;
const _changeEvent = { type: 'change' };

// TODO: implement action buffering (eg allowing jump to queue before landing)

const jumpImpulse = new CANNON.Vec3(0, 500, 0);
class PlayerPhysicsControls extends Controls {

	constructor(object, domElement = null) {

		super(object.mesh, domElement);

		this.body = object.body
		this.movementSpeed = 1.0;
		this.rollSpeed = 0.005;
		this.moveVector = new Vector3(0, 0, 0);

		this.dragToLook = false;
		this.autoForward = false;

		// internals

		this._moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
		this.frameActions = new Set()
		this.holdActions = new Set()
		this.frameReleaseActions = new Set()
		this._moveVector = new Vector3(0, 0, 0);
		this._rotationVector = new Vector3(0, 0, 0);
		this._lastQuaternion = new Quaternion();
		this._lastPosition = new Vector3();
		this._status = 0;

		// event listeners

		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this._onPointerMove = onPointerMove.bind(this);
		this._onPointerDown = onPointerDown.bind(this);
		this._onPointerUp = onPointerUp.bind(this);
		this._onPointerCancel = onPointerCancel.bind(this);
		this._onContextMenu = onContextMenu.bind(this);

		//

		if (domElement !== null) {
			this.connect();
		}

	}

	connect() {

		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);

		this.domElement.addEventListener('pointermove', this._onPointerMove);
		this.domElement.addEventListener('pointerdown', this._onPointerDown);
		this.domElement.addEventListener('pointerup', this._onPointerUp);
		this.domElement.addEventListener('pointercancel', this._onPointerCancel);
		this.domElement.addEventListener('contextmenu', this._onContextMenu);

	}

	disconnect() {

		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);

		this.domElement.removeEventListener('pointermove', this._onPointerMove);
		this.domElement.removeEventListener('pointerdown', this._onPointerDown);
		this.domElement.removeEventListener('pointerup', this._onPointerUp);
		this.domElement.removeEventListener('pointercancel', this._onPointerCancel);
		this.domElement.removeEventListener('contextmenu', this._onContextMenu);

	}

	dispose() {

		this.disconnect();

	}

	update(dt, t) {

		if (this.enabled === false) return;

		const body = this.body
		if (!body) return

		this.handleActions(t, dt);
		this.dampMoveVector(t, dt);

		return;

		const moveMult = delta * this.movementSpeed;
		const rotMult = delta * this.rollSpeed;

		object.translateX(this._moveVector.x * moveMult);
		object.translateY(this._moveVector.y * moveMult);
		object.translateZ(this._moveVector.z * moveMult);

		if (
			this._lastPosition.distanceToSquared(object.position) > _EPS ||
			8 * (1 - this._lastQuaternion.dot(object.quaternion)) > _EPS
		) {

			this.dispatchEvent(_changeEvent);
			this._lastQuaternion.copy(object.quaternion);
			this._lastPosition.copy(object.position);

		}


	}

	onKeyDown(event) {
		if (event.altKey || this.enabled === false) {
			return;
		}

		const keyPressed = event.code;
		if (KeyboardControlsConfig.has(keyPressed) && !event.repeat) {
			this.frameActions.add(KeyboardControlsConfig.get(keyPressed))
		}

		switch (event.code) {
			case 'ShiftLeft':
			case 'ShiftRight': this.movementSpeedMultiplier = .1; break;

			case 'KeyW': this._moveState.forward = 1; break;
			case 'KeyS': this._moveState.back = 1; break;

			case 'KeyA': this._moveState.left = 1; break;
			case 'KeyD': this._moveState.right = 1; break;

			case 'KeyR': this._moveState.up = 1; break;
			case 'KeyF': this._moveState.down = 1; break;

			case 'ArrowUp': this._moveState.pitchUp = 1; break;
			case 'ArrowDown': this._moveState.pitchDown = 1; break;

			case 'ArrowLeft': this._moveState.yawLeft = 1; break;
			case 'ArrowRight': this._moveState.yawRight = 1; break;

			case 'KeyQ': this._moveState.rollLeft = 1; break;
			case 'KeyE': this._moveState.rollRight = 1; break;

		}
	}

	onKeyUp(event) {
		if (this.enabled === false) return;

		const keyPressed = event.code;
		if (KeyboardControlsConfig.has(keyPressed)) {
			this.frameReleaseActions.add(KeyboardControlsConfig.get(keyPressed))
		}
	}

	handleActions(t, dt) {
		this.performFrameActions(t, dt)
		this.performHoldActions(t, dt)

		if (this.frameActions.size > 0) {
			this.holdActions.add(...this.frameActions)
		}

		if (this.frameReleaseActions.size > 0) {
			this.holdActions.delete(...this.frameReleaseActions)
			this.frameReleaseActions.clear()
		}

		this.frameActions.clear()
	}

	performFrameActions(t, dt) {
		const actions = this.frameActions;

		const body = this.body
		const moveVector = body.velocity;

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
						moveVector.z -= PlayerPhysics.vWalkAcceleration * dt * PP.baseGameSpeed;

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
					body.applyImpulse(jumpImpulse)
					break;
				case KeyActions.A_MoveRun:
					break;
				default:
					break;
			}
		});

	}

	performHoldActions(t, dt) {
		const actions = this.holdActions;
		const body = this.body
		const moveVector = body.velocity;

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

	dampMoveVector(t, dt) {
		this.body.velocity.x *= Math.pow(1 - PP.hDamping, dt * PP.baseGameSpeed)
		this.body.velocity.z *= Math.pow(1 - PP.vDamping, dt * PP.baseGameSpeed)
	}



	// private

	_updateMovementVector() {


		const forward = (this._moveState.forward || (this.autoForward && !this._moveState.back)) ? 1 : 0;

		this._moveVector.x = (- this._moveState.left + this._moveState.right);
		this._moveVector.y = (- this._moveState.down + this._moveState.up);
		this._moveVector.z = (- forward + this._moveState.back);
	}

	_updateRotationVector() {

		this._rotationVector.x = (- this._moveState.pitchDown + this._moveState.pitchUp);
		this._rotationVector.y = (- this._moveState.yawRight + this._moveState.yawLeft);
		this._rotationVector.z = (- this._moveState.rollRight + this._moveState.rollLeft);

		//console.log( 'rotate:', [ this._rotationVector.x, this._rotationVector.y, this._rotationVector.z ] );

	}

	_getContainerDimensions() {

		if (this.domElement != document) {

			return {
				size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
				offset: [this.domElement.offsetLeft, this.domElement.offsetTop]
			};

		} else {

			return {
				size: [window.innerWidth, window.innerHeight],
				offset: [0, 0]
			};

		}

	}

}



function onPointerDown(event) {

	if (this.enabled === false) return;

	if (this.dragToLook) {

		this._status++;

	} else {

		switch (event.button) {

			case 0: this._moveState.forward = 1; break;
			case 2: this._moveState.back = 1; break;

		}

		this._updateMovementVector();

	}

}

function onPointerMove(event) {

	if (this.enabled === false) return;

	if (!this.dragToLook || this._status > 0) {

		const container = this._getContainerDimensions();
		const halfWidth = container.size[0] / 2;
		const halfHeight = container.size[1] / 2;

		this._moveState.yawLeft = - ((event.pageX - container.offset[0]) - halfWidth) / halfWidth;
		this._moveState.pitchDown = ((event.pageY - container.offset[1]) - halfHeight) / halfHeight;

		this._updateRotationVector();

	}

}

function onPointerUp(event) {

	if (this.enabled === false) return;

	if (this.dragToLook) {

		this._status--;

		this._moveState.yawLeft = this._moveState.pitchDown = 0;

	} else {

		switch (event.button) {

			case 0: this._moveState.forward = 0; break;
			case 2: this._moveState.back = 0; break;

		}

		this._updateMovementVector();

	}

	this._updateRotationVector();

}

function onPointerCancel() {

	if (this.enabled === false) return;

	if (this.dragToLook) {

		this._status = 0;

		this._moveState.yawLeft = this._moveState.pitchDown = 0;

	} else {

		this._moveState.forward = 0;
		this._moveState.back = 0;

		this._updateMovementVector();

	}

	this._updateRotationVector();

}

function onContextMenu(event) {

	if (this.enabled === false) return;

	event.preventDefault();

}
