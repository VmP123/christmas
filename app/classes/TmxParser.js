export default class TmxParser {
	static parse(xmlString) {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
		
		const mapElement = xmlDoc.getElementsByTagName('map')[0];
		const mapData = {
			width: parseInt(mapElement.getAttribute('width')),
			height: parseInt(mapElement.getAttribute('height')),
			tileWidth: parseInt(mapElement.getAttribute('tilewidth')),
			tileHeight: parseInt(mapElement.getAttribute('tileheight')),
			tilesets: [],
			layers: []
		};

		// Parse tilesets
		const tilesetElements = xmlDoc.getElementsByTagName('tileset');
		for (let i = 0; i < tilesetElements.length; i++) {
			const tileset = tilesetElements[i];
			const imageElement = tileset.getElementsByTagName('image')[0];
			
			mapData.tilesets.push({
				firstGid: parseInt(tileset.getAttribute('firstgid')),
				name: tileset.getAttribute('name'),
				tileWidth: parseInt(tileset.getAttribute('tilewidth')),
				tileHeight: parseInt(tileset.getAttribute('tileheight')),
				tileCount: parseInt(tileset.getAttribute('tilecount')),
				columns: parseInt(tileset.getAttribute('columns')),
				image: imageElement ? imageElement.getAttribute('source') : null,
				imageWidth: imageElement ? parseInt(imageElement.getAttribute('width')) : 0,
				imageHeight: imageElement ? parseInt(imageElement.getAttribute('height')) : 0
			});
		}

		// Parse layers
		const layerElements = xmlDoc.getElementsByTagName('layer');
		for (let i = 0; i < layerElements.length; i++) {
			const layer = layerElements[i];
			const dataElement = layer.getElementsByTagName('data')[0];
			const csvData = dataElement.textContent.trim();
			const tiles = csvData.split(',').map(t => {
				const num = parseInt(t.trim());
				return num === 0 ? null : num;
			});

			mapData.layers.push({
				name: layer.getAttribute('name'),
				width: parseInt(layer.getAttribute('width')),
				height: parseInt(layer.getAttribute('height')),
				tiles: tiles,
				visible: layer.getAttribute('visible') !== '0'
			});
		}

		// Parse object groups
		const objectGroupElements = xmlDoc.getElementsByTagName('objectgroup');
		for (let i = 0; i < objectGroupElements.length; i++) {
			const objectGroup = objectGroupElements[i];
			const objects = [];
			
			const objectElements = objectGroup.getElementsByTagName('object');
			for (let j = 0; j < objectElements.length; j++) {
				const obj = objectElements[j];
				const objectData = {
					id: obj.getAttribute('id'),
					type: obj.getAttribute('type'),
					x: parseFloat(obj.getAttribute('x')),
					y: parseFloat(obj.getAttribute('y')),
					properties: {}
				};

				// Parse properties
				const propertiesElement = obj.getElementsByTagName('properties')[0];
				if (propertiesElement) {
					const propertyElements = propertiesElement.getElementsByTagName('property');
					for (let k = 0; k < propertyElements.length; k++) {
						const prop = propertyElements[k];
						objectData.properties[prop.getAttribute('name')] = prop.getAttribute('value');
					}
				}

				objects.push(objectData);
			}

			mapData.layers.push({
				name: objectGroup.getAttribute('name'),
				type: 'objectgroup',
				objects: objects,
				visible: objectGroup.getAttribute('visible') !== '0'
			});
		}

		return mapData;
	}
}
