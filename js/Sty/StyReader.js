import RiffParser from '../Parsers/RiffParser.js';
import PagedContentParser from '../Parsers/PagedContentParser.js';
import StyFont from './StyFont.js';
import StyPPalette from './StyPPalette.js';
import StySprite from './StySprite.js';
import StyTile from './StyTile.js';
import StyVPalette from './StyVPalette.js';
import { StyConstants, StyPaletteBases, StySpriteBases } from './StyConstants.js';
import StyCar from './StyCar.js';
import Sty from './Sty.js';
import Helper from '../Helper.js';

export default class StyReader {

    #chunks = {};

    constructor() {

    }

    load(data) {
        this.#checkFileCorrect(data);
        const offsetData = data.slice(6);
        this.#chunks = RiffParser.parse(offsetData);

        const pPalettes = this.#parsePPalettes();
        const vPalettes = this.#parseVPalettes(pPalettes);
        const tiles = this.#parseTiles(vPalettes);
        const spritePages = this.#parseSpritePages();
        const spriteIndexes = this.#parseSpriteIndexes();
        const sprites = this.#parseSprites(spritePages, spriteIndexes, vPalettes);
        const cars = this.#parseCars(sprites, vPalettes);
        const fonts = this.#parseFonts(sprites);

        this.#parseMaterials(tiles);
        this.#parseCarDeltas(sprites);
        this.#parseRecycling(cars);

        console.log('STY loaded');

        return new Sty(pPalettes, vPalettes, tiles, sprites, cars, fonts);
    }

    #checkFileCorrect(data) {
        const header = Helper.readByteString(data, 0, 4);
        if(header != StyConstants.STY_HEADER) {
            throw new Error('STY parser: incorrect file header');
        }

