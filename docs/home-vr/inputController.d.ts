import { Scene } from 'babylonjs';
export declare class InputController {
    inputMap: any;
    private _scene;
    horizontal: number;
    vertical: number;
    horizontalAxis: number;
    verticalAxis: number;
    lookHorizontal: number;
    lookVertical: number;
    lookHorizontalAxis: number;
    lookVerticalAxis: number;
    jumpKeyDown: boolean;
    dashing: boolean;
    mobileLeft: boolean;
    mobileRight: boolean;
    mobileUp: boolean;
    mobileDown: boolean;
    private _mobileJump;
    private _mobileDash;
    constructor(scene: Scene);
    private _updateFromKeyboard;
}
