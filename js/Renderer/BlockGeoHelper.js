import { BlockMeshConstants, BlockMeshRotSides } from './BlockMeshConstants.js';

export default class BlockGeoHelper {
    // rotation is in 90 degrees steps
    // flip is after rotation
    static getTransformedUVsGeometry(inputGeometry, rotation, flipX, flipY) {
        const geometry = inputGeometry.clone();

        const uv = geometry.attributes.uv;
        for(let i = 0; i < uv.count; i++) {
            let u = uv.getX(i);
            let v = uv.getY(i);

            if(flipX) {
                u = 1 - u;
            }

            if(flipY) {
                v = 1 - v;
            }

            let newU, newV;
            switch(rotation) {
                case 1:
                    newU = v;
                    newV = 1 - u;
                    break;
                case 2:
                    newU = 1 - u;
                    newV = 1 - v;
                    break;
                case 3:
                    newU = 1 - v;
                    newV = u;
                    break;
                default:
                    newU = u;
                    newV = v;
            }

            uv.setXY(i, newU, newV);
        }

        return geometry;        
    }

    static getAllTransformedUVsGeometries(inputGeometry) {
        const geometries = [];

        for(let i = 0; i < 12; i++) {
            geometries.push(BlockGeoHelper.getTransformedUVsGeometry(
                inputGeometry, 
                ~~(i/3), 
                i%3 == 1,
                i%3 == 2
            ));
        }

        return geometries;
    }

    static getRotatedFaceName(inputName, rotation) {
        const isFlat = inputName.endsWith(BlockMeshConstants.flatSuffix);

        if(isFlat) {
            inputName = inputName.slice(0, -BlockMeshConstants.flatSuffix.length);
        }            

        const faceIndex = BlockMeshRotSides.indexOf(inputName);
        if(faceIndex == -1) return inputName;

        const newFaceIndex = (faceIndex + rotation) % BlockMeshRotSides.length;

        let newFaceName = BlockMeshRotSides[newFaceIndex];
        if(isFlat) newFaceName += BlockMeshConstants.flatSuffix;

        return newFaceName;
    }

    static rotateFaceGeometriesArray(array, rotation) {
        // todo fix rotation + flip
        const newArray = new Array(4*3);
        const oddRotation = rotation % 2 == 1;

        for(let i = 0; i < 4*3; i+=3) {
            const baseIndex = (i + rotation*3) % (4*3);
            newArray[i] = array[baseIndex];
            newArray[i+1] = array[baseIndex+(oddRotation ? 2 : 1)];
            newArray[i+2] = array[baseIndex+(oddRotation ? 1 : 2)];
        }

        return newArray;
    }
}