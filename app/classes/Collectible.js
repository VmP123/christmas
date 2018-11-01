import GameObject from './GameObject.js'

export default class Collectible extends GameObject {
	constructor(imagePath, width, height, row, frameCount) {
		super(imagePath, width, height, row, frameCount);
	}
}
