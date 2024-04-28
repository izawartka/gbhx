export default class StyVPalette {
    constructor(baseName, relID, pPalette) {
        this.baseName = baseName;
        this.relID = relID;
        this.physicalPalette = pPalette;
    }

    setPPal(pPalette) {
        this.physicalPalette.removeUsage(this);
        this.physicalPalette = pPalette;
        pPalette.addUsage(this);
    }
}