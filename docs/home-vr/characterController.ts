import { TransformNode, ShadowGenerator, Scene, Mesh, UniversalCamera, ArcRotateCamera, Vector3, Quaternion, Ray, PointerEventTypes, StandardMaterial, Color3, WebXRSessionManager, WebXRCamera, FreeCameraDeviceOrientationInput, VRExperienceHelper, WebXRExperienceHelper, MeshBuilder, WebXRDefaultExperience } from "babylonjs";

export class CharacterController extends TransformNode {
    public camera: UniversalCamera;
    public scene: Scene;
    private input;

    //Player
    public mesh: Mesh; //outer collisionbox of player

    //Camera
    private camTransformDummy: TransformNode;
    private _yTilt: TransformNode;

    //const values
    private static readonly PLAYER_SPEED: number = 7;
    private static readonly JUMP_FORCE: number = 0.80;
    private static readonly GRAVITY: number = -2.8;
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);

    //player movement vars
    private deltaTime: number = 0;
    private _h: number;
    private _v: number;

    private moveDirection: Vector3 = new Vector3();
    private _inputAmt: number;

    //gravity, ground detection, jumping
    private _gravity: Vector3 = new Vector3();
    private _lastGroundPos: Vector3 = Vector3.Zero(); // keep track of the last grounded position
    private _grounded: boolean;

    private readonly yOffest: number = 1.7;

    private useGravity: boolean = false;

    constructor(pawn, scene: Scene, createCamera: boolean, input?)
    {
        super("playerController", scene);
        this.scene = scene;

        this.mesh = pawn;
        this.mesh.parent = this;

        this.SetupCharacterCameraRoot();
        if (createCamera) {
            this.CreateCharacterCamera();
        }

        ////shadowGenerator.addShadowCaster(pawnBody.mesh); //the player mesh will cast shadows

        this.input = input; //inputs we will get from inputController.ts
    }

    public SetupBeforeRenderUpdateLoop() {
        this.scene.registerBeforeRender(() => {
            this.UpdatePhysics();
            this.UpdateCamera();

            // cheap and dirty way to test look interaction
            this.HitRaycast(10);
        })
    }

    private UpdatePhysics(): void {

        // Get inputs
        this.UpdateFromControls();

        //move our mesh
        this.UpdateGroundDetection();
    }

    private UpdateCamera(): void {
        let characterCenter = this.mesh.position.y + this.yOffest;
        //this.camTransformDummy.position = Vector3.Lerp(this.camTransformDummy.position, new Vector3(this.mesh.position.x, characterCenter, this.mesh.position.z), 0.4);
        this.camTransformDummy.position = this.camera.position = Vector3.Lerp(this.camera.position, new Vector3(this.mesh.position.x, characterCenter, this.mesh.position.z), 0.4);
    }

    private SetupCharacterCameraRoot() {
        //root camera parent that handles positioning of the camera to follow the player
        this.camTransformDummy = new TransformNode("cameraRoot");
        this.camTransformDummy.position = new Vector3(0, this.yOffest, -50); //initialized at (0,0,0)
        //to face the player from behind (180 degrees)
        this.camTransformDummy.rotation = new Vector3(0, Math.PI, 0);
}

    private CreateCharacterCamera() {
        ////rotations along the x-axis (up/down tilting)
        //let yTilt = new TransformNode("ytilt");
        ////adjustments to camera view to point down at our player
        //yTilt.rotation = Player.ORIGINAL_TILT;
        //this._yTilt = yTilt;
        //yTilt.parent = this._camRoot;

        //our actual camera that's pointing at our root's position
        this.camera = new UniversalCamera("characterCamera", new Vector3(0, this.yOffest, -50), this.scene);

        this.camera.position = this.camTransformDummy.position;
        this.camera.fov = .9;
        this.camera.inputs.removeByType("FreeCameraKeyboardMoveInput");

        this.scene.activeCamera = this.camera;

        // XR camera setup here?

        /*
        //const env = this.scene.createDefaultEnvironment();
        //const xr = this.scene.createDefaultXRExperienceAsync();
        this.vrHelper = this.scene.createDefaultVRExperience(
            {
                createDeviceOrientationCamera: false, useXR: true
            });


        //const xrSessionManager = new WebXRSessionManager(this.scene);
        //const xrCamera = new WebXRCamera("nameOfCamera", this.scene, xrSessionManager);

        //// if scene.activeCamera is still the non-VR camera:
        //xrCamera.setTransformationFromNonVRCamera();
        //// Otherwise, provide the non-vr camera to copy the transformation from:
        //xrCamera.setTransformationFromNonVRCamera(scene.getCameraByName("cam"));
        //// If you want XR to also reset the XR Reference space, set the 2nd variable to true:
        //xrCamera.setTransformationFromNonVRCamera(scene.getCameraByName("cam"), true);

        this.vrHelper.vrDeviceOrientationCamera.inputs.removeByType("FreeCameraKeyboardMoveInput");
        */

        /*
        var useXR = true;
        try {
            if (useXR) {

                const xr = this.scene.createDefaultXRExperienceAsync();

                const box = MeshBuilder.CreateCapsule("2rdfe", {}, this._scene);
                box.position = new Vector3(0, 5, 0);

                const bbox = MeshBuilder.CreateCapsule("capascd", {}, this._scene);
                bbox.position = new Vector3(0, 10, 0);
            }
            else {
                this.vrHelper = this.scene.createDefaultVRExperience(
                    {
                        createDeviceOrientationCamera: false, useXR: true
                    });
            }
            //const box = MeshBuilder.CreateCapsule("cap", {}, this._scene);
            //box.position = new Vector3(0, 10, 0);
        }
        catch (e) {
            console.log(e);
            // no XR support
            //const box = MeshBuilder.CreateDisc("disc", {}, this._scene);
            //box.position = new Vector3(0, 6, 0);
        }
        */

        this.UpdateCamera();

        return this.camera;
    }

    public AssignCameraToController(camera: UniversalCamera) {

        this.camera = camera

        this.camera.position = this.camTransformDummy.position;
        this.camTransformDummy.rotation = new Vector3(0, Math.PI, 0);
        this.camera.fov = .9;

        //remoce keyboard (movement) input from camera
        this.camera.inputs.removeByType("FreeCameraKeyboardMoveInput");

        this.scene.activeCamera = this.camera;

        this.UpdateCamera();
    }

    private UpdateFromControls(): void {
        this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        this.camTransformDummy.rotation = this.camera.rotation;

        this.moveDirection = Vector3.Zero(); // vector that holds movement information
        this._h = this.input.horizontal; //x-axis
        this._v = this.input.vertical; //z-axis


        //--MOVEMENTS BASED ON CAMERA (as it rotates)--
        let fwd = this.camTransformDummy.forward;
        let right = this.camTransformDummy.right;

        let correctedVertical = fwd.scaleInPlace(this._v);
        let correctedHorizontal = right.scaleInPlace(this._h);

        //movement based off of camera's view
        let move = correctedHorizontal.addInPlace(correctedVertical);

        //clear y so that the character doesnt fly up, normalize for next step
        this.moveDirection = new Vector3((move).normalize().x, 0, (move).normalize().z);

        //clamp the input value so that diagonal movement isn't twice as fast
        let inputMag = Math.abs(this._h) + Math.abs(this._v);

        if (inputMag < 0) {
            this._inputAmt = 0;
        }
        else if (inputMag > 1) {
            this._inputAmt = 1;
        }
        else {
            this._inputAmt = inputMag;
        }

        //final movement that takes into consideration the inputs
        this.moveDirection = this.moveDirection.scaleInPlace(this._inputAmt * CharacterController.PLAYER_SPEED * this.deltaTime);

        //this.mesh.moveWithCollisions(this.moveDirection);

        //Rotations
        //check if there is movement to determine if rotation is needed
        let input = new Vector3(this.input.horizontalAxis, 0, this.input.verticalAxis); //along which axis is the direction

        if (input.length() == 0) {//if there's no input detected, prevent rotation and keep player in same rotation
            return;
        }
        //rotation based on input & the camera angle
        let angle = Math.atan2(this.input.horizontalAxis, this.input.verticalAxis);
        angle += this.camTransformDummy.rotation.y;
        let targ = Quaternion.FromEulerAngles(0, angle, 0);
        this.mesh.rotationQuaternion = Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this.deltaTime);
    }

    private UpdateGroundDetection(): void {
        if (!this._isGrounded()) {
            this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this.deltaTime * CharacterController.GRAVITY));
            this._grounded = false;
        }

        //limit the speed of gravity to the negative of the jump power
        if (this._gravity.y < -CharacterController.JUMP_FORCE) {
            this._gravity.y = -CharacterController.JUMP_FORCE;
        }

        if (this.useGravity) {

            this.mesh.moveWithCollisions(this.moveDirection.addInPlace(this._gravity));
        }
        else {
            this.mesh.moveWithCollisions(this.moveDirection);
        }


        if (this._isGrounded()) {
            this._gravity.y = 0;
            this._grounded = true;
            this._lastGroundPos.copyFrom(this.mesh.position);
        }
    }

    private _floorRaycast(offsetx: number, offsetz: number, raycastlen: number): Vector3 {
        let raycastFloorPos = new Vector3(this.mesh.position.x + offsetx, this.mesh.position.y + 0.5, this.mesh.position.z + offsetz);
        let ray = new Ray(raycastFloorPos, Vector3.Up().scale(-1), raycastlen);

        let predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }
        let pick = this.scene.pickWithRay(ray, predicate);

        if (pick.hit) {
            return pick.pickedPoint;
        } else {
            return Vector3.Zero();
        }
    }

    private _isGrounded(): boolean {
        if (this._floorRaycast(0, 0, 0.6).equals(Vector3.Zero())) {
            return false;
        }
        else {
            return true;
        }
    }

    private HitRaycast(raycastlen: number): Vector3 {
        let rayPos = this.camera.position;
        let ray = new Ray(rayPos, this.scene.activeCamera.getForwardRay(1).direction, raycastlen);

        let predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }
        let pick = this.scene.pickWithRay(ray, predicate);

        if (pick.hit)
        {
            let hitMat = new StandardMaterial("hitMat", this.scene);
            hitMat.diffuseColor = new Color3(1, 0, 0.46);
            pick.pickedMesh.material = hitMat;


            return pick.pickedPoint;
        }
        else
        {
            return Vector3.Zero();
        }
    }
}