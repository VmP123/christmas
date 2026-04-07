import * as PIXI from 'pixi.js';

export default class TileMap extends PIXI.Container {
	constructor(mapData, resourcePath) {
		super();
		
		this.mapData = mapData;
		this._width = mapData.width;
		this._height = mapData.height;
		this.tileWidth = mapData.tileWidth;
		this.tileHeight = mapData.tileHeight;
		this.resourcePath = resourcePath;
		
		// Create map dimensions
		this.width = this.mapData.width * this.tileWidth;
		this.height = this.mapData.height * this.tileHeight;
		
		// Store layers for later access
		this.layers = this.mapData.layers.filter(layer => layer.type !== 'objectgroup');
		
		this.createTilesets();
		this.renderLayers();
	}

	createTilesets() {
		this.tileTextures = {};
		
		this.mapData.tilesets.forEach(tileset => {
			const imagePath = this.resourcePath + tileset.image;
			const baseTexture = PIXI.loader.resources[imagePath].texture.baseTexture;
			
			// Create texture for each tile in the tileset
			for (let i = 0; i < tileset.tileCount; i++) {
				const gid = tileset.firstGid + i;
				const column = i % tileset.columns;
				const row = Math.floor(i / tileset.columns);
				
				const x = column * tileset.tileWidth;
				const y = row * tileset.tileHeight;
				
				const rect = new PIXI.Rectangle(x, y, tileset.tileWidth, tileset.tileHeight);
				this.tileTextures[gid] = new PIXI.Texture(baseTexture, rect);
			}
		});
	}

	renderLayers() {
		this.layers.forEach(layer => {
			if (!layer.visible || !layer.tiles) return;
			
			const layerContainer = new PIXI.Container();
			layerContainer.name = layer.name;
			
			for (let i = 0; i < layer.tiles.length; i++) {
				const gid = layer.tiles[i];
				if (gid === null || gid === 0) continue;
				
				const texture = this.tileTextures[gid];
				if (!texture) {
					console.warn(`Texture not found for gid: ${gid}`);
					continue;
				}
				
				const sprite = new PIXI.Sprite(texture);
				const x = (i % layer.width) * this.tileWidth;
				const y = Math.floor(i / layer.width) * this.tileHeight;
				
				sprite.x = x;
				sprite.y = y;
				
				layerContainer.addChild(sprite);
			}
			
			this.addChild(layerContainer);
		});
	}
}
