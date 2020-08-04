import Mediator from "../../game/Mediator";
import { Equip, Res, SysItem } from "../config/SysConfig";
import App from "../../game/App";
import MyEvent from "../MyEvent";
import RotationEffect from "../scene/RotationEffect";
import { ui } from "../../ui/layaMaxUI";

export default class GetGoldMediator extends Mediator{

    public map:any = {};

    constructor(){
        super();
        this.map["普通"] = "sence/putong.png";
        this.map["精致"] = "sence/jingying.png";
        this.map["强化"] = "sence/qianghua.png";
        this.map["史诗"] = "sence/shishi.png";
        this.map["罕见"] = "sence/hanjian.png";
        this.map["稀有"] = "sence/xiyou.png";
    }

    public dialog:ui.scene.GetGoldDialogUI;

    public setSprite(s:Laya.Sprite):void{
       this.dialog = <any>s;
    }

    public undisFun():void{
        App.sendEvent( MyEvent.GET_GOLD_CLOSE );
    }

    public setParam(p:any):void{
        this.dialog.equipTxtImg.visible = false;
        this.dialog.goldFc.visible = false;
        if( p instanceof Equip ){
            this.dialog.logo.skin = null;
            this.dialog.logo.skin = Res.getItemUrl( p.getSysItem().id );
            this.dialog.logo.scale(2.2,2.2);
            this.dialog.equipTxtImg.visible = true;
            this.dialog.equipTxtImg.skin = this.map[p.getSysItem().name];
        } else if ( p instanceof SysItem ){
            this.dialog.logo.skin = null;
            this.dialog.logo.skin = Res.getItemUrl( p.id );
            this.dialog.logo.scale(2.2,2.2);
            this.dialog.equipTxtImg.visible = true;
            this.dialog.equipTxtImg.skin = this.map[p.name];
        } else {
            this.dialog.logo.skin = null;
            this.dialog.logo.skin = "sence/jinbidai.png";
            this.dialog.logo.scale(1,1);
            this.dialog.goldFc.visible = true;
            this.dialog.goldFc.value = <number>p + "";
        }
    }

    public init():void {
        RotationEffect.play( this.dialog.light );
        //Laya.SoundManager.playSound("sound/fx_openBox.wav");
        App.getInstance().gameSoundManager.playEffect("sound/fx_openBox.wav");
        this.dialog.once(Laya.Event.UNDISPLAY,this,this.undisFun);
        
    }
}