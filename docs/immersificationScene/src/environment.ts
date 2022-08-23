import { Scene, Mesh, Vector3, Color3, TransformNode, SceneLoader, ParticleSystem, Color4, Texture, PBRMetallicRoughnessMaterial, VertexBuffer, AnimationGroup, Sound, ExecuteCodeAction, ActionManager, Tags, MeshBuilder, StandardMaterial } from "@babylonjs/core";
import { Player } from "./characterController";

export class Environment {
    private _scene: Scene;

    constructor(scene: Scene)
    {
        this._scene = scene;
    }

    public async load()
    {
        //var ground = Mesh.CreateBox("ground", 24, this._scene);
        //ground.scaling = new Vector3(1, .02, 1);

        // ===================== Create Ground =====================
        // Our built-in 'ground' shape.
        var ground = MeshBuilder.CreateGround("ground", { width: 70, height: 70 }, this._scene);
        //ground.scaling = new Vector3(1, .02, 1);

        let groundMaterial = new StandardMaterial("Ground Material", this._scene);
        groundMaterial.diffuseColor = new Color3(0.87, 0.73, 0.46);
        ground.material = groundMaterial;

        // ===================== Create house =====================
        const box = MeshBuilder.CreateBox("box", {}, this._scene); //unit cube
        box.scaling = new Vector3(3, 3, 3);
        box.position.y += 1.5;

        const roof = MeshBuilder.CreateCylinder("roof", { diameter: 1.3, height: 1.2, tessellation: 3 }, this._scene);
        roof.scaling = new Vector3(1.5, 2.75, 2.75);
        roof.rotation.z = Math.PI / 2;
        roof.position.y = 3.5;
    }
}