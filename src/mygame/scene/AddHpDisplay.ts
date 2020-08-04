import HitObject from "./HitObject";
import { ui } from "../../ui/layaMaxUI";

export default class AddHpDiaplay extends HitObject{
    public display:ui.scene.AddHpDisplayUI;
    constructor(){
        super();
        this.display = new ui.scene.AddHpDisplayUI();
        this.addChild(this.display);
        this.display.y = -this.display.height - 80;
        this.display.ani1.play(0,true);
    }

    public getHitBox():Laya.Sprite {
        return this.display.hitBox;
    }
    
    public getDisplay():Laya.Sprite {
        return this.display;
    }
}