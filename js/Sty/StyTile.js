import StyBitmap from "./StyBitmap.js";

export default class StyTile {
    constructor(id, pageID, relID, data, virtualPalette, material) {
        this.id = id;
        this.pageID = pageID;
        this.relID = relID;
        this.bitmap = new StyBitmap(data, 64, 64, virtualPalette);
        this.material = material;
    }
}