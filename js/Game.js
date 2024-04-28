import GmpReader from './Gmp/GmpReader.js';
import StyReader from './Sty/StyReader.js';
import StyleManager from './StyleManager.js';
import MapManager from './MapManager.js';

export default class Game {
    mapManager;
    styleManager;

    constructor() {
        
    }

    loadSty(buffer) {
        const styReader = new StyReader();
        const sty = styReader.load(buffer);
        this.styleManager = new StyleManager(sty);
    }

    loadGmp(buffer) {
        if(!this.styleManager) throw new Error('STY must be loaded before GMP');
        const gmpReader = new GmpReader();
        const gmp = gmpReader.load(buffer);
        this.mapManager = new MapManager(gmp, this.styleManager);
    }
}