import Helper from "../Helper.js";

export default class RiffParser {
    
    static parse(buffer) {
        const chunks = {};

        let offset = 0;
        while(offset < buffer.byteLength) {
            const chunkID = Helper.readByteString(buffer, offset, 4);
            const chunkSize = new DataView(buffer, offset+4, 4).getUint32(0, true);
            const chunkData = buffer.slice(offset+8, offset+8+chunkSize);

            chunks[chunkID] = chunkData;

            offset += 8 + chunkSize;
        }

        if(offset != buffer.byteLength) {
            throw new Error("RiffParser: invalid data size");
        }

        return chunks;
    }
}