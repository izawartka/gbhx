export default class Sty {
    pPalettes;
    vPalettes;
    tiles;
    sprites;
    cars;
    fonts;

    constructor(
        pPalettes,
        vPalettes,
        tiles,
        sprites,
        cars,
        fonts
    ) {
        this.pPalettes = pPalettes;
        this.vPalettes = vPalettes;
        this.tiles = tiles;
        this.sprites = sprites;
        this.cars = cars;
        this.fonts = fonts;
    }

    getSpritesAsArray() {
        return Object.values(this.sprites)
            .reduce((acc, val) => acc.concat(val), []);
    }
}