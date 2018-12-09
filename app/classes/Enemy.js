import GameObject from './GameObject.js'

export default class Enemy extends GameObject {
	constructor(sprite) {
		super(sprite);
		this.speed = 0.25;
		this.sequenceName = 'walk';
		this.direction = 1;
	}

	update(delta) {
		this.x = this._x + this.speed * delta;

		if (this.x > this.maxX) {
			this.speed *= -1;
			this.direction *= -1;
			this.x = this.maxX;
		} else if (this.x < this.minX) {
			this.speed *= -1;
			this.direction *= -1;
			this.x = this.minX;
		}

		super.update(delta);
	}

	set radius(radius) {
		this._radius = radius;
		this.minX = this.x - radius;
		this.maxX = this.x + radius;
	}

	get radius() {
		return this._radius;
	}
}
