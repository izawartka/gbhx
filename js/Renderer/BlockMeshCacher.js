import * as THREE from 'three';
import BlockGeoLoader from './BlockGeoLoader.js';
import { BlockMeshRotSides, BlockMeshConstants } from './BlockMeshConstants.js';

export default class BlockMeshCacher {
    static async cacheMeshes(blockInfo, styleManager) {
        if(blockInfo.cachedMesh) return blockInfo.cachedMesh;
        blockInfo.cachedMesh = null;

        const meshes = await BlockMeshCacher.getMeshes(blockInfo, styleManager);
        if(meshes.length == 0) return null;

        blockInfo.cachedMeshes = meshes;
        return meshes;
    }

    static async getMeshes(blockInfo, styleManager) {
        const blockVariant = blockInfo.slope + (blockInfo.lid?.tileID == 1023 ? 64 : 0);
        const blockGeos = await BlockGeoLoader.getBlockGeosVariant(blockVariant);
        if(!blockGeos || !blockGeos.geometries) return [];
        const sidesInfo = BlockMeshCacher.getSidesInfo(blockInfo);
        const position = new THREE.Vector3(blockInfo.x, blockInfo.z, blockInfo.y);

        const meshes = [];

        for(const [sideName, sideGeo] of Object.entries(blockGeos.geometries)) {
            const sideMesh = await BlockMeshCacher.getSideMesh(sideName, sideGeo, sidesInfo, styleManager);
            if(!sideMesh) continue;

            sideMesh.position.copy(position);
            sideMesh.rotation.y = blockGeos.rotation * Math.PI / 2;
            meshes.push(sideMesh);
        }

        return meshes;
    }

    static async getSideMesh(sideName, sideGeo, sidesInfo, styleManager) {
        const tileID = sidesInfo[sideName]?.tileID;
        if(!tileID) return null;

        const isFlat = sidesInfo[sideName].flat || sidesInfo[sideName].flatRev;
        const lightingLevel = sidesInfo[sideName].lighting ?? 0;
        const material = styleManager.getTileMaterial(tileID, !isFlat, lightingLevel);
        if(!material) return null;

        const rotationFactor = sidesInfo[sideName].rotation;
        const geometryIndex = (rotationFactor * 3) + (sidesInfo[sideName].flip ? 1 : 0);
        const geometry = sideGeo[geometryIndex];
        
        const outMesh = new THREE.Mesh(geometry, material);
        
        return outMesh;
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