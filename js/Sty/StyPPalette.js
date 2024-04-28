export default class StyPPalette {
    pageID;
    relID;
    id;
    usedBy = [];
    data = [];

    constructor(pageID, relID, bgraData) {
        this.pageID = pageID;
        this.relID = relID;
        this.id = pageID*64 + relID;

        this.setDataBGRA(bgraData);
    }
    
    getDataBGRA() {
        const data = [];
        for(let i = 0; i < 256; i++) {
            let rgbaColor = this.getColorRGBA(i);
            data.push(rgbaColor[2], rgbaColor[1], rgbaColor[0], 255 - rgbaColor[3]);
        }
        return data;
    }

    setDataBGRA(bgraData) {
        this.data = [];
        for(let i = 0; i < 256; i++) {
            let bgraColor = bgraData.slice(i*4, i*4+4);
            this.data.push(bgraColor[2], bgraColor[1], bgraColor[0], 255 - bgraColor[3]);
        }
    }

    getColorRGBA(i) {
        return this.data.slice(i*4, i*4+4);
    }

    addUsage(vPalette) {
        if(!this.usedBy.includes(vPalette)) {
            this.usedBy.push(vPalette);
        }
    }

    removeUsage(vPalette) {
        this.usedBy.splice(this.usedBy.indexOf(vPalette), 1);
    }

    getUsageGroupedIDs() {
        const grouped = {};

        for(let i = 0; i < this.usedBy.length; i++) {
            let vPal = this.usedBy[i];
            if(!grouped[vPal.baseName]) grouped[vPal.baseName] = [];
            grouped[vPal.baseName].push(vPal.relID);
        }

        return grouped;
    }
}