import { ui } from "../../ui/layaMaxUI";
import RotationEffect from "./RotationEffect";

export default class LoadView2 extends ui.scene.Loading2UI{
    constructor(){
        super();
        this.on(Laya.Event.PROGRESS,this,this.proFun);
        this.on(Laya.Event.DISPLAY,this,this.disFun);
        this.proFun(0);
        this.bg.height = Laya.stage.height;
        this.height = Laya.stage.height;
        this.disFun();
    }
    
    public disFun():void{
        RotationEffect.play( this.zhuan );
        this.proFun(0);
    }

    public proFun(value:number):void{
        this.jindu.text = Math.floor( value * 100  ) + "%";
    }
}