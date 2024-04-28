import * as THREE from 'three';
import { GmpBlockType } from './Gmp/GmpConstants.js';
import BlockMeshCacher from './Renderer/BlockMeshCacher.js';

export default class MapManager {
    gmp;
    styleManager;
    mapCachingPromise;
    
    constructor(gmp, styleManager) {
        this.gmp = gmp;
        this.styleManager = styleManager;

        this.#cacheBlocksMeshes();
    }

    async #cacheBlocksMeshes() {
        if(this.mapCachingPromise) await this.mapCachingPromise;

        const promises = this.getBlocksFlat().map((block) => this.#cacheBlockMesh(block));

        this.mapCachingPromise = Promise.all(promises);
        await this.mapCachingPromise;
        this.mapCachingPromise = null;

        console.log('Map meshes cached');
    }

    getBlocksFlat() {
        return this.gmp.blocks.flat(2);
    }

    static #isBlockEmpty(block) {
        if(block.type != GmpBlockType.AIR) return false;
        if(block.left) return false;
        if(block.right) return false;
        if(block.top) return false;
        if(block.bottom) return false;
        if(block.lid) return false;

        return true;
    }

    async #cacheBlockMesh(block) {
        if(MapManager.#isBlockEmpty(block)) return;

        await BlockMeshCacher.cacheMeshes(block, this.styleManager);
    }
}
