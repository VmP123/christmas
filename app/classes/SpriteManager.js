import * as PIXI from 'pixi.js';
import ExtendedAnimatedSprite from './ExtendedAnimatedSprite.js'

export default class SpriteManager {
	constructor(spritePackFile) {
		this.spritePackFile = spritePackFile;
	}

	load() {
		return new Promise((resolve) => {
			const loader = new PIXI.loaders.Loader();
			loader.add('spritePack', this.spritePackFile).load(() => {
				this.spritePack = loader.resources.spritePack.data;

				this.width = this.spritePack.common.width;
				this.height = this.spritePack.common.height;

				this.frameRowsByImage = {};
				Object.keys(this.spritePack.sprites).forEach(key => {
					const sprite = this.spritePack.sprites[key];
					const baseTexture = PIXI.BaseTexture.fromImage(sprite.image);
					const maxFrameId = this.getMaxFrameIdFromSequences(sprite.sequences);

					let frames = [];
					for(let i = 0; i <= maxFrameId; i++) {
						const texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(
							i * this.width,
							sprite.row * this.height,
							this.width,
							this.height
						));
						frames.push(texture);
					}

					if (sprite.generateHorizontalMirrored) {
						const horizontalMirroredFrames = frames.map(frame => {
							const clonedFrame = frame.clone();
							clonedFrame.rotate = 12;
							return clonedFrame;
						});

						const horizontalMirroredSequences = {};
						Object.keys(sprite.sequences).forEach(key => {
							const sequence = sprite.sequences[key];
							horizontalMirroredSequences[key + 'HorizontalMirrored'] =
								sequence.map(sequenceStep => sequenceStep + frames.length);
						});

						frames = frames.concat(horizontalMirroredFrames);
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
		let maxId = 0;
		Object.keys(sequences).forEach(key => {
			const localMaxId = Math.max(...sequences[key]);
			if (localMaxId > maxId)
				maxId = localMaxId;
		})
		return maxId;
	}

	createExtendedAnimatedSprite(spriteName) {
		const sprite = this.spritePack.sprites[spriteName];
		const frames = this.frameRowsByImage[sprite.image][sprite.row];

		const extendedAnimatedSprite = new ExtendedAnimatedSprite(frames, false);
		extendedAnimatedSprite.sequences = sprite.sequences;
		extendedAnimatedSprite.boundingBox = sprite.boundingBox;

		return extendedAnimatedSprite;
	}
}
