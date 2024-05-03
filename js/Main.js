import { Settings } from "./Constants.js";
import Game from "./Game.js";
import Renderer from "./Renderer.js";

export default class Main {
    static game;

    static {
        this.game = new Game();
        this.loadExampleFiles();
    }

    static async loadExampleFiles() {
        await this.loadStyFromUrl(Settings.exampleFiles.styUrl);
        await this.loadGmpFromUrl(Settings.exampleFiles.gmpUrl);
        await Renderer.reloadMap();
    }

    static async loadStyFromUrl(url) {
        return fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                this.game?.loadSty(buffer);
            });
    }

    static async loadGmpFromUrl(url) {
        return fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                this.game?.loadGmp(buffer);
            });
    }
}