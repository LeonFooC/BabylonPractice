import { Mesh } from 'babylonjs';
import 'babylonjs-loaders';
export declare class Pawn {
    collisionMesh: Mesh;
    scene: any;
    constructor(scene: any);
    private BuildCollision;
}
