import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import SdkSession from "../session/SdkSession";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import BagSession, { GOLD_TYPE } from "../session/BagSession";
import { SysPet } from "../config/SysConfig";
import RotationEffect from "../scene/RotationEffect";

export default class FlyBoxMediator extends Mediator{
    public sdkSession:SdkSession = null;
    public bagSession:BagSession = null;

    constructor(){
        super();
    }

    public dialog:ui.scene.FlyBoxUI;

    public setSprite(sp:Laya.Sprite):void{
        this.dialog = <any>sp;
    }

    public init():void {
        this.sdkSession.initAdBtn( this.dialog.AdLingBtn , SdkSession.FLY_BOX );
        RotationEffect.play( this.dialog.light );
    }

    public AdLingBtn_click():void{
        this.sdkSession.playAdVideo( SdkSession.FLY_BOX  ,new Laya.Handler(this,this.adOverFun) );
    }

    public adOverFun(stat:number):void{
        if( stat == 1 ){
            let v = this.bagSession.getAverageEquipLv();
            let sys = SysPet.getLv(  700005 , v );
            let lv = App.getRandom2(sys.equipLvMin , sys.equipLvMax);
            let e = this.bagSession.getNewItemByLv( lv );
            this.bagSession.addEquipInBag(e);
            this.bagSession.changeGold( sys.gold , GOLD_TYPE.FLY_BOX );
            this.bagSession.getEquipDialog( [e, sys.gold] , null );
        }
    }
}