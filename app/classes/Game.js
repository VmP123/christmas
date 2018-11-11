import * as PIXI from 'pixi.js';
import 'pixi-tiledmap';

import Player from './Player.js'
import Level from './Level.js'
import SpriteManager from './SpriteManager.js'

export default class Game {
	constructor() {
		this.scale = 5;	
		this.tileWidth = 8;
		this.tileHeight = 8;
		this.horizontalTileCount = 16;
		this.verticalTileCount = 16;
		this.width = this.tileWidth * this.horizontalTileCount * this.scale;
		this.height = this.tileHeight * this.verticalTileCount * this.scale;

		this.init();
	}

	gameLoop(delta) {
		this.player.update(delta)

		if (this.isOffScreen(this.player))
			this.player.respawn(this.level.startObject.x, this.level.startObject.y);
		
		for (var i = this.level.collectibles.length - 1; i >= 0; i--) {
			var collectible = this.level.collectibles[i];
			
			collectible.update(delta);
			if (collectible.testCollision(this.player)) {
				this.app.stage.removeChild(collectible.sprite);
				this.level.collectibles.splice(i, 1);
			}
		};

		this.level.enemies.forEach(enemy => {
			enemy.update(delta)
			if (enemy.testCollision(this.player))
				this.player.respawn(this.level.startObject.x, this.level.startObject.y);
		});
	}

	isOffScreen(gameObject) {
		return (gameObject.x > this.level.tiledMap.width) ||
			(gameObject.x + gameObject.width < 0) ||
			(gameObject.y > this.level.tiledMap.height);
	}

	onKeyDown(key) {
		if (key.keyCode === 37)
			this.player.move(-1);
		if (key.keyCode === 39)
			this.player.move(1);
		if (key.keyCode === 38)
			this.player.tryJump();
	}
	
	onKeyUp(key) {
		if (key.keyCode === 37 && this.player.direction === -1)
			this.player.move(0);
		if (key.keyCode === 39 && this.player.direction === 1)
			this.player.move(0);
	}	
	
	setScale(scale) {
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		this.app.stage.scale.x = scale;
		this.app.stage.scale.y = scale;
	}

	init() {
		this.app = new PIXI.Application(this.width, this.height);
		document.body.appendChild(this.app.view);	
		this.setScale(this.scale);

		this.level = new Level('Joulu.tmx');
		this.spriteManager = new SpriteManager('sprites.json');
		Promise.all([
			this.spriteManager.load(),
			this.level.load()
		]).then(() => {
			this.level.spriteManager = this.spriteManager;

			this.app.stage.addChild(this.level.tiledMap);
			this.level.collectibles.forEach(collectibe => this.app.stage.addChild(collectibe.sprite) );
			this.level.enemies.forEach(enemy => this.app.stage.addChild(enemy.sprite));

			this.player = new Player(this.spriteManager.createExtendedAnimatedSprite('player'));
			this.player.collisionTiles = this.level.collisionTiles;
			this.player.respawn(this.level.startObject.x, this.level.startObject.y);
			this.app.stage.addChild(this.player.sprite);

			document.addEventListener('keydown', this.onKeyDown.bind(this));
			document.addEventListener('keyup', this.onKeyUp.bind(this));

			this.app.ticker.add(delta => {
				this.gameLoop(delta);
			});
		});
	}
}
