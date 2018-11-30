import * as PIXI from 'pixi.js';
import Enemy from './Enemy.js'
import Collectible from './Collectible.js'

export default class Level {
	constructor(tiledFile) {
		this.tiledFile = tiledFile;
	}

	load() {
		return new Promise((resolve) => {
			// Is already loaded?
			if (PIXI.loader.resources[this.tiledFile]) {
				this.setLevelObjects(false);
				resolve();
			} else {
				PIXI.loader.add(this.tiledFile).load(() => {
					this.setLevelObjects(true);
					resolve();
				});
			}
		});
	}

	setLevelObjects(fixPositions) {
		this.tiledMap = new PIXI.extras.TiledMap(this.tiledFile);
		const tilePoints = this.getTilePointsByLayer(this.tiledMap, 'Ground');

		this.collisionTiles = tilePoints.map(function (tp) {
			return { x: tp.x * this.tiledMap.tileWidth, y: tp.y * this.tiledMap.tileHeight, width: this.tiledMap.tileWidth, height: this.tiledMap.tileHeight }
		}.bind(this));

		const objects = this.getObjects();
		if (fixPositions) {
			objects.forEach(o => {
				this.fixPosition(o);
			});
		}

		this.startObject = objects.find(function (o) {
			return o.type === 'start';
		});
		this.enemyObjects = objects.filter(function (o) {
			return o.type === 'enemy';
		});
		this.collectibleObjects = objects.filter(function (o) {
			return o.type === 'collectible';
		});
	}

	getObjects() {
		const layer = this.tiledMap.layers.find(function (layer) {
			return layer.name === 'Objects';
		})
		return layer.objects;
	}

	fixPosition(gameObject) {
		gameObject.y -= this.tiledMap.tileHeight;
		gameObject.x -= this.tiledMap.tileWidth * 0.5;
	}

	getTilePointsByLayer(tiledMap, name) {
		const points = [];

		const layer = tiledMap.layers.find(function (layer) {
			return layer.name === name;
		})

		layer.tiles.forEach(function (tile, index) {
			if (tile != null && index < layer.map.width * layer.map.height)
				points.push({x: index % tiledMap._width, y: Math.floor(index / tiledMap._width)});
		});

		return points;
	}

	set spriteManager(spriteManager) {
		this._spriteManager = spriteManager;

		this.collectibles = [];
		this.collectibleObjects.forEach(co => {
			const collectible = new Collectible(spriteManager.createExtendedAnimatedSprite('big_present'))
			collectible.x = co.x;
			collectible.y = co.y;

			this.collectibles.push(collectible);
		});

		this.enemies = [];
		this.enemyObjects.forEach(co => {
			const enemy = new Enemy(spriteManager.createExtendedAnimatedSprite('enemy'));
			enemy.startX = co.x;
			enemy.y = co.y;
			enemy.radius = +co.properties.radius;

			this.enemies.push(enemy);
		});
	}
}
