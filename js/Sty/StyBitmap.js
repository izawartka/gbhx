export default class StyBitmap {
    #data;
    #width;
    #height;
    vPalette;

    cachedMaterials = [];

    constructor(data, width, height, vPalette) {
        this.#data = data;
        this.#width = width;
        this.#height = height;
        this.vPalette = vPalette;
    }

    getImgData(pPalette = null) {
        const usedPPalette = pPalette || this.vPalette.physicalPalette;
        const imgData = new ImageData(this.width, this.height);
        let isTransparent = false;

        for(let i = 0; i < this.width*this.height; i++) {
            if(this.#data[i] == 0) {
                isTransparent = true;
                continue; // Transparent pixel (0 is always transparent)
            }

            const pixel = usedPPalette.getColorRGBA(this.#data[i]);
            
            imgData.data[i*4] = pixel[0];
            imgData.data[i*4+1] = pixel[1];
            imgData.data[i*4+2] = pixel[2];
            imgData.data[i*4+3] = 255;
        }

        return { imgData, isTransparent };
    }

    clone() {
        return new StyBitmap(
            this.#data.slice(), 
            this.#width, 
            this.#height, 
            this.virtualPalette
        );
    }

    get width() { return this.#width; }
    get height() { return this.#height; }
    get data() { return this.#data; }
    set data(data) { 
        if(data.length != this.#width*this.#height) {
            throw new Error("Bitmap data size doesn't match width*height");
        }
        this.#data = data;
        this.cachedMaterials.length = 0;
    }
}