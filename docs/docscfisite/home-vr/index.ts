import { Engine, WebXRSessionManager, Scene, FreeCamera, Vector3, HemisphericLight, MeshBuilder, SceneLoader, Color3, PointLight, WebXRCamera, Axis, UniversalCamera, VRDeviceOrientationFreeCamera, FreeCameraKeyboardMoveInput } from 'babylonjs';
import 'babylonjs-loaders';
import { GradientMaterial } from 'babylonjs-materials';
import { CharacterController } from "./characterController";
import { InputController } from "./inputController";
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
    var EnableFreeflyCamera = false;

    // wait for the polyfill to kick in
    await xrPolyfillPromise;
    console.log(navigator['xr']); // should be there!
    console.log(await WebXRSessionManager.IsSessionSupportedAsync("immersive-vr"));

    // create your scene
    const scene = new Scene(engine);
    scene.debugLayer.show();
    scene.ambientColor = new Color3(0, 0, 0);
    scene.fogMode = Scene.FOGMODE_LINEAR;
    scene.fogStart = 1;
    scene.fogEnd = 230;
    scene.fogColor = new Color3(169 / 255, 133 / 255, 90 / 255);

    if (EnableFreeflyCamera) {
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

        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        const inputManager = camera.inputs;
        const kb = inputManager.attached.keyboard;
        kb['keysLeft'] = [65];
        kb['keysRight'] = [68];
        kb['keysUp'] = [87];
        kb['keysDown'] = [83];

        // for debug
        window['input'] = inputManager;
    }

    const hemisphereLight = new HemisphericLight("hemisphere", new Vector3(0, 1, 0), scene);
    hemisphereLight.intensity = 0.6;
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
        gradientMaterial.topColor = new Color3(27 / 255, 118 / 255, 96 / 255);
        gradientMaterial.bottomColor = new Color3(228 / 255, 182 / 255, 118 / 255);
        gradientMaterial.offset = 0.25;
        gradientMaterial.smoothness = 10;
        gradientMaterial.backFaceCulling = false;
        mesh.material = gradientMaterial;

        // for debug
        console.log(result);
        console.log(root);
        window['sky'] = root;
    });
    SceneLoader.ImportMeshAsync('', 'assets/models/environment/', 'ground.glb', scene).then(result => {
        const root = result.meshes[0];
        // root.scaling.setAll(2);

        // for debug
        console.log(result);
        console.log(root);
        window['ground'] = root;
    });

    if (!EnableFreeflyCamera) {
        //Create input detection
        const inputController = new InputController(scene);
        //Create a pawn and than a controller for the player to control
        const playerPawn = new Pawn(scene);
        const playerController = new CharacterController(playerPawn.mainBody, scene, inputController);
    }

    // const env = scene.createDefaultEnvironment();

    // here we add XR support
    const xr = await scene.createDefaultXRExperienceAsync({
        // floorMeshes: [env.ground],
    });

    return scene;
};

createScene().then(scene => engine.runRenderLoop(() => scene.render()));