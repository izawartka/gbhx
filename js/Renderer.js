import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Settings } from './Constants.js';
import UI from './UI.js';
import Main from './Main.js';

export default class Renderer {
    static scene;
    static webglRenderer;
    static camera;
    static cameraControls;
    static clock;

    static {
        this.scene = new THREE.Scene();
        this.scene.scale.y = Settings.renderer.sceneScaleY;
        this.scene.background = new THREE.Color( Settings.renderer.backgroundColor );

        this.webglRenderer = new THREE.WebGLRenderer();
        // this.webglRenderer.shadowMap.enabled = true;
        // this.webglRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.webglRenderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.webglRenderer.domElement );

        this.camera = new THREE.PerspectiveCamera( 
            Settings.renderer.cameraFov, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            Settings.renderer.renderDistance 
        );
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);

        this.cameraControls = new OrbitControls( this.camera, this.webglRenderer.domElement );

        this.clock = new THREE.Clock();

        this.#render();
    }

    static #render() {
        requestAnimationFrame( this.#render.bind(this) );
        const dt = this.clock.getDelta();
        this.cameraControls.update(dt);
        this.webglRenderer.render( this.scene, this.camera );
        UI.update(dt);
    }

    static async reloadMap() {
        this.scene.clear();
        const mapManager = Main.game?.mapManager;
        if(!mapManager) return;

        if(mapManager.mapCachingPromise) await mapManager.mapCachingPromise;

        mapManager.getBlocksFlat().forEach((block) => {
            if(!block.cachedMesh) return;
            this.scene.add(block.cachedMesh);
        });

        console.log('Blocks loaded to the renderer');
    }

}