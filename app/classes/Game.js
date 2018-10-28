import * as PIXI from 'pixi.js';
import 'pixi-tiledmap';

import Player from './Player.js'

export default class Game {
	constructor() {
		this.width = 640;
		this.height = 640;
		this.scale = 5;
		this.init();
	}

	gameLoop(delta) {
		this.player.update(delta)
	}

	getTilePointsByLayer(tiledMap, name) {
		var points = [];
		
		tiledMap.layers.find(function (layer) {
			return layer.name == name;
		}).tiles.forEach(function (tile, index) {
			if (tile != null)
				points.push({x: index % tiledMap._width, y: Math.floor(index / tiledMap._width)});
		});
		
		return points;
	}

	onKeyDown(key) {
		if (key.keyCode == 37)
			this.player.move(-1);
		if (key.keyCode == 39)
			this.player.move(1);
		if (key.keyCode == 38)
			this.player.tryJump();
	}
	
	onKeyUp(key) {
		if (key.keyCode == 37 && this.player.direction == -1)
			this.player.targetSpeed.x = 0;
		if (key.keyCode == 39 && this.player.direction == 1)
			this.player.targetSpeed.x = 0;
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

		this.player = new Player();
		
		PIXI.loader
			.add('Joulu.tmx')
			.load(() => {
				var tiledMap = new PIXI.extras.TiledMap('Joulu.tmx');
				var tilePoints = this.getTilePointsByLayer(tiledMap, 'Ground');
				
				this.collisionTiles = tilePoints.map(function (tp) {
					return { x: tp.x * tiledMap.tileWidth, y: tp.y * tiledMap.tileHeight, width: tiledMap.tileWidth, height: tiledMap.tileHeight }
				});
				
				this.player.collisionTiles = this.collisionTiles;

				this.app.stage.addChild(tiledMap);
				this.app.stage.addChild(this.player.sprite);
				
				document.addEventListener('keydown', this.onKeyDown.bind(this));
				document.addEventListener('keyup', this.onKeyUp.bind(this));
				
				this.app.ticker.add(function(delta) {
					this.gameLoop(delta);
				}.bind(this));
			});
	}
}