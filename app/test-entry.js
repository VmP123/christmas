import './test.html';
import * as PIXI from 'pixi.js';
import TestLevel from './classes/TestLevel.js';
import Player from './classes/Player.js';
import SpriteManager from './classes/SpriteManager.js';
import {STATE} from './enums.js';

/**
 * TestGame - Yksinkertaistettu peliversio editorin kentän testaamiseen
 */
class TestGame {
	constructor() {
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		this.init();
	}

	gameLoop(delta) {
		if (this.state !== STATE.GAMEON)
			return;

		this.player.update(delta);

		if (this.player.isOffScreen(this.level))
			this.player.respawn(this.level.startObject.x, this.level.startObject.y);

		for (let i = this.level.collectibles.length - 1; i >= 0; i--) {
			const collectible = this.level.collectibles[i];
			collectible.update(delta);
			if (collectible.testCollision(this.player)) {
				this.app.stage.removeChild(collectible.sprite);
				this.level.collectibles.splice(i, 1);
				if (this.level.collectibles.length === 0) {
					this.showMessage('Kenttä läpäisty!');
					return;
				}
			}
		}

		this.level.enemies.forEach(enemy => {
			enemy.update(delta);
			if (enemy.testCollision(this.player))
				this.player.respawn(this.level.startObject.x, this.level.startObject.y);
		});
	}

	onKeyDown(key) {
		if (key.keyCode === 27) { // ESC
			this.closeTest();
			return;
		}
		if (key.keyCode === 37)
			this.player.move(-1);
		else if (key.keyCode === 39)
			this.player.move(1);
		else if (key.keyCode === 38)
			this.player.tryJump();
	}

	onKeyUp(key) {
		if (key.keyCode === 37 && this.player.direction === -1)
			this.player.move(0);
		else if (key.keyCode === 39 && this.player.direction === 1)
			this.player.move(0);
	}

	init() {
		const loader = new PIXI.loaders.Loader();
		loader.add('config', 'config.json');
		this.spriteManager = new SpriteManager('sprites.json');

		Promise.all([
			new Promise(resolve => loader.load(resolve)),
			this.spriteManager.load()
		]).then(() => {
			this.config = loader.resources.config.data;

			this.applicationWidth = this.config.tileWidth * this.config.horizontalTileCount * this.config.scale;
			this.applicationHeight = this.config.tileHeight * this.config.verticalTileCount * this.config.scale;

			this.app = new PIXI.Application(this.applicationWidth, this.applicationHeight);
			this.app.stage.scale.x = this.config.scale;
			this.app.stage.scale.y = this.config.scale;
			document.getElementById('game-container').appendChild(this.app.view);

			document.addEventListener('keydown', this.onKeyDown.bind(this));
			document.addEventListener('keyup', this.onKeyUp.bind(this));
			document.getElementById('closeBtn').addEventListener('click', () => this.closeTest());

			this.app.ticker.add(delta => {
				this.gameLoop(delta);
			});

			this.loadLevel();
		}).catch(err => {
			this.showError('Virhe latauksen aikana: ' + err.message);
		});
	}

	loadLevel() {
		this.state = STATE.LOADING;
		this.level = new TestLevel();
		
		this.level.load()
			.then(() => this.startLevel())
			.catch(err => {
				this.showError('Kentän lataus epäonnistui: ' + err.message);
			});
	}

	startLevel() {
		this.level.spriteManager = this.spriteManager;

		this.app.stage.addChild(this.level.tiledMap);
		this.level.collectibles.forEach(collectible => this.app.stage.addChild(collectible.sprite));
		this.level.enemies.forEach(enemy => this.app.stage.addChild(enemy.sprite));

		if (this.level.startObject) {
			this.player = new Player(this.spriteManager.createExtendedAnimatedSprite('player'));
			this.player.collisionTiles = this.level.collisionTiles;
			this.player.respawn(this.level.startObject.x, this.level.startObject.y);
			this.app.stage.addChild(this.player.sprite);
		} else {
			this.showError('Kentästä puuttuu aloituspiste (Start)!');
			return;
		}

		this.state = STATE.GAMEON;
		document.getElementById('status').textContent = 'Testipeli käynnissä - ESC = sulje';
	}

	showMessage(msg) {
		this.state = STATE.LEVELCOMPLETED;
		document.getElementById('status').textContent = msg;
	}

	showError(msg) {
		this.state = STATE.LOADING;
		document.getElementById('status').textContent = 'Virhe: ' + msg;
		document.getElementById('status').style.color = '#e94560';
	}

	closeTest() {
		window.close();
	}
}

new TestGame();
