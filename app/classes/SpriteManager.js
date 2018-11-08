import * as PIXI from 'pixi.js';
import ExtendedAnimatedSprite from './ExtendedAnimatedSprite.js'

export default class SpriteManager {
	constructor(spritePackFile) {
		this.spritePackFile = spritePackFile;
	}
	
	load() {
		return new Promise((resolve, reject) => {
			var loader = new PIXI.loaders.Loader();
			loader.add('spritePack', this.spritePackFile).load(() => {
				this.spritePack = loader.resources.spritePack.data;
				
				this.width = this.spritePack.common.width;
				this.height = this.spritePack.common.height;

				this.frameRowsByImage = {};
				Object.keys(this.spritePack.sprites).forEach(key => {
					var sprite = this.spritePack.sprites[key];
					var baseTexture = PIXI.BaseTexture.fromImage(sprite.image);
					var maxFrameId = this.getMaxFrameIdFromSequences(sprite.sequences);
					
					var frames = [];
					for(var i = 0; i <= maxFrameId; i++) {
						var texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(
							i * this.width, 
							sprite.row * this.height,
							this.width,
							this.height
						));
						frames.push(texture);	
					}
					
					if (sprite.generateHorizontalMirrored) {
						var horizontalMirroredFrames = frames.map(frame => {
							var clonedFrame = frame.clone();
							clonedFrame.rotate = 12;
							return clonedFrame;
						});
						frames = frames.concat(horizontalMirroredFrames);
						
						var horizontalMirroredSequences = {};
						Object.keys(sprite.sequences).forEach(key => {
							var sequence = sprite.sequences[key];
							horizontalMirroredSequences[key + 'HorizontalMirrored'] = 
								sequence.map(sequenceStep => sequenceStep + sequence.length);
						});
						Object.assign(sprite.sequences, horizontalMirroredSequences);
					}
					
					if (!this.frameRowsByImage[sprite.image])
						this.frameRowsByImage[sprite.image] = {};

					this.frameRowsByImage[sprite.image][sprite.row] = frames;
				})
				
				resolve();
			})
		})
	}
	
	getMaxFrameIdFromSequences(sequences) {
		var maxId = 0;
		Object.keys(sequences).forEach(key => {
			var localMaxId = Math.max(...sequences[key]);
			if (localMaxId > maxId)
				maxId = localMaxId;
		})
		return maxId;
	}
	
	createExtendedAnimatedSprite(spriteName) {		
		var sprite = this.spritePack.sprites[spriteName];
		var frames = this.frameRowsByImage[sprite.image][sprite.row];

		var extendedAnimatedSprite = new ExtendedAnimatedSprite(frames, false);
		extendedAnimatedSprite.sequences = sprite.sequences;
		extendedAnimatedSprite.boundingBox = sprite.boundingBox;

		return extendedAnimatedSprite;
	}
}