        const fileVersion = new Uint16Array(data, 4, 1)[0];
        if(fileVersion != StyConstants.STY_VERSION) {
            throw new Error('STY parser: incorrect file version');
        }
    }

    #getChunk(name, required = true) {
        const chunk = this.#chunks[name];
        if(!chunk && required) {
            throw new Error(`STY parser: missing chunk ${name}`);
        }

        return chunk;
    }

    #parsePPalettes() {
        const PPAL = this.#getChunk('PPAL');
        const palData = PagedContentParser.parse(PPAL, 256, 256, 4, 256);
        
        return palData.map((data) => {
            return new StyPPalette(
                data.pageID,
                data.relID,
                data.data
            );
        });
    }

    #parseVPalettes(pPalettes) {
        const PALX = this.#getChunk('PALX');
        const PALB = this.#getChunk('PALB');

        const unorderedVPals = new Uint16Array(PALX);
        const bases = new Uint16Array(PALB);
        const vPalettes = {};

        StyReader.#mapBases(unorderedVPals, bases, StyPaletteBases, (value, baseName, relID) => {

            const vPalette = new StyVPalette(
                baseName,
                relID,
                pPalettes[value]
            );
            pPalettes[value].addUsage(vPalette);

            if(!vPalettes[baseName]) vPalettes[baseName] = [];
            vPalettes[baseName][relID] = vPalette;

        });

        return vPalettes;
    }

    #parseTiles(vPalettes) {
        const TILE = this.#getChunk('TILE');
        const tilesData = PagedContentParser.parse(TILE, 256, 256, 64, 64);

        return tilesData.map((data, id) => {
            return new StyTile(
                id,
                data.pageID,
                data.relID,
                data.data,
                vPalettes['tile'][id]
            );
        });
    }

    #parseSpritePages() {
        const SPRG = this.#getChunk('SPRG');
        const pages = [];

        for(let i = 0; i < SPRG.byteLength; i+=256*256) {
            const pageData = new Uint8Array(SPRG, i, 256*256);
            pages.push(pageData);
        }

        return pages;
    }

    #parseSpriteIndexes() {
        const SPRX = this.#getChunk('SPRX');
        const indexesCount = ~~(SPRX.byteLength/8);
        const indexes = [];

        for(let i = 0; i < indexesCount; i++) {
            const indexData = SPRX.slice(i*8, i*8+8);
            const size = new Uint8Array(indexData, 4, 2);

            const index = {
                ptr: new Uint32Array(indexData, 0)[0],
                width: size[0],
                height: size[1]
            }

            indexes[i] = index;
        }

        return indexes;
    }

    #parseSprites(spritePages, spriteIndexes, vPalettes) {
        const SPRB = this.#getChunk('SPRB');
        const bases = new Uint16Array(SPRB);

        const sprites = {};
        StyReader.#mapBases(spriteIndexes, bases, StySpriteBases, (spriteIndex, baseName, relID, absID) => {
            const sprite = new StySprite(
                baseName,
                relID,
                spriteIndex,
                StyReader.#getSpriteData(spritePages, spriteIndex),
                vPalettes['sprite'][absID],
            );

            if(!sprites[baseName]) sprites[baseName] = [];
            sprites[baseName][relID] = sprite;
        });

        return sprites;
    }

    #parseCars(sprites, vPalettes) {
        const CARI = this.#getChunk('CARI');

        const cars = [];
        let b = 0;
        let id = 0;
        let lastSpriteID = -1;
        while(b < CARI.byteLength) {
            const remapsCount = new Uint8Array(CARI, b+4, 1)[0];
            const doorsCount = new Uint8Array(CARI, b+14+remapsCount, 1)[0];
            const dataSize = 15 + doorsCount*2 + remapsCount;
            const carData = new Uint8Array(CARI, b, dataSize);
            const carInfo = {};
            const infoKeys = [
                'model', 'sprite',
                'w', 'h',
                '', 'passengers',
                'wreck', 'rating',
                'front_wheel_offset',
                'rear_wheel_offset',
                'front_window_offset',
                'rear_window_offset',
                'info_flags',
                'info_flags_2',
            ];
            const signedKeys = [8, 9, 10, 11];
            const flags = [12, 13];

            infoKeys.forEach((key, i) => {
                if(key == '') return;
                let val = carData[i];
                if(signedKeys.includes(i))
                    val = val <<24 >>24;
                if(flags.includes(i)) {
                    val = val.toString(2);
                    while(val.length < 8) {
                        val = '0'+val;
                    }
                    val = val.split('').map(value => value == '1').reverse();
                }
                carInfo[key] = val;
            });
            
            if(carInfo['sprite']) lastSpriteID++;
            const car = new StyCar(id, carInfo, sprites['car'][lastSpriteID]);
            
            let remapsIDs = Array.from(new Uint8Array(CARI, b+14, remapsCount));
            remapsIDs.forEach((remapID) => {
                car.addRemap(vPalettes['car_remap'][remapID]);
            });

            let doorsInfo = Array.from(new Int8Array(CARI, b+15+remapsCount, doorsCount*2));
            for(let d = 0; d < doorsInfo.length; d+=2) {
                car.addDoor(doorsInfo[d], doorsInfo[d+1]);
            }

            b+=dataSize;
            id++;

            cars.push(car);
        }

        return cars;
    }

    #parseFonts(sprites) {
        const FONB = this.#getChunk('FONB');
        const bases = Array.from(new Uint16Array(FONB)).slice(1);
        const fonts = [];

        let sum = 0;
        for(let i = 0; i < bases.length; i++) {
            const fontSprites = sprites['font'].slice(sum, sum+bases[i]);
            fonts[i] = new StyFont(i, fontSprites);
            sum += bases[i];
        }

        return fonts;
    }

    #parseMaterials(tiles) {
        let SPEC = this.#getChunk('SPEC');
        let data = new Uint16Array(SPEC);

        let material = 0;
        for(let i = 0; i < data.length; i++) {
            if(data[i] == 0) {
                material++;
                continue;
            }

            tiles[data[i]].material = material;
        }
    }

    #parseCarDeltas(sprites) {
        const DELX = this.#getChunk('DELX');
        const DELS = this.#getChunk('DELS');

        let b = 0;
        let sb = 0;
        while(b < DELX.byteLength) {
            const spriteID = new Uint16Array(DELX, b, 1)[0];
            const sprite = sprites['car'][spriteID];

            const count = new Uint8Array(DELX, b+2, 1)[0];
            const deltaSizes = Array.from(new Uint16Array(DELX.slice(b+4, b+4+count*2), 0, count));

            for(let i = 0; i < count; i++) {
                const deltas = [];
                const end = sb + deltaSizes[i];
                while(sb < end) {
                    const offset = new Uint16Array(DELS.slice(sb, sb+2), 0, 1)[0];
                    const size = new Uint8Array(DELS, sb+2, 1)[0];
                    deltas.push({
                        offset,
                        data: new Uint8ClampedArray(DELS, sb+3, size)
                    });
                    sb += 3+size;
                }

                if(sprite) {
                    sprite.addDelta(deltas);
                }
            }
            
            b+=4+count*2;
        }
    }

    #parseRecycling(cars) {
        const RECY = this.#getChunk('RECY');
        const recyclingInfo = Array.from(new Uint8Array(RECY));
        const carsByModel = [];
        cars.forEach((car) => {
            carsByModel[car.model] = car;
        });
        recyclingInfo.forEach((model) => {
            if(!carsByModel[model]) return;
            carsByModel[model].recycled = true;
        });
    }

    ///////////////// STATIC HELPER METHODS /////////////////

    static #getSpriteData(spritePages, spriteIndex) {
        const pageID = ~~(spriteIndex.ptr/(256*256));
        const relPtr = spriteIndex.ptr%(256*256);
        const spriteData = [];
        for(let i = 0; i < spriteIndex.height; i++) {
            const start = relPtr+i*256;
            const row = spritePages[pageID].slice(start, start+spriteIndex.width);
            spriteData.push(...row);
        }

        return spriteData
    }

    static #mapBases(unordered, bases, baseNames, cb) {
        let currentID = 0;
        
        for(let i = 0; i < bases.length; i++) {
            const baseName = baseNames[i];

            for(let j = 0; j < bases[i]; j++) {
                cb(unordered[j+currentID], baseName, j, j+currentID);
            }

            currentID += bases[i];
        }
    }
}