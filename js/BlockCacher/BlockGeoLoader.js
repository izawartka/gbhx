import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BlockMeshConstants } from './BlockMeshConstants';
import BlockGeoHelper from './BlockGeoHelper';
import { Settings } from '../Constants';

export default class BlockGeoLoader {
    static geos = {};
    static blocksVariants = [];
    static loadingPromise;

    static {
        BlockGeoLoader.loadingPromise = BlockGeoLoader.loadAll();
    }

    static async loadGeometry(name, fileName) {
        if(BlockGeoLoader.geos[name] !== undefined) return;
        BlockGeoLoader.geos[name] = null;

        const url = Settings.blockMeshes.geosDirUrl+fileName;
        const loader = new GLTFLoader();
        const gltf = await new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });

        if(!gltf) throw new Error(`Mesh file failed to load: ${name}`);

        const mesh = gltf?.scene;
        if(!mesh) throw new Error(`Mesh file is invalid: ${name}`);

        const geometries = {};

        mesh.children.forEach(child => {
            geometries[child.userData.name] = BlockGeoHelper.getAllTransformedUVsGeometries(child.geometry);
        });

        BlockGeoLoader.geos[name] = geometries;
        return geometries;
    }

    static async loadMultBlockVariant(variantInfo) {
        const promises = [];

        for(let i = 0; i < variantInfo.ids.length; i++) {
            const id = variantInfo.ids[i];
            const rotation = variantInfo.rotations[i];
            const variantInfoSingle = {
                id,
                geoName: variantInfo.geoName,
                rotation,
            };

            promises.push(
                BlockGeoLoader.loadBlockVariant(variantInfoSingle)
            );
        }

        return Promise.all(promises);
    }

    static async loadBlockVariant(variantInfo) {
        if(variantInfo.isMultiple) return BlockGeoLoader.loadMultBlockVariant(variantInfo);

        if(BlockGeoLoader.blocksVariants[variantInfo.id] !== undefined) return;
        BlockGeoLoader.blocksVariants[variantInfo.id] = null;

        const geo = BlockGeoLoader.geos[variantInfo.geoName];
        if(!geo) throw new Error(`Invalid geometry name: ${variantInfo.geoName}`);

        variantInfo.geometries = {};

        for(const [faceName, faceGeo] of Object.entries(geo)) {
            if(faceName == BlockMeshConstants.lidName) {
                variantInfo.geometries[faceName] = BlockGeoHelper.rotateFaceGeometriesArray(faceGeo, variantInfo.rotation);
                continue;
            }

            const rotatedSideName = BlockGeoHelper.getRotatedFaceName(faceName, variantInfo.rotation);
            variantInfo.geometries[rotatedSideName] = faceGeo;
        }

        BlockGeoLoader.blocksVariants[variantInfo.id] = variantInfo;
        return [variantInfo];
    }
    
    static async loadAll() {
        const blockGeos = await fetch(Settings.blockMeshes.geosListUrl).then(res => res.json());

        const geoPromises = Object.entries(blockGeos).map(([name, fileName]) => {
            return BlockGeoLoader.loadGeometry(name, fileName);
        });

        await Promise.all(geoPromises);

        const blocksVariants = await fetch(Settings.blockMeshes.variantsListUrl).then(res => res.json());

        const geoVariantsPromises = blocksVariants.map((variantInfo) => {
            return BlockGeoLoader.loadBlockVariant(variantInfo);
        });

        console.log('BlockGeoLoader: All geometries loaded');
        await Promise.all(geoVariantsPromises);
    }

    static async getBlockGeosVariant(slopeType) {
        await BlockGeoLoader.loadingPromise;

        const geosVariant = BlockGeoLoader.blocksVariants[slopeType];
        if(!geosVariant) {
            throw new Error(`Invalid slope type: ${slopeType}`);
        }

        return geosVariant;
    }
}