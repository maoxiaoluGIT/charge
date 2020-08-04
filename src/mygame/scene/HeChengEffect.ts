import { ui } from "../../ui/layaMaxUI";
import { SysItem, Res } from "../config/SysConfig";

export default class HeChengEffect extends ui.scene.hechengUI {
    constructor(){
        super();
        this.on(Laya.Event.UNDISPLAY,this,this.undisFun);
    }

    public undisFun():void{
        Laya.timer.clear(this,this.loopFun);
    }
    
    private sys1:SysItem;
    private sys2:SysItem;
    
    public h1Skin:string;
    public h2Skin:string;
    public h3Skin:string;
    public bianSkin:string;

    public play( sys1:SysItem , sys2:SysItem ):void{
        this.sys1 = sys1;
        this.sys2 = sys2;
        
        this.h1Skin = Res.getItemUrl( this.sys1.id );
        this.h2Skin = Res.getItemUrl( this.sys1.id );
        this.h3Skin = Res.getItemUrl( this.sys1.id );
        this.bianSkin = Res.getItemUrl( this.sys2.id );
        this.loopFun();
        this.kuang.skin = Res.getItemBorder( this.sys1.itemQuality );
        this.hechengguang.visible = false;
        this.hechengguang.stop();
        this.ani1.play(0,false);
        this.ani1.on(Laya.Event.COMPLETE,this,this.aniComFun);
        Laya.timer.frameLoop(1,this,this.loopFun );
    }

    public loopFun():void{
        this.he2.skin = this.h1Skin;
        this.he1.skin = this.h2Skin;
        this.he3.skin = this.h3Skin;
        this.bian.skin = this.bianSkin;
    }

    public aniComFun():void{
        this.hechengguang.visible = true;
        this.hechengguang.play();
        //this.hechengguang.interval = 1000 / 60;
        Laya.timer.once( 800 , this,this.timerFun );
        this.kuang.skin = Res.getItemBorder( this.sys2.itemQuality );
    }

    public timerFun():void{
        Laya.Tween.to( this,{alpha:0},200,null,new Laya.Handler( this,this.tweenOver ) );
    }

    public tweenOver():void{
        this.removeSelf();
    }
}