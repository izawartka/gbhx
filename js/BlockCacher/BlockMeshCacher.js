import * as THREE from 'three';
import BlockGeoLoader from './BlockGeoLoader.js';
import { BlockMeshRotSides, BlockMeshConstants } from './BlockMeshConstants.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export default class BlockMeshCacher {
    static async cacheMesh(blockInfo, styleManager) {
        if(blockInfo.cachedMesh) return blockInfo.cachedMesh;
        blockInfo.cachedMesh = null;

        const mesh = await BlockMeshCacher.getMesh(blockInfo, styleManager);
        blockInfo.cachedMesh = mesh;
        return mesh;
    }

    static async getMesh(blockInfo, styleManager) {
        const blockVariant = blockInfo.slope + (blockInfo.lid?.tileID == 1023 ? 64 : 0);
        const blockGeos = await BlockGeoLoader.getBlockGeosVariant(blockVariant);
        if(!blockGeos || !blockGeos.geometries) return [];
        const sidesInfo = BlockMeshCacher.getSidesInfo(blockInfo);
        const position = new THREE.Vector3(blockInfo.x, blockInfo.z, blockInfo.y);

        const geometries = [];
        const materials = [];

        for(const [sideName, sideGeo] of Object.entries(blockGeos.geometries)) {
            const material = await BlockMeshCacher.getSideMaterial(sideName, sidesInfo, styleManager);
            if(!material) continue;
            const geometry = await BlockMeshCacher.getSideGeometry(sideName, sideGeo, sidesInfo);
            if(!geometry) continue;

            geometries.push(geometry);
            materials.push(material);
        }

        if(geometries.length == 0) return null;

        const combinedGeometry = new BufferGeometryUtils.mergeGeometries(geometries,true);
        //const combinedGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const mesh = new THREE.Mesh(combinedGeometry, materials);

        mesh.position.copy(position);
        mesh.rotation.y = blockGeos.rotation * Math.PI / 2;

        return mesh;
    }

    static async getSideGeometry(sideName, sideGeo, sidesInfo) {
        const rotationFactor = sidesInfo[sideName].rotation;
        const geometryIndex = (rotationFactor * 3) + (sidesInfo[sideName].flip ? 1 : 0);
        const geometry = sideGeo[geometryIndex];

        return geometry;
    }

    static async getSideMaterial(sideName, sidesInfo, styleManager) {
        const tileID = sidesInfo[sideName]?.tileID;
        if(!tileID) return null;

        const isFlat = sidesInfo[sideName].flat || sidesInfo[sideName].flatRev;
        const lightingLevel = sidesInfo[sideName].lighting ?? 0;
        const material = styleManager.getTileMaterial(tileID, !isFlat, lightingLevel);

        return material;
    }

    static getSidesInfo(block) {
        const sidesInfo = {};

        for(const side of BlockMeshRotSides) {
            sidesInfo[side] = block[side] ?? null;
        }
        
        sidesInfo[BlockMeshConstants.lidName] = block.lid ?? null;

        for(let i = 0; i < BlockMeshRotSides.length; i++) {
            const sideName = BlockMeshRotSides[i];
            const revSideName = BlockMeshRotSides[(i + 2) % BlockMeshRotSides.length];

            if(!sidesInfo[sideName] || !sidesInfo[revSideName]) continue;
            if(!sidesInfo[sideName].flat) continue;
            const flatName = sideName + BlockMeshConstants.flatSuffix;
            sidesInfo[flatName] = {...sidesInfo[revSideName], flatRev: true};

            if(!sidesInfo[revSideName].flat) {
                sidesInfo[revSideName] = null;
            }
        }

        return sidesInfo;
    }
}