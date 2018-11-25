import * as PIXI from 'pixi.js';

export default class Config {
	constructor(configFile) {
		this.configFile = configFile;
	}

	load() {
		return new Promise((resolve) => {
			var loader = new PIXI.loaders.Loader();
			loader.add('configFile', this.configFile).load(() => {
				Object.assign(this, loader.resources.configFile.data)
				resolve();
			})
		});
	}
}