import { Scene, ActionManager, ExecuteCodeAction, Observer, Scalar } from 'babylonjs';

export class InputManager
{
    public inputMap: any;
    private _scene: Scene;

    //simple movement
    public horizontal: number = 0;
    public vertical: number = 0;
    //tracks whether or not there is movement in that axis
    public horizontalAxis: number = 0;
    public verticalAxis: number = 0;

    //simple movement
    public lookHorizontal: number = 0;
    public lookVertical: number = 0;

    //tracks whether or not there is movement in that axis
    public lookHorizontalAxis: number = 0;
    public lookVerticalAxis: number = 0;

    //jumping and dashing
    public jumpKeyDown: boolean = false;
    public dashing: boolean = false;

    //Mobile Input trackers
    //private _ui: Hud;
    public mobileLeft: boolean;
    public mobileRight: boolean;
    public mobileUp: boolean;
    public mobileDown: boolean;
    private _mobileJump: boolean;
    private _mobileDash: boolean;

    constructor(scene: Scene)
    {
        scene.actionManager = new ActionManager(scene);

        this.inputMap = {};

        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) =>
        {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) =>
        {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        scene.onBeforeRenderObservable.add(() =>
        {
            this._updateFromKeyboard();
        });
    }

    private _updateFromKeyboard(): void
    {
        if (this.inputMap["w"])
        {
            this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);
            this.verticalAxis = 1;

        }
        else if (this.inputMap["s"])
        {
            this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
            this.verticalAxis = -1;
        }
        else
        {
            this.vertical = 0;
            this.verticalAxis = 0;
        }

        if (this.inputMap["a"])
        {
            this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
            this.horizontalAxis = -1;

        }
        else if (this.inputMap["d"])
        {
            this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1;
        }
        else
        {
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }

        //if (this.inputMap["w"]) {
        //    this.lookVertical = Scalar.Lerp(this.lookVertical, 1, 0.2);
        //    this.lookVerticalAxis = 1;

        //}
        //else if (this.inputMap["s"]) {
        //    this.lookVertical = Scalar.Lerp(this.lookVertical, -1, 0.2);
        //    this.lookVerticalAxis = -1;
        //}
        //else {
        //    this.lookVertical = 0;
        //    this.lookVerticalAxis = 0;
        //}

        //if (this.inputMap["a"]) {
        //    this.lookHorizontal = Scalar.Lerp(this.lookHorizontal, -1, 0.2);
        //    this.horizontalAxis = -1;

        //}
        //else if (this.inputMap["d"]) {
        //    this.lookHorizontal = Scalar.Lerp(this.lookHorizontal, 1, 0.2);
        //    this.lookHorizontalAxis = 1;
        //}
        //else {
        //    this.lookHorizontal = 0;
        //    this.lookHorizontalAxis = 0;
        //}
    }
}