import {ui} from "./../../ui/layaMaxUI";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import TimeLogo from "./TimeLogo";
import RotationEffect from "./RotationEffect";
import MyEffect from "../effect/MyEffect";
import { SysStageInfo } from "../config/SysConfig";

export default class MainScene extends ui.scene.MainSceneUI {

    constructor() {
        super();
        this.height = Laya.stage.height;
        this.init();
        this.effect();
    }

    public effect():void{
        let t:number = 600;
        let d:number = 10;
        MyEffect.t2( this.bottomBox , "bottom" , -250, t ,d);
        MyEffect.t2( this.topBox , "top" , -90, t ,d);
        MyEffect.t2( this.rightBox , "right" , -150 ,t,d );
        MyEffect.t2( <any>this.timeLogo , "right" , -120  ,t,d );
    }

    public init():void{
        RotationEffect.play( this.zhuanImg );
        let t = new TimeLogo();
        t.setUI( this.timeLogo );
        this.timeLogo.on(Laya.Event.CLICK,this,this.timeLogoFun);
    }

    public timeLogoFun():void{
        App.dialog( MyGameInit.TimeGoldDialog );
    }
}