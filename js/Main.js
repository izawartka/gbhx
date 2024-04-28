import { Settings } from "./Constants.js";
import Game from "./Game.js";
import Renderer from "./Renderer/Renderer.js";

export default class Main {
    game;
    renderer;

    constructor() {
        this.game = new Game();
        this.renderer = new Renderer(this.game);
    }

    async loadExampleFiles() {
        await this.loadStyFromUrl(Settings.exampleFiles.styUrl);
        await this.loadGmpFromUrl(Settings.exampleFiles.gmpUrl);
        await this.renderer.loadBlocks();
    }

    async loadStyFromUrl(url) {
        return fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                this.game.loadSty(buffer);
            });
    }

    async loadGmpFromUrl(url) {
        return fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                this.game.loadGmp(buffer);
            });
    }
}

const main = new Main();
main.loadExampleFiles();
console.log(main);