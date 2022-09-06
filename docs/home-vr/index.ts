import { Engine, WebXRSessionManager, Scene, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SceneLoader, Color3, PointLight, WebXRCamera, Axis, UniversalCamera, VRDeviceOrientationFreeCamera, FreeCameraKeyboardMoveInput, StandardMaterial, Matrix, Quaternion, Mesh } from 'babylonjs';
import { AdvancedDynamicTexture, Ellipse, TextBlock } from 'babylonjs-gui';
import 'babylonjs-loaders';
import { GradientMaterial } from 'babylonjs-materials';
import { CharacterController } from "./characterController";
import { InputManager } from "./inputManager";
import { Pawn } from "./pawn";

const canvas: any = document.getElementById("renderCanvas");
const engine: Engine = new Engine(canvas, true);

const xrPolyfillPromise = new Promise<void>((resolve) => {
    if ('xr' in navigator) {
        return resolve();
    }
    if ('WebXRPolyfill' in window) {
        new window['WebXRPolyfill']();
        return resolve();
    } else {
        const url = "https://cdn.jsdelivr.net/npm/webxr-polyfill@latest/build/webxr-polyfill.js";
        const s = document.createElement("script");
        s.src = url;
        document.head.appendChild(s);
        s.onload = () => {
            new window['WebXRPolyfill']();
            resolve();
        };
    }
});

async function createScene() {
    // wait for the polyfill to kick in
    await xrPolyfillPromise;
    console.log(navigator['xr']); // should be there!
    console.log(await WebXRSessionManager.IsSessionSupportedAsync("immersive-vr"));

    // create your scene
    const scene = new Scene(engine);

    // add keyboard shortcut to show/hide inspector
    window.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'i') {
            if (scene.debugLayer.isVisible()) {
                scene.debugLayer.hide();
            } else {
                scene.debugLayer.show();
            }
        }
    });

    scene.fogMode = Scene.FOGMODE_LINEAR;
    scene.fogStart = 5;
    scene.fogEnd = 750;
    scene.fogColor = new Color3(169 / 255, 133 / 255, 90 / 255);

    // const camera = new FreeCamera('freeCamera', new Vector3(0, 5, -10), scene);
    const camera = new UniversalCamera('uniCamera', new Vector3(0, 5, -10), scene);
    // const camera = new VRDeviceOrientationFreeCamera('vrFreeCamera', new Vector3(0, 5, -10), scene);
    // const xrSessionManager = new WebXRSessionManager(scene);
    // const camera = new WebXRCamera('xrCamera', scene, xrSessionManager);
    // camera.setTransformationFromNonVRCamera();
    // // for debug
    // console.log(camera.getDirection(Axis.Z));
    // console.log(camera.getFrontPosition(2));
    // console.log(camera.realWorldHeight);

    //camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    //const inputManager = camera.inputs;
    //const kb = inputManager.attached.keyboard;
    //kb['keysLeft'] = [65];
    //kb['keysRight'] = [68];
    //kb['keysUp'] = [87];
    //kb['keysDown'] = [83];

    //// for debug
    //window['input'] = inputManager;
    
    //Create input detector/manager
    const inputManager = new InputManager(scene);

    const playerPawn = new Pawn(scene);
    playerPawn.collisionMesh.position = new Vector3(0, playerPawn.collisionMesh.position.y, -8);

    //Create controller to control pawn
    const playerController = new CharacterController(playerPawn.collisionMesh, scene, false, inputManager);
    playerController.AssignCameraToController(camera);
    playerController.SetupBeforeRenderUpdateLoop();

    //const box = MeshBuilder.CreateBox("box", {}, scene); //unit cube
    //box.scaling = new Vector3(3, 3, 3);
    //box.position.z = 12;

    // create a fuse cursor
    // add a circle reticle using the Fullscreen mode UI
    const fullscreenUI = AdvancedDynamicTexture.CreateFullscreenUI('Fullscreen UI');
    const reticle = new Ellipse('reticle');
    reticle.width = '48px';
    reticle.height = '48px';
    reticle.thickness = 8;
    reticle.color = 'steelblue';
    reticle.alpha = 0.7;
    fullscreenUI.addControl(reticle);

    // scene.ambientColor = new Color3(0, 0, 0);
    const hemisphereLight = new HemisphericLight("hemisphere", new Vector3(0, 1, 0), scene);
    hemisphereLight.intensity = 0.06;
    hemisphereLight.diffuse = new Color3(141 / 255, 186 / 255, 175 / 255);
    hemisphereLight.groundColor = new Color3(102 / 255, 71 / 255, 53 / 255);
    const pointLight = new PointLight('point', new Vector3(0, 1.65, 5.5), scene);
    pointLight.intensity = 0.6;
    pointLight.diffuse = new Color3(1, 1, 1);
    // const sphere = Mesh.CreateSphere("sphere1", 16, 2, scene);
    // const sphere = MeshBuilder.CreateSphere("sphere", { segments: 16, diameter: 1 }, scene);
    // sphere.position.y = 1;
    
    SceneLoader.ImportMeshAsync('', 'assets/models/little_shed/', 'scene.gltf', scene).then(result => {
        const root = result.meshes[0];
        root.addRotation(0, -Math.PI / 2, Math.PI);
        root.position.y = 0.25;
        root.position.z = 4;
        root.scaling.setAll(-0.005);

        // add texts using Texture mode UI
        const titlePlane = MeshBuilder.CreatePlane('title plane', { size: 3 });
        titlePlane.position.copyFrom(root.position);
        titlePlane.position.y = 2.8;
        titlePlane.position.z -= 0.1;
        const textUI = AdvancedDynamicTexture.CreateForMesh(titlePlane);
        const titleText = new TextBlock('title');
        titleText.text = 'CENTRE FOR IMMERSIFICATION';
        titleText.color = 'purple'
        titleText.fontSize = 50;
        textUI.addControl(titleText);

        // for debug
        console.log(result);
        console.log(root);
        window['shed'] = root;
    });
    SceneLoader.ImportMeshAsync('', 'assets/models/environment/', 'sky.glb', scene).then(result => {
        const root = result.meshes[0];
        const mesh = result.meshes[1];
        // root.scaling.setAll(0.08);
        const gradientMaterial = new GradientMaterial('grad', scene);
        gradientMaterial.topColor = new Color3(67 / 255, 158 / 255, 156 / 255);
        gradientMaterial.bottomColor = new Color3(255 / 255, 209 / 255, 145 / 255);
        gradientMaterial.offset = 0.5;
        gradientMaterial.smoothness = 2;
        gradientMaterial.scale = 0.0025;
        gradientMaterial.disableLighting = true;
        gradientMaterial.backFaceCulling = false;
        mesh.material = gradientMaterial;

        // for debug
        console.log(result);
        console.log(root);
        window['sky'] = root;
    });
    SceneLoader.ImportMeshAsync('', 'assets/models/environment/', 'ground.glb', scene).then(result => {
        const root = result.meshes[0];
        root.scaling.setAll(2);

        // for debug
        console.log(result);
        console.log(root);
        window['ground'] = root;
    });

    // const env = scene.createDefaultEnvironment();

    // here we add XR support
    const xr = await scene.createDefaultXRExperienceAsync({
        // floorMeshes: [env.ground],
    });

    return scene;
};

createScene().then(scene => engine.runRenderLoop(() => scene.render()));