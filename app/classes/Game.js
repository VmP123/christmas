import * as PIXI from 'pixi.js';
import 'pixi-tiledmap';

import Player from './Player.js'
import Enemy from './Enemy.js'
import Collectible from './Collectible.js'

export default class Game {
	constructor() {
		this.spriteWidth = 8
		this.spriteHeight = 8
		this.width = 640;
		this.height = 640;
		this.scale = 5;
		this.init();
	}

	gameLoop(delta) {
		this.player.update(delta)

		if (this.isOffScreen(this.player))
			this.player.respawn(this.startObject.x, this.startObject.y);
		
		for (var i = this.collectibles.length - 1; i >= 0; i--) {
			var collectible = this.collectibles[i];
			
			collectible.update(delta);
			if (collectible.testCollision(this.player)) {
				this.app.stage.removeChild(collectible.sprite);
				this.collectibles.splice(i, 1);
			}
		};

		this.enemies.forEach(function (enemy) {
			enemy.update(delta)
			if (enemy.testCollision(this.player))
				this.player.respawn(this.startObject.x, this.startObject.y);
		}.bind(this));
	}

	isOffScreen(gameObject) {
		return (gameObject.x > this.tiledMap.width) ||
			(gameObject.x + gameObject.width < 0) ||
			(gameObject.y > this.tiledMap.height);
	}

	getTilePointsByLayer(tiledMap, name) {
		var points = [];
		
		var layer = tiledMap.layers.find(function (layer) {
			return layer.name === name;
		})
		
		layer.tiles.forEach(function (tile, index) {
			if (tile != null && index < layer.map.width * layer.map.height)
				points.push({x: index % tiledMap._width, y: Math.floor(index / tiledMap._width)});
		});
		
		return points;
	}

	getObjects(tiledMap, name) {
		var layer = tiledMap.layers.find(function (layer) {
			return layer.name === name;
		})
		return layer.objects;
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
			this.player.targetSpeed.x = 0;
		if (key.keyCode === 39 && this.player.direction === 1)
			this.player.targetSpeed.x = 0;
	}	
	
	setScale(scale) {
		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		this.app.stage.scale.x = scale;
		this.app.stage.scale.y = scale;
	}

	fixPosition(gameObject) {
		gameObject.y -= this.spriteHeight;
		gameObject.x -= this.spriteWidth * 0.5;
	}
	
	init() {
		this.app = new PIXI.Application(this.width, this.height);
		document.body.appendChild(this.app.view);	
		this.setScale(this.scale);

		this.player = new Player();
		
		PIXI.loader
			.add('Joulu.tmx')
			.load(() => {
				this.tiledMap = new PIXI.extras.TiledMap('Joulu.tmx');
				var tilePoints = this.getTilePointsByLayer(this.tiledMap, 'Ground');

				this.collisionTiles = tilePoints.map(function (tp) {
					return { x: tp.x * this.tiledMap.tileWidth, y: tp.y * this.tiledMap.tileHeight, width: this.tiledMap.tileWidth, height: this.tiledMap.tileHeight }
				}.bind(this));
				
				var objects = this.getObjects(this.tiledMap, 'Objects');
				objects.forEach(function (o) {
					this.fixPosition(o);
				}.bind(this));

				this.startObject = objects.find(function (o) {
					return o.type === 'start';
				});
				this.enemyObjects = objects.filter(function (o) {
					return o.type === 'enemy';
				});
				this.collectibleObjects = objects.filter(function (o) {
					return o.type === 'collectible';
				});

				this.player.collisionTiles = this.collisionTiles;
				this.player.respawn(this.startObject.x, this.startObject.y);

				this.app.stage.addChild(this.tiledMap);
				this.app.stage.addChild(this.player.sprite);

				this.collectibles = [];
				this.collectibleObjects.forEach(function (co) {
					var collectible = new Collectible('collectible.png', this.spriteWidth, this.spriteHeight, 0, 1);
					collectible.x = co.x;
					collectible.y = co.y;
					this.app.stage.addChild(collectible.sprite);
					
					this.collectibles.push(collectible);
				}.bind(this));
				
				this.enemies = [];
				this.enemyObjects.forEach(function (co) {
					var enemy = new Enemy('enemy.png', this.spriteWidth, this.spriteHeight, 0, 2);
					enemy.startX = co.x;
					enemy.y = co.y;
					enemy.radius = +co.properties.radius;
					this.app.stage.addChild(enemy.sprite);
					
					this.enemies.push(enemy);
				}.bind(this));
				
				document.addEventListener('keydown', this.onKeyDown.bind(this));
				document.addEventListener('keyup', this.onKeyUp.bind(this));
				
				this.app.ticker.add(function(delta) {
					this.gameLoop(delta);
				}.bind(this));
			});
	}
}
