import * as PIXI from 'pixi.js';

export default class SpriteManager {
	constructor(spritePackFile) {
		this.spritePackFile = spritePackFile;
	}
	
	load() {
		return new Promise((resolve, reject) => {
			PIXI.loader.add('spritePack', this.spritePackFile).load((loader) => {
				this.spritePack = loader.resources.spritePack.data;
				var imageNames = [...new Set(Object.keys(this.spritePack.sprites).map(key => this.spritePack.sprites[key].image))];
				
				imageNames.forEach(function (imageName) {
					PIXI.loader.add(imageName, imageName);
				});
				
			})
		})
	}
	
	createSprite(spriteName) {
		// Palautetaan ExtendedAnimatedSprite
	}
}