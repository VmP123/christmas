import GameObject from './GameObject.js'

export default class Collectible extends GameObject {
	constructor(sprite) {
		super(sprite);
		this.sequenceName = 'default';
		this.direction = 1;
	}
}
