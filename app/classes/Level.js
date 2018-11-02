import Enemy from './Enemy.js'
import Collectible from './Collectible.js'

export default class Level {
	constructor(tiledFile) {
		this.tiledFile = tiledFile;
		this.spriteWidth = 8;
		this.spriteHeight = 8;
	}

	load() {
		return new Promise((resolve, reject) => {
			PIXI.loader.add(this.tiledFile).load(() => {
				this.tiledMap = new PIXI.extras.TiledMap(this.tiledFile);
				var tilePoints = this.getTilePointsByLayer(this.tiledMap, 'Ground');
	
				this.collisionTiles = tilePoints.map(function (tp) {
					return { x: tp.x * this.tiledMap.tileWidth, y: tp.y * this.tiledMap.tileHeight, width: this.tiledMap.tileWidth, height: this.tiledMap.tileHeight }
				}.bind(this));
				
				var objects = this.getObjects(this.tiledMap, 'Objects');
				objects.forEach(o => {
					this.fixPosition(o);
				});
	
				this.startObject = objects.find(function (o) {
					return o.type === 'start';
				});
				this.enemyObjects = objects.filter(function (o) {
					return o.type === 'enemy';
				});
				this.collectibleObjects = objects.filter(function (o) {
					return o.type === 'collectible';
				});
	
				this.collectibles = [];
				this.collectibleObjects.forEach(co => {
					var collectible = new Collectible('collectible.png', this.spriteWidth, this.spriteHeight, 0, 1);
					collectible.x = co.x;
					collectible.y = co.y;
					
					this.collectibles.push(collectible);
				});
				
				this.enemies = [];
				this.enemyObjects.forEach(co => {
					var enemy = new Enemy('enemy.png', this.spriteWidth, this.spriteHeight, 0, 2);
					enemy.startX = co.x;
					enemy.y = co.y;
					enemy.radius = +co.properties.radius;
					
					this.enemies.push(enemy);
				});

				resolve();
			});
		});
	}

	getObjects(tiledMap, name) {
		var layer = tiledMap.layers.find(function (layer) {
			return layer.name === name;
		})
		return layer.objects;
	}

	fixPosition(gameObject) {
		gameObject.y -= this.spriteHeight;
		gameObject.x -= this.spriteWidth * 0.5;
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
}
