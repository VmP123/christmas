export default class Player {
	constructor() {
		var baseTexture = PIXI.BaseTexture.fromImage('tonttu.png');
		
		var frames = [];
		frames.push(new PIXI.Texture(baseTexture, new PIXI.Rectangle(8,0,8,8)));
		frames.push(new PIXI.Texture(baseTexture, new PIXI.Rectangle(8,8,8,8)));

		this.sprite = new PIXI.extras.AnimatedSprite(frames, false);
		this.sprite.anchor.x = 0.5;
		this.sprite.gotoAndPlay(0);
		this.sprite.animationSpeed = 0.1;
		
		this.direction = 1;
		this.speed = {x: 0, y: 0};
		this.targetSpeed = {x: 0, y: 0};
		this.acceleration = {x: 0.2, y: 0.16} ;
		this.maxSpeed = {x: 0.7, y: 0};
		this.speed.y += 0.16;

		this.x = 60;
		this.y = 96;
		this.width = 8;
		this.height = 8;
		this.canJump = true;
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
		this.sprite.scale.x = direction;
	}
	
	get direction() {
		return this._direction;
	}
    
    move(direction) {
        this.targetSpeed.x = this.maxSpeed.x * Math.sign(direction);
        this.direction = direction;
    }

	tryJump() {
		if (this.canJump)
			this.jump();
    }
    
	jump() {
		this.speed.y = -2.9;
		this.canJump = false;
	}
	
	update (delta) {
		if (this.speed.x !== this.targetSpeed.x)
		{
			var origSpeedX = this.speed.x;
		
			if (this.speed.x < this.targetSpeed.x)
				this.speed.x += this.acceleration.x;
			else if (this.speed.x > this.targetSpeed.x)
				this.speed.x -= this.acceleration.x;
			
			if (Math.sign(origSpeedX - this.targetSpeed.x) != Math.sign(this.speed.x - this.targetSpeed.x))
				this.speed.x = this.targetSpeed.x;
		}

		this.speed.y += this.acceleration.y; // Gravity
		this.y = this._y + this.speed.y * delta;
		for (var i = 0; i < this.collisionTiles.length; i++) {
			if (this.testCollision({x: this.x, y: this.y, height: this.height + 1, width: this.width }, this.collisionTiles[i])) {
				var intersectionLength = this.getCollisionDepth(this._y, this.height, this.collisionTiles[i].y, this.collisionTiles[i].height);
				this.y = this._y - ((intersectionLength) * Math.sign(this.speed.y));

				// Floor collision
				if (Math.sign(this.speed.y) === 1)
					this.canJump = true;

				this.speed.y = 0;

				break;
			}
		}

		this.x = this._x + this.speed.x * delta;
		for (var i = 0; i < this.collisionTiles.length; i++) {
			if (this.testCollision(this, this.collisionTiles[i])) {
				var intersectionLength = this.getCollisionDepth(this.x, this.width, this.collisionTiles[i].x, this.collisionTiles[i].width);
				this.x = this._x - (intersectionLength * Math.sign(this.speed.x));
				this.speed.x = 0;
				break;
			}
		}

		// Play running animation
		if (this.speed.x !== 0) {
			this.sprite.update(delta);
		}
	}

	isOnFloor() {
		return false;
	}

	testCollision(a, b) {
		return (a.x < b.x + b.width && 
			a.x + a.width > b.x &&
			a.y < b.y + b.height && 
			a.y + a.height > b.y);
	}

	getCollisionDepth(aStart, aLength, bStart, bLength) {
		if (aStart < bStart)
			return aStart + aLength - bStart;
		else
			return bStart + bLength - aStart;
	}
}
