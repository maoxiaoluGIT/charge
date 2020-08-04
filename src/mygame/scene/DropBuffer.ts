import { ui } from "../../ui/layaMaxUI";
import HitObject from "./HitObject";
import { EQUIP_TYPE } from "../session/BattleSession";

export default class DropBuff extends HitObject{
    public view:ui.scene.DropBuffUI = null;
    
    constructor(){
        super();
        this.view = new ui.scene.DropBuffUI();
        this.addChild(this.view);
        this.view.y = -this.view.height;
    }
    
    public getHitBox():Laya.Sprite {
        return this.view.hitBox;
    }
    
    /**
     * 得到显示对象
     */
    public getDisplay():Laya.Sprite {
        return this.view;
    }
    
    public type:number;
    public setBuffType( type:number ):void {
        this.type = type;
        this.view.img.skin = null;
        if( type == EQUIP_TYPE.BUFF_ATT ){
            this.view.img.skin = "battlescene/gongjishi.png";
        }else if( type == EQUIP_TYPE.BUFF_CRIT ){
            this.view.img.skin = "battlescene/baojishi.png";
        }else if( type == EQUIP_TYPE.BUFF_DEF ){
            this.view.img.skin = "battlescene/fangyushi.png";
        }else if( type == EQUIP_TYPE.BUFF_SPEED ){
            this.view.img.skin = "battlescene/sudushi.png";
        }
    }

    public setMv():void {
        this.view.img.visible = false;
        let v:Laya.View = null;
        if( this.type == EQUIP_TYPE.BUFF_ATT ){
            v = this.view.gong;
        }else if( this.type == EQUIP_TYPE.BUFF_CRIT ){
            v = this.view.baoji;
        }else if( this.type == EQUIP_TYPE.BUFF_DEF ){
            v = this.view.fangyu;
        }else if( this.type == EQUIP_TYPE.BUFF_SPEED ){
            v = this.view.sudu;
        }
        v.visible = true;
        let ani:Laya.FrameAnimation = v["ani1"];
        ani.play(0,true);
    }

    public removeItem():void{
        let t = new Laya.Tween();
        t.to( this,{alpha:0},300,null,new Laya.Handler(this,this.overFun) );
    }

    public overFun():void{
        this.removeSelf();
    }

    public hitFun():boolean{
        this.hitTest = false;
        return true;
    }
}