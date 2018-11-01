import GameObject from './GameObject.js'

export default class Enemy extends GameObject {
	constructor(imagePath, width, height, row, frameCount) {
		super(imagePath, width, height, row, frameCount);
		this.speed = 0.25;
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
	
	set startX(startX) {
		this._startX = startX;
		this._x = startX;
	}
	
	get startX() {
		return this._startX;
	}
	
	get minX() {
		return this.startX - this.radius;
	}

	get maxX() {
		return this.startX + this.radius;
	}
}
