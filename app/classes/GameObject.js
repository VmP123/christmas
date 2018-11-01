import Utils from './Utils.js'

export default class GameObject {
	constructor(imagePath, width, height, row, frameCount) {
		var baseTexture = PIXI.BaseTexture.fromImage(imagePath);

		this.width = width;
		this.height = height;

		var frames = [];
		for (var i = 0; i < frameCount; i++) {
			frames.push(new PIXI.Texture(baseTexture, new PIXI.Rectangle(i * width, row * height, width, height)));
		}

		this.sprite = new PIXI.extras.AnimatedSprite(frames, false);
		this.sprite.gotoAndPlay(0);
		this.sprite.animationSpeed = 0.1;
	}
	
	set x(x) {
		this._x = x;
		this.sprite.x = Math.floor(x);
	}

	get x() {
		return this.sprite.x;
	}

	set y(y) {
		this._y = y;
		this.sprite.y = Math.floor(y);
	}

	get y() {
		return this.sprite.y;
	}

	set direction(direction) {
		this._direction = direction;
		this.sprite.textures.forEach(function (texture) {
			texture.rotate = direction == 1 ? 0 : 12;
		});
	}
	
	get direction() {
		return this._direction;
	}
	
	update(delta) {
		this.sprite.update(delta);
	}
	
	testCollision (target) {
		return Utils.testCollision(this, target);
	}
}
