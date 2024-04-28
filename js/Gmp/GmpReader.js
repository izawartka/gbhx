import Gmp from './Gmp.js';
import RiffParser from '../Parsers/RiffParser.js';
import Helper from '../Helper.js';
import { GmpConstants } from './GmpConstants.js';
import GmpBlock from './GmpBlock.js';
import GmpSurfaceParser from './GmpSurfaceDecoder.js';

export default class GmpReader {

    #chunks = [];

    load(data) {
        this.#checkFileCorrect(data);
        const offsetData = data.slice(6);
        this.#chunks = RiffParser.parse(offsetData);

        const blocks = this.#parseBlocks();

        return new Gmp(blocks);
    }

    #checkFileCorrect(data) {
        const header = Helper.readByteString(data, 0, 4);
        if(header != GmpConstants.GMP_HEADER) {
            throw new Error("GMP parser: incorrect file header");
        }

        const fileVersion = new Uint16Array(data, 4, 1)[0];
        if(fileVersion != GmpConstants.GMP_VERSION) {
            throw new Error("GMP parser: incorrect file version");
        }
    }

    #getChunk(name, required = true) {
        const chunk = this.#chunks[name];
        if(!chunk && required) {
            throw new Error(`GMP parser: missing chunk ${name}`);
        }

        return chunk;
    }

    #parseBlocks() {
        if(this.#chunks['UMAP']) {
            return this.#parseBlocksUncompressed();
        }

        /// TODO - CMAP, DMAP
    }

    #parseBlocksUncompressed() {
        const UMAP = this.#getChunk('UMAP');
        const dataView = new DataView(UMAP);

        const blocks = [];
        let offset = 0;
        for(let z = 0; z < GmpConstants.MAP_DEPTH; z++) {
            blocks[z] = [];
            for(let y = 0; y < GmpConstants.MAP_HEIGHT; y++) {
                blocks[z][y] = [];
                for(let x = 0; x < GmpConstants.MAP_WIDTH; x++) {
                    const typeAndSlope = dataView.getUint8(offset+11);

                    const block = new GmpBlock(
                        x, y, z,
                        GmpSurfaceParser.parseSideSurface(dataView.getUint16(offset, true)),
                        GmpSurfaceParser.parseSideSurface(dataView.getUint16(offset+2, true)),
                        GmpSurfaceParser.parseSideSurface(dataView.getUint16(offset+4, true)),
                        GmpSurfaceParser.parseSideSurface(dataView.getUint16(offset+6, true)),
                        GmpSurfaceParser.parseLidSurface(dataView.getUint16(offset+8, true)),
                        dataView.getUint8(offset+10),
                        typeAndSlope & 0x3,
                        typeAndSlope >> 2
                    )

                    blocks[z][y][x] = block;
                    offset += 12;
                }
            }
        }
        
        return blocks;
    }
}