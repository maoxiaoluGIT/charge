import { ui } from "../../ui/layaMaxUI";

export default class LoadView extends ui.scene.LoadViewUI{
    constructor(){
        super();
        this.on(Laya.Event.DISPLAY,this,this.disFun);
        this.on(Laya.Event.UNDISPLAY,this,this.undisFun);
    }

    public speed:number = 0.3;

    public disFun():void{
        Laya.timer.frameLoop(1,this,this.loopFun);
    }

    public loopFun():void{
        this.img.rotation += (Laya.timer.delta * this.speed);
    }
    
    public undisFun():void{
        Laya.timer.clearAll(this);
    }
}