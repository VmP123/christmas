import GameObject from './GameObject.js'
import Utils from './Utils.js'

export default class Player extends GameObject {
	constructor(sprite) {
		super(sprite);

		this.sprite.animationSpeed = 0.1;
		this.acceleration = {x: 0.2, y: 0.16};
		this.maxSpeed = {x: 0.7, y: 0};
	}

    move(direction) {
		if (direction) {
			this.targetSpeed.x = this.maxSpeed.x * Math.sign(direction);
			this.direction = direction;
		} else {
			this.targetSpeed.x = 0;
		}
    }

	tryJump() {
		if (this.canJump)
			this.jump();
    }

	jump() {
		this.speed.y = -2.9;
		this.canJump = false;
	}

	respawn(x, y) {
		this.x = x;
		this.y = y;
		this.direction = 1;
		this.speed = {x: 0, y: 0};
		this.targetSpeed = {x: 0, y: 0};
		this.canJump = false;
	}

	update (delta) {
		// If has not reached the target speed
		if (this.speed.x !== this.targetSpeed.x)
		{
			const origSpeedX = this.speed.x;

			if (this.speed.x < this.targetSpeed.x)
				this.speed.x += this.acceleration.x;
			else if (this.speed.x > this.targetSpeed.x)
				this.speed.x -= this.acceleration.x;

			const hasReachedTheTargetSpeed = Math.sign(origSpeedX - this.targetSpeed.x) != Math.sign(this.speed.x - this.targetSpeed.x);
			if (hasReachedTheTargetSpeed)
				this.speed.x = this.targetSpeed.x;
		}

		this.canJump = false;

		this.speed.y += this.acceleration.y; // Gravity
		this.y = this._y + this.speed.y * delta;

		// Floor and ceiling collision
		for (let i = 0; i < this.collisionTiles.length; i++) {
			if (Utils.testCollision({x: this.boundingBox.x, y: this.boundingBox.y, height: this.boundingBox.height + 1, width: this.boundingBox.width }, this.collisionTiles[i])) {
				// Fix vertical position
				const intersectionLength = this.getCollisionDepth(this._y, this.height, this.collisionTiles[i].y, this.collisionTiles[i].height);
				this.y = Math.round(this._y - ((intersectionLength) * Math.sign(this.speed.y)));

				// Floor collision
				if (Math.sign(this.speed.y) === 1)
					this.canJump = true;

				this.speed.y = 0;

				break;
			}
		}


		this.x = this._x + this.speed.x * delta;

		// Wall collision
		for (let i = 0; i < this.collisionTiles.length; i++) {
			if (Utils.testCollision(this.boundingBox, this.collisionTiles[i])) {
				// Fix horizontal position
				let intersectionLength = this.getCollisionDepth(this.boundingBox.x, this.boundingBox.width, this.collisionTiles[i].x, this.collisionTiles[i].width);
				this.x = this._x - (intersectionLength * Math.sign(this.speed.x));

				this.speed.x = 0;

				break;
			}
		}

		this.sequenceName = this.speed.x ? 'run' : 'idle';

		this.sprite.update(delta);
	}

	getCollisionDepth(aStart, aLength, bStart, bLength) {
		if (aStart < bStart)
			return aStart + aLength - bStart;
		else
			return bStart + bLength - aStart;
	}
}
