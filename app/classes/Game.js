import * as PIXI from 'pixi.js';
import 'pixi-tiledmap';

import Player from './Player.js'
import Level from './Level.js'
import SpriteManager from './SpriteManager.js'
import Config from './Config.js'
import {STATE} from '../enums.js'

export default class Game {
	constructor() {
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST; // scaling does not work correctly if set later
		this.init();
	}

	gameLoop(delta) {
		if (this.state !== STATE.GAMEON)
			return;

		this.player.update(delta)

		if (this.isOffScreen(this.player))
			this.player.respawn(this.level.startObject.x, this.level.startObject.y);

		for (let i = this.level.collectibles.length - 1; i >= 0; i--) {
			const collectible = this.level.collectibles[i];

			collectible.update(delta);
			if (collectible.testCollision(this.player)) {
				this.app.stage.removeChild(collectible.sprite);
				this.level.collectibles.splice(i, 1);
				if (this.level.collectibles.length === 0)
					this.completeLevel();
					return;
			}
		}

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
		this.app.stage.scale.x = scale;
		this.app.stage.scale.y = scale;
	}

	init() {
		this.config = new Config('config.json');
		this.levelId = 0;
		this.spriteManager = new SpriteManager('sprites.json');

		this.levels = ['01.tmx', '02.tmx', '03.tmx', '04.tmx'];

		Promise.all([
			this.config.load(),
			this.spriteManager.load(),
			this.loadLevel(this.levelId)
		]).then(() => {
			this.applicationWidth = this.config.tileWidth * this.config.horizontalTileCount * this.config.scale;
			this.applicationHeight = this.config.tileHeight * this.config.verticalTileCount * this.config.scale;

			this.app = new PIXI.Application(this.applicationWidth, this.applicationHeight);
			this.setScale(this.config.scale);
			document.body.appendChild(this.app.view);

			this.startLevel();

			document.addEventListener('keydown', this.onKeyDown.bind(this));
			document.addEventListener('keyup', this.onKeyUp.bind(this));

			this.app.ticker.add(delta => {
				this.gameLoop(delta);
			});
		});
	}

	completeLevel() {
		this.state = this.LEVELCOMPLETED;
		this.app.stage.removeChildren();
		this.levelId = (this.levelId + 1) % this.levels.length;
		this.loadLevel(this.levelId).then(() => this.startLevel());
	}

	loadLevel(id) {
		this.state = STATE.LOADING;
		const levelFile = this.levels[id];
		this.level = new Level(levelFile);
		return this.level.load();
	}

	startLevel() {
		this.level.spriteManager = this.spriteManager;

		this.app.stage.addChild(this.level.tiledMap);
		this.level.collectibles.forEach(collectibe => this.app.stage.addChild(collectibe.sprite) );
		this.level.enemies.forEach(enemy => this.app.stage.addChild(enemy.sprite));

		this.player = new Player(this.spriteManager.createExtendedAnimatedSprite('player'));
		this.player.collisionTiles = this.level.collisionTiles;
		this.player.respawn(this.level.startObject.x, this.level.startObject.y);
		this.app.stage.addChild(this.player.sprite);

		this.state = STATE.GAMEON;
	}
}
