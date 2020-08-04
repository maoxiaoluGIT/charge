import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import SdkSession from "../session/SdkSession";
import { Equip, SysItem, Res } from "../config/SysConfig";
import MyGameInit from "../MyGameInit";
import App from "../../game/App";
import RotationEffect from "../scene/RotationEffect";
import { EQUIP_TYPE } from "../session/BattleSession";
import MyEffect from "../effect/MyEffect";

export default class MergeShareMediator extends Mediator{
    public sdkSession:SdkSession = null;
    
    constructor(){
        super();
    }

    public setSprite(sp):void{
        this.dialog = <any>sp;
    }

    public dialog:ui.scene.MergeShareDialogUI = null;
    public equip:Equip = null;

    public setParam(p):void{
        this.equip = p;
        this.setCell( this.dialog.c1 , p );
    }

    public setCell( c:ui.scene.BagListCellUI , equip:Equip ):void {
        let sys = <SysItem>App.getConfig( MyGameInit.sys_item , equip.id );
        c.logoImg.skin = Res.getItemUrl( sys.id );
        c.selectImg.visible = false;
        c.useImg.visible = false;
        c.canHeEffectView.visible = false;
        c.fc.value = sys.itemLevel + "";
        c.bgImg.skin = Res.getItemBorder( sys.itemQuality );
        
        let arr = sys.getArr();
        this.dialog.gongTxt.text = arr[0] + ":" + arr[1];
    }

    public init():void{
        RotationEffect.play( this.dialog.light );
        this.dialog.cancelBtn.visible = false;
        Laya.timer.once( 2000,this,this.timerFun );
        
        this.dialog.v1.sharebox.visible = true;
        this.dialog.v1.adbox.visible = false;
        this.dialog.v1.AdBtn.clickHandler = new Laya.Handler( this,this.cFun );

        this.dialog.v1.ani1.play(0,true);
    }

    public cFun():void{
        this.sdkSession.share( new Laya.Handler(this,this.sFun) );
    }

    public sFun():void{
        
    }

    public timerFun():void{
        this.dialog.cancelBtn.visible = true;
        MyEffect.alhpa( this.dialog.cancelBtn ,  1 , 150 );
    }
}