import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Settings } from '../Constants.js';

export default class Renderer {
    scene;
    webglRenderer;
    camera;
    cameraControls;
    clock;
    game;

    constructor(game) {
        this.game = game;
        this.scene = new THREE.Scene();
        this.scene.scale.y = Settings.renderer.sceneScaleY;
        this.scene.background = new THREE.Color( Settings.renderer.backgroundColor );

        this.scene.add(new THREE.AxesHelper(100));

        this.renderer = new THREE.WebGLRenderer();
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );

        this.camera = new THREE.PerspectiveCamera( 
            Settings.renderer.cameraFov, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            Settings.renderer.renderDistance 
        );
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);

        this.cameraControls = new OrbitControls( this.camera, this.renderer.domElement );

        this.clock = new THREE.Clock();

        this.#render();
    }

    #render() {
        requestAnimationFrame( this.#render.bind(this) );
        const dt = this.clock.getDelta();
        this.cameraControls.update(dt);
        this.renderer.render( this.scene, this.camera );
    }

    async loadBlocks() {
        this.scene.clear();
        const mapManager = this.game.mapManager;
        if(!mapManager) return;

        if(mapManager.mapCachingPromise) await mapManager.mapCachingPromise;

        mapManager.getBlocksFlat().forEach((block) => {
            if(!block.cachedMeshes) return;
            this.scene.add(...block.cachedMeshes);
        });

        console.log('Blocks loaded to the renderer');
    }

}