import Utils from './Utils.js'

export default class GameObject {
	constructor(sprite) {
		this.sprite = sprite;
		this.sprite.animationSpeed = 0.1;
		this.boundingBox = {
			x: this.sprite.boundingBox ? this.x + this.sprite.boundingBox.x : this.x,
			y: this.sprite.boundingBox ? this.y + this.sprite.boundingBox.y : this.y,
			width: this.sprite.boundingBox ? this.sprite.boundingBox.width : this.width,
			height: this.sprite.boundingBox ? this.sprite.boundingBox.height : this.height
		};
	}

	set x(x) {
		this._x = x;
		this.sprite.x = Math.floor(x);
		this.boundingBox.x = this.sprite.boundingBox ? this.x + this.sprite.boundingBox.x : this.x;
	}

	get x() {
		return this.sprite.x;
	}

	set y(y) {
		this._y = y;
		this.sprite.y = Math.floor(y);
		this.boundingBox.y = this.sprite.boundingBox ? this.y + this.sprite.boundingBox.y : this.y;
	}

	get y() {
		return this.sprite.y;
	}

	get width() {
		return this.sprite.width;
	}

	get height() {
		return this.sprite.height;
	}

	set direction(direction) {
		this._direction = direction;
		this.setSpriteSequenceName();
	}

	get direction() {
		return this._direction;
	}

	set sequenceName(sequenceName) {
		this._sequenceName = sequenceName;
		this.setSpriteSequenceName()
	}

	get sequenceName() {
		return this._sequenceName;
	}

	setSpriteSequenceName() {
		if (!this.direction || !this.sequenceName)
			return;

		if (this.direction === 1)
			this.sprite.sequenceName = this._sequenceName;
		else
			this.sprite.sequenceName = this._sequenceName + 'HorizontalMirrored';
	}

	isOffScreen(level) {
		return (this.x > level.tiledMap.width) ||
			(this.x + this.width < 0) ||
			(this.y > level.tiledMap.height);
	}

	update(delta) {
		this.sprite.update(delta);
	}

	testCollision (target) {
		return Utils.testCollision(this.boundingBox, target.boundingBox);
	}
}
