import * as PIXI from 'pixi.js';
import Enemy from './Enemy.js'
import Collectible from './Collectible.js'
import TmxParser from './TmxParser.js'
import TileMap from './TileMap.js'

export default class Level {
	constructor(tiledFile) {
		this.tiledFile = tiledFile;
		this.resourcePath = tiledFile.substring(0, tiledFile.lastIndexOf('/') + 1);
		if (this.resourcePath === '') {
			this.resourcePath = './';
		}
	}

	load() {
		return new Promise((resolve) => {
			// Check if TMX is already loaded
			const needsToLoadTmx = !PIXI.loader.resources[this.tiledFile];
			
			if (needsToLoadTmx) {
				// Load TMX file first
				PIXI.loader.add(this.tiledFile, this.tiledFile, { 
					loadType: PIXI.loaders.Resource.LOAD_TYPE.XHR, 
					xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.TEXT 
				});
				
				PIXI.loader.load(() => {
					// Now parse TMX to get tileset images
					this.loadTilesetImages(resolve, true);
				});
			} else {
				// TMX already loaded, just load any missing tilesets
				this.loadTilesetImages(resolve, false);
			}
		});
	}

	loadTilesetImages(resolve, fixPositions) {
		// Parse TMX data to get tileset information
		const tmxData = PIXI.loader.resources[this.tiledFile].data;
		const mapData = TmxParser.parse(tmxData);
		
		// Collect all tileset image paths that need to be loaded
		const tilesetPaths = [];
		mapData.tilesets.forEach(tileset => {
			if (tileset.image) {
				const imagePath = this.resourcePath + tileset.image;
				if (!PIXI.loader.resources[imagePath]) {
					tilesetPaths.push(imagePath);
				}
			}
		});
		
		// Load any missing tilesets
		if (tilesetPaths.length > 0) {
			tilesetPaths.forEach(path => {
				PIXI.loader.add(path, path);
			});
			
			PIXI.loader.load(() => {
				this.setLevelObjects(fixPositions);
				resolve();
			});
		} else {
			// All tilesets already loaded
			this.setLevelObjects(fixPositions);
			resolve();
		}
	}

	setLevelObjects(fixPositions) {
		// Parse TMX data
		const tmxData = PIXI.loader.resources[this.tiledFile].data;
		this.mapData = TmxParser.parse(tmxData);
		
		// Create tile map
		this.tiledMap = new TileMap(this.mapData, this.resourcePath);
		
		// Get collision tiles from Ground layer
		const tilePoints = this.getTilePointsByLayer('Ground');

		this.collisionTiles = tilePoints.map(function (tp) {
			return { 
				x: tp.x * this.tiledMap.tileWidth, 
				y: tp.y * this.tiledMap.tileHeight, 
				width: this.tiledMap.tileWidth, 
				height: this.tiledMap.tileHeight 
			}
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
		const layer = this.mapData.layers.find(function (layer) {
			return layer.name === 'Objects' && layer.type === 'objectgroup';
		});
		return layer ? layer.objects : [];
	}

	fixPosition(gameObject) {
		gameObject.y -= this.tiledMap.tileHeight;
		gameObject.x -= this.tiledMap.tileWidth * 0.5;
	}

	getTilePointsByLayer(name) {
		const points = [];

		const layer = this.mapData.layers.find(function (layer) {
			return layer.name === name;
		});
		
		if (!layer || !layer.tiles) return points;

		layer.tiles.forEach(function (tile, index) {
			if (tile != null && index < layer.width * layer.height) {
				points.push({
					x: index % layer.width, 
					y: Math.floor(index / layer.width)
				});
			}
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
			enemy.x = co.x;
			enemy.y = co.y;
			enemy.radius = +co.properties.radius;

			this.enemies.push(enemy);
		});
	}
}
