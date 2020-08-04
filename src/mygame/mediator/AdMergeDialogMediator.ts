import Mediator from "../../game/Mediator";
import { Equip, Res, SysItem } from "../config/SysConfig";
import { ui } from "../../ui/layaMaxUI";
import SdkSession from "../session/SdkSession";
import RotationEffect from "../scene/RotationEffect";
import MyGameInit from "../MyGameInit";
import App from "../../game/App";
import BagSession from "../session/BagSession";
import RoleDialog from "../scene/RoleDialog";
import MyEffect from "../effect/MyEffect";

export default class AdMergeDialogMediator extends Mediator{
    public sdkSession:SdkSession = null;
    public bagSession:BagSession = null;

    constructor(){
        super();
    }

    public dialog:ui.scene.AdMergeDialogUI;
    
    public setSprite( sp:Laya.Sprite ){
        this.dialog = <any>sp;
    }

    public equip:Equip;

    public setParam( equip:Equip ):void{
        this.equip = equip;
    }

    public init():void{
        RotationEffect.play( this.dialog.light );
        let sys = <SysItem>App.getConfig( MyGameInit.sys_item , this.equip.id );
        let arr = sys.getArr();
        this.dialog.gongTxt.text = arr[0] + ":" + arr[1];

        this.setCell( this.dialog.c1 , this.equip.id );
        this.setCell( this.dialog.c2 , this.equip.id );
        this.setCell( this.dialog.c3 , this.equip.id + 2);
        
        this.dialog.cancelBtn.visible = false;
        Laya.timer.once( 3000 ,  this, this.timerFun );

        this.dialog.v1.adbox.visible = true;
        this.dialog.v1.sharebox.visible = false;
        this.sdkSession.initAdBtn( this.dialog.v1.AdBtn , SdkSession.AD_DIALOG  );
        this.dialog.v1.ani1.play( 0 , true);

        this.dialog.v1.AdBtn.clickHandler = new Laya.Handler( this,this.AdBtn_click );
    }

    public timerFun():void{
        this.dialog.cancelBtn.visible = true;
        MyEffect.alhpa( this.dialog.cancelBtn ,  1 , 150 );
    }

    public setCell( c:ui.scene.BagListCellUI , id:number ):void {
        let sys = <SysItem>App.getConfig( MyGameInit.sys_item , id );
        c.logoImg.skin = Res.getItemUrl( id );
        c.selectImg.visible = false;
        c.useImg.visible = false;
        c.canHeEffectView.visible = false;
        c.fc.value = sys.itemLevel + "";
        c.bgImg.skin = Res.getItemBorder( sys.itemQuality );
    }

    public AdBtn_click():void{
        this.sdkSession.playAdVideo( SdkSession.AD_DIALOG , new Laya.Handler(this , this.overFun ) );
    }

    public overFun():void{
        let sys = <SysItem>App.getConfig( MyGameInit.sys_item , this.equip.id );
        let e = this.bagSession.getNewItem( sys.itemType , this.equip.lv + 2 );
        this.bagSession.addEquipInBag(e);
        App.dialog( MyGameInit.NewGetItemDialog , false ,  e );
        this.dialog.close();
    }
}