import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, FreeCamera, Color4, UniversalCamera, StandardMaterial, Color3, Matrix, Quaternion, PointLight, ShadowGenerator, WebXRCamera, WebXRSessionManager } from 'babylonjs';
import 'babylonjs-loaders';

export class Pawn {

    public collisionMesh: Mesh ;
    public scene;

    constructor(scene) {
        this.scene = scene;

        this.BuildCollision(this.scene);
    }

    private BuildCollision(scene): Mesh {
        /*  
          async function generatemeshes() {
  
              //create a placeholder mesh used to generate collision only
              const main = meshbuilder.createbox("pawncollider", { width: 2, depth: 1, height: 3 }, scene);
              main.isvisible = false;
              main.ispickable = false;
              main.checkcollisions = true;
  
              //move origin of box collider to the bottom of the mesh (to match player mesh)
              main.baketransformintovertices(matrix.translation(0, 1.5, 0))
  
              //for collisions
              main.ellipsoid = new vector3(1, 1.5, 1);
              main.ellipsoidoffset = new vector3(0, 1.5, 0);
  
              main.rotationquaternion = new quaternion(0, 1, 0, 0); // rotate the player mesh 180 since we want to see the back of the player
  
              // create meshes and generate models
              var body = mesh.createcylinder("body", 3, 2, 2, 0, 0, scene);
              var bodymtl = new standardmaterial("red", scene);
              bodymtl.diffusecolor = new color3(.8, .5, .5);
              body.material = bodymtl;
              body.ispickable = false;
              body.baketransformintovertices(matrix.translation(0, 1.5, 0)); // simulates the imported mesh's origin
  
              //// temp indicator to know our forward direction
              //var box = meshbuilder.createbox("nose", { width: 0.5, depth: 0.5, height: 0.25, facecolors: [new color4(0, 0, 0, 1), new color4(0, 0, 0, 1), new color4(0, 0, 0, 1), new color4(0, 0, 0, 1), new color4(0, 0, 0, 1), new color4(0, 0, 0, 1)] }, scene);
              //box.position.y = .7;
              //box.position.z = 1;
  
              ////parent the meshes
              //box.parent = body;
              body.parent = main;
  
              return { mesh: main as mesh }
          }
  
          return generatemeshes().then(assets => {
              this.mainbody = assets;
          })
      */

        //Create a placeholder mesh used to generate collision only
        const main = MeshBuilder.CreateBox("pawn", { width: 2, depth: 1, height: 3 }, scene);
        main.isVisible = false;
        main.isPickable = false;
        main.checkCollisions = true;
        main.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0))

        //for collisions
        main.ellipsoid = new Vector3(1, 1.5, 1);
        main.ellipsoidOffset = new Vector3(0, 1.5, 0);

        main.rotationQuaternion = new Quaternion(0, 1, 0, 0); // rotate the player mesh 180 since we want to see the back of the player

        /*
        // Visable body
        var body = Mesh.CreateCylinder("body", 3, 2, 2, 0, 0, scene);
        var bodymtl = new StandardMaterial("red", scene);
        bodymtl.diffuseColor = new Color3(.8, .5, .5);
        body.material = bodymtl;
        body.isPickable = false;
        body.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0)); // simulates the imported mesh's origin;
        body.parent = main;
        */

        this.collisionMesh = main;

        return this.collisionMesh;
    }
}