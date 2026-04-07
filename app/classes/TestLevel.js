import * as PIXI from 'pixi.js';
import Level from './Level.js';
import TmxParser from './TmxParser.js';

/**
 * TestLevel - Lataa TMX-kentän localStorage:sta editorista testaamista varten
 */
export default class TestLevel extends Level {
	constructor() {
		// Käytä vakionimeä localStorage-avaimena
		super('__test_level__.tmx');
		this.resourcePath = './';
	}

	load() {
		return new Promise((resolve, reject) => {
			// Hae TMX-data localStorage:sta
			const tmxData = localStorage.getItem('editor_test_level');
			
			if (!tmxData) {
				reject(new Error('Testikenttää ei löydy localStorage:sta'));
				return;
			}

			// Lisää TMX manuaalisesti PIXI.loader.resources:iin
			if (!PIXI.loader.resources[this.tiledFile]) {
				PIXI.loader.resources[this.tiledFile] = {
					name: this.tiledFile,
					data: tmxData,
					url: this.tiledFile,
					type: PIXI.loaders.Resource.TYPE.TEXT
				};
			}

			// Lataa tileset-kuvat normaalisti
			this.loadTilesetImages(resolve, true);
		});
	}
}
