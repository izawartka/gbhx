import * as THREE from 'three';

export default class StyleManager {
    sty;
    
    constructor(sty) {
        this.sty = sty;
    }

    getTileMaterials(tileID) {
        const tile = this.sty.tiles[tileID];
        if(!tile) {
            console.warn(`Tile ${tileID} not found`);
            return null;
        }

        if(!tile.bitmap.cachedMaterials) {
            this.#cacheTileMaterials(tileID);
        }

        return tile.bitmap.cachedMaterials;
    }

    #cacheEverything() {
        this.sty.getSpritesAsArray().forEach(sprite => {
            this.#getMaterial(sprite.bitmap);
        });

        this.sty.tiles.forEach(tile => {
            this.#getMaterial(tile.bitmap);
        });
    }

    #cacheTileMaterials(tileID) {
        const tile = this.sty.tiles[tileID];
        if(!tile) {
            console.warn(`Tile ${tileID} not found`);
            return;
        }

        // only for tiles' bitmaps:
        // material 0 is the standard material, material 1 is the non-transparent material
        const material = this.#getMaterial(tile.bitmap);
        const ntMaterial = material.transparent ? material.clone() : material;
        ntMaterial.transparent = false;

        tile.bitmap.cachedMaterials = [material, ntMaterial];
    }

    #getMaterial(styBitmap, pPalette = null) {
        const { imgData, isTransparent } = styBitmap.getImgData(pPalette);

        const texture = new THREE.DataTexture(
            imgData,
            styBitmap.width,
            styBitmap.height,
            THREE.RGBAFormat
        );

        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            wireframe: false,
            transparent: isTransparent
        });

        return material;
    }
}
