import { ui } from "../../ui/layaMaxUI";

export default class Tips extends ui.scene.ErrorTipsUI{
    constructor(){
        super();
    }

    public static show(text:string):void{
        let t = new Tips();
        t.txt.text = text;
        Laya.stage.addChild( t );
        t.zOrder = 10002;
        t.centerX = 0;
        t.y = (Laya.stage.height - t.height)/2 + 100;

        let tween = new Laya.Tween();
        tween.to( t,{ y:100 } , 6000 , null , new Laya.Handler( null , Tips.tOver , [t] ) );
        let tw2 = new Laya.Tween();
        tw2.to( t, { alpha:0},500,null,null,1000 );
    }

    public static tOver(t:Tips):void{
        t.removeSelf();
    }
}