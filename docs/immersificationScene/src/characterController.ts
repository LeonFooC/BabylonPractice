import { TransformNode, ShadowGenerator, Scene, Mesh, UniversalCamera, ArcRotateCamera, Vector3, Quaternion, Ray, PointerEventTypes, StandardMaterial, Color3, WebXRSessionManager, WebXRCamera, FreeCameraDeviceOrientationInput, VRExperienceHelper, WebXRExperienceHelper, MeshBuilder, WebXRDefaultExperience } from "@babylonjs/core";

export class Player extends TransformNode {
    public camera: UniversalCamera;
    public scene: Scene;
    private _input;

    //Player
    public mesh: Mesh; //outer collisionbox of player

    //Camera
    private _camRoot: TransformNode;
    private _yTilt: TransformNode;

    //const values
    private static readonly PLAYER_SPEED: number = 7;
    private static readonly JUMP_FORCE: number = 0.80;
    private static readonly GRAVITY: number = -2.8;
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);

    //player movement vars
    private _deltaTime: number = 0;
    private _h: number;
    private _v: number;

    private _moveDirection: Vector3 = new Vector3();
    private _inputAmt: number;

    //gravity, ground detection, jumping
    private _gravity: Vector3 = new Vector3();
    private _lastGroundPos: Vector3 = Vector3.Zero(); // keep track of the last grounded position
    private _grounded: boolean;

    private readonly yOffest: number = 1.7;

    private lookTime: number = 2;
    private lookTimer: number = 0;

    private vrHelper: VRExperienceHelper;
    private xrHelper: WebXRExperienceHelper;

    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        //const sessionManager = await this.xrHelper.enterXRAsync("immersive-vr", "local-floor" /*, optionalRenderTarget */);

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        shadowGenerator.addShadowCaster(assets.mesh); //the player mesh will cast shadows

        this._input = input; //inputs we will get from inputController.ts
    }

    public activatePlayerCamera(): UniversalCamera {
        this.scene.registerBeforeRender(() => {
            this._beforeRenderUpdate();
            this._updateCamera();

        })
        return this.camera;
    }

    private _beforeRenderUpdate(): void {
        this._updateFromControls();
        //move our mesh
        this._updateGroundDetection();

        this.LookRaycast(10);
    }

    private _updateCamera(): void {
        let centerPlayer = this.mesh.position.y + this.yOffest;
        this._camRoot.position = Vector3.Lerp(this._camRoot.position, new Vector3(this.mesh.position.x, centerPlayer, this.mesh.position.z), 0.4);
        this.camera.position = Vector3.Lerp(this.camera.position, new Vector3(this.mesh.position.x, centerPlayer, this.mesh.position.z), 0.4);

        
        if (this.scene.activeCamera === this.vrHelper.vrDeviceOrientationCamera)
        {

            FreeCameraDeviceOrientationInput.WaitForOrientationChangeAsync(1000);
            this.vrHelper.vrDeviceOrientationCamera.position = this._camRoot.position;
            this.vrHelper.vrDeviceOrientationCamera.rotation = this.camera.rotation;

        }
        else
        {
            //this.scene.activeCamera.absoluteRotation.y = 0;
            this.scene.activeCamera = this.camera;
        }
        
        //if (this.scene.activeCamera === this.xrHelper.camera) {
        //    //Do stuff
        //}
        //else if (this.scene.activeCamera == this.camera) {
        //    //Do stuff
        //}
    }

    private _setupPlayerCamera() {
        //root camera parent that handles positioning of the camera to follow the player
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, this.yOffest, -50); //initialized at (0,0,0)
        //to face the player from behind (180 degrees)
        this._camRoot.rotation = new Vector3(0, Math.PI, 0);

        ////rotations along the x-axis (up/down tilting)
        //let yTilt = new TransformNode("ytilt");
        ////adjustments to camera view to point down at our player
        //yTilt.rotation = Player.ORIGINAL_TILT;
        //this._yTilt = yTilt;
        //yTilt.parent = this._camRoot;

        //our actual camera that's pointing at our root's position
        this.camera = new UniversalCamera("cam", new Vector3(0, this.yOffest, -50), this.scene);
        //this.camera.lockedTarget = this._camRoot.position;
        this.camera.fov = .9;
        //this.camera.parent = this._camRoot;

        this.camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
        //this.camera.inputs.removeByType("FreeCameraMouseInput");

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

        var useXR = false;
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


        return this.camera;
    }

    private _updateFromControls(): void {
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        this._camRoot.rotation = this.camera.rotation;

        this._moveDirection = Vector3.Zero(); // vector that holds movement information
        this._h = this._input.horizontal; //x-axis
        this._v = this._input.vertical; //z-axis


        //--MOVEMENTS BASED ON CAMERA (as it rotates)--
        let fwd = this._camRoot.forward;
        let right = this._camRoot.right;
                
        if (this.scene.activeCamera === this.vrHelper.vrDeviceOrientationCamera)
        {
            fwd = this.scene.activeCamera.getForwardRay(100).direction;
            right = this.scene.activeCamera.getRightTarget().normalize();
        }

        let correctedVertical = fwd.scaleInPlace(this._v);
        let correctedHorizontal = right.scaleInPlace(this._h);

        //movement based off of camera's view
        let move = correctedHorizontal.addInPlace(correctedVertical);

        //clear y so that the character doesnt fly up, normalize for next step
        this._moveDirection = new Vector3((move).normalize().x, 0, (move).normalize().z);

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
        this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * Player.PLAYER_SPEED * this._deltaTime);

        //Rotations
        //check if there is movement to determine if rotation is needed
        let input = new Vector3(this._input.horizontalAxis, 0, this._input.verticalAxis); //along which axis is the direction

        if (input.length() == 0) {//if there's no input detected, prevent rotation and keep player in same rotation
            return;
        }
        //rotation based on input & the camera angle
        let angle = Math.atan2(this._input.horizontalAxis, this._input.verticalAxis);
        angle += this._camRoot.rotation.y;
        let targ = Quaternion.FromEulerAngles(0, angle, 0);
        this.mesh.rotationQuaternion = Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this._deltaTime);

    }

    private _updateGroundDetection(): void {
        if (!this._isGrounded()) {
            this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this._deltaTime * Player.GRAVITY));
            this._grounded = false;
        }

        //limit the speed of gravity to the negative of the jump power
        if (this._gravity.y < -Player.JUMP_FORCE) {
            this._gravity.y = -Player.JUMP_FORCE;
        }

        this.mesh.moveWithCollisions(this._moveDirection.addInPlace(this._gravity));

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

    private LookRaycast(raycastlen: number): Vector3 {
        let rayPos = this.camera.position;
        let ray = new Ray(rayPos, this.scene.activeCamera.getForwardRay(1).direction, raycastlen);

        let predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }
        let pick = this.scene.pickWithRay(ray, predicate);

        if (pick.hit) {
            this.lookTimer = this.lookTime + this._deltaTime;

            if (this.lookTimer >= this.lookTime) {
                let hitMat = new StandardMaterial("hitMat", this._scene);
                hitMat.diffuseColor = new Color3(1, 0, 0.46);
                pick.pickedMesh.material = hitMat;

                this.lookTimer = 0;
            }

            return pick.pickedPoint;
        }
        else {
            if (this.lookTimer > 0) {
                this.lookTimer -= this._deltaTime;
                if (this.lookTimer < 0) {
                    this.lookTimer = 0;
                }
            }
            return Vector3.Zero();
        }
    }
}