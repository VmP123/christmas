import GameObject from './GameObject.js'

export default class Collectible extends GameObject {
	constructor(imagePath, width, height, frameCount) {
		super(imagePath, width, height, frameCount);
	}
}
