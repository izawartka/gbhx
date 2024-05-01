import * as THREE from 'three';
import { Settings } from './Constants';

export default class StyleManager {
    sty;
    
    constructor(sty) {
        this.sty = sty;
    }

    static getTileMaterialIndex(nonTransparent, lightingLevel) {
        return lightingLevel * 2 + (nonTransparent ? 1 : 0);
    }

    getTileMaterial(tileID, nonTransparent = false, lightingLevel = 0) {
        const tile = this.sty.tiles[tileID];
        if(!tile) {
            console.warn(`Tile ${tileID} not found`);
            return null;
        }

        const index = StyleManager.getTileMaterialIndex(nonTransparent, lightingLevel);

        if(!tile.bitmap.cachedMaterials[index]) {
            return this.#cacheTileMaterial(tileID, nonTransparent, lightingLevel);
        }

        return tile.bitmap.cachedMaterials[index];
    }

    #cacheEverything() {
        this.sty.getSpritesAsArray().forEach(sprite => {
            this.#getBaseMaterial(sprite.bitmap);
        });

        this.sty.tiles.forEach(tile => {
            this.#getBaseMaterial(tile.bitmap);
        });
    }

    #cacheTileMaterial(tileID, nonTransparent, lightingLevel) {
        const tile = this.sty.tiles[tileID];
        if(!tile) {
            console.warn(`Tile ${tileID} not found`);
            return null;
        }

        // only for tiles' bitmaps:
        // every odd material is a non transparent version of the previous material
        // every even material is more dimmed version of the previous material
        const materials = tile.bitmap.cachedMaterials;
        if(!materials[0]) {
            materials[0] = this.#getBaseMaterial(tile.bitmap);
        }

        const doClone = materials[0].transparent && nonTransparent || lightingLevel > 0;
        const newMaterial = doClone ? materials[0].clone() : materials[0];

        if(nonTransparent) {
            newMaterial.transparent = false;
        }

        if(lightingLevel > 0) {
            newMaterial.color.multiplyScalar(1 - lightingLevel * Settings.blockMaterials.lightingDimFactor);
        }

        const index = StyleManager.getTileMaterialIndex(nonTransparent, lightingLevel);
        materials[index] = newMaterial;

        /// delete this?
        tile.bitmap.cachedMaterials = materials;

        return newMaterial;
    }

    #getBaseMaterial(styBitmap, pPalette = null) {
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
            wireframe: Settings.blockMaterials.wireframe,
            transparent: isTransparent
        });

        return material;
    }
}
