import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import BattleSession from "../session/BattleSession";
import BagSession from "../session/BagSession";
import RotationEffect from "../scene/RotationEffect";

export default class KillBossDialogMediator extends Mediator{
    public battleSession:BattleSession = null;
    public bagSession:BagSession = null;

    constructor(){
        super();
    }

    public dialog:ui.scene.KillBossDialogUI;

    public setSprite(sp:Laya.Sprite):void{
        this.dialog = <ui.scene.KillBossDialogUI>sp;
    }

    public init():void{
        this.dialog.baoxiang.ani1.gotoAndStop(0);
        this.dialog.baoxiang.once( Laya.Event.CLICK,this,this.clickFun );
        RotationEffect.play( this.dialog.light );
    }

    public clickFun():void{
        this.dialog.baoxiang.ani1.play( 0,false );
        this.dialog.baoxiang.ani1.on(Laya.Event.COMPLETE ,this,this.aniComFun);
    }

    public aniComFun():void{
        let arr = this.battleSession.getEquipArr();
        for( let i of arr ){
            this.bagSession.addEquipInBagBySys( i );
        }
        this.bagSession.getEquipDialog(arr,new Laya.Handler(this,this.aniCom2Fun) );
    }

    public aniCom2Fun():void {
        App.getInstance().openScene(MyGameInit.MainScene,true,MyGameInit.SelectStage);
    }
}