import { Settings } from "./Constants";

export default class UI {
    rootElement;

    static {
        this.rootElement = document.createElement('div');
        this.rootElement.id = Settings.ui.rootElementID;
        document.body.appendChild(this.rootElement);
    }

    static update(dt) {
        const fpsString = Math.round(1/dt).toString().padStart(2, '0');
        const ramString = (performance.memory.usedJSHeapSize/1024/1024).toFixed(2);
        const ramLimitString = (performance.memory.jsHeapSizeLimit/1024/1024).toFixed(2);

        const debugText = `
            FPS: ${fpsString}<br>
            RAM: ${ramString}MB / ${ramLimitString}MB
        `;

        this.rootElement.innerHTML = debugText;
    }
}