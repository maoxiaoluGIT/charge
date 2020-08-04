import Mediator from "../../game/Mediator";
import BagSession, { GOLD_TYPE } from "../session/BagSession";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import MyEvent from "../MyEvent";
import SdkSession from "../session/SdkSession";
import BattleSession, { EQUIP_TYPE } from "../session/BattleSession";
import PetSession from "../session/PetSession";
import { ui } from "../../ui/layaMaxUI";
import MyEffect from "../effect/MyEffect";
import RotationEffect from "../scene/RotationEffect";

export default class GameOverDialogMediator extends Mediator{
    public bagSession:BagSession = null;
    public sdkSession:SdkSession = null;
    public petSession:PetSession = null;
    public battleSession:BattleSession = null;

    constructor(){
        super();
    }

    public init():void{
        this.sdkSession.initAdBtn( this.dialog.btn2 ,  SdkSession.GAME_OVER );
        this.dialog.ani1.interval = 50;
        this.dialog.ani1.play(0,false);
        this.dialog.ani1.once(Laya.Event.COMPLETE,this,this.comFun);
        this.dialog.light.visible = false;
        MyEffect.delayTweenBtn( this.dialog.btn1 , 1000 );
        MyEffect.delayTweenBtn( this.dialog.btn2 , 1200 );
        MyEffect.delayTweenBtn( this.dialog.btn3 , 1300 );
        this.dialog.ten.ani1.play(0,true);

        this.dialog.light.visible = false;
        this.dialog.btn2.disabled = false;
        this.dialog.btn1.disabled = false;
        this.dialog.btn3.disabled = false;
    }

    public comFun():void{
        this.dialog.light.visible = true;
        MyEffect.alhpa( this.dialog.light,1,1000 );
        RotationEffect.play( this.dialog.light );
    }

    public dialog:ui.scene.shengliUI;

    public setSprite(sp:Laya.Sprite):void{
        this.dialog = <any>sp;
        this.dialog.height = Laya.stage.height;
    }

    public btn1_click():void{
        this.getGold(1000);
        this.disBtn();
    }

    public getGold( value:number ):void{
        this.bagSession.changeGold( value , GOLD_TYPE.GAME_OVER_NORMAL );
        this.bagSession.getGoldAndMain();
        App.dialog( MyGameInit.NewGetItemDialog , false ,  value );
    }

    public btn2_click():void{
        this.sdkSession.playAdVideo( SdkSession.GAME_OVER , new Laya.Handler(this,this.adFun) );
    }

    public btn3_click():void {
        this.bagSession.changeGold( 1000 , GOLD_TYPE.GAME_OVER_NORMAL );
        App.dialog( MyGameInit.NewGetItemDialog , false ,  1000 );
        App.getInstance().eventManager.once(MyEvent.GET_GOLD_CLOSE ,this,this.next );
        //this.sdkSession.share( new Laya.Handler(this,this.shareOverFun) );
    }

    public next():void{
        let id = this.battleSession.sys.nextId;
        // if( id > 5 && id % 2 == 1 ){
        //     Laya.MouseManager.enabled = false;
        //     //this.sdkSession.chaPingAd( SdkSession.NEXT_STAGE_CHAPING , new Laya.Handler( this, this.nextHandlerFun ) );            
        //     this.nextHandlerFun();
        // }else{
            this.nextHandlerFun();
        //}
    }

    public nextHandlerFun():void{
        Laya.MouseManager.enabled = true;
        this.battleSession.setMaxStage();
        App.getInstance().openScene( MyGameInit.BattleScene );
    }

    /**
     * 分享结果
     */
    public shareOverFun( stat:number ):void{
        let arr:Array<any> = [];
        arr.push(10000);
        this.dialog.btn3.visible = false;
        for( let i :number = 0 ;i < 2; i++ ){
            if( this.bagSession.isFull( EQUIP_TYPE.PET ) ){
                
            }else{
                let e = this.petSession.getNewPetNoEgg();
                arr.push(e);
            }
        }
        this.bagSession.getEquipDialog( arr , null, false );
        this.bagSession.changeGold( 10000 , GOLD_TYPE.GAME_OVER_AD );
    }

    public adFun( stat:number ):void{
        if( stat == 1 ){
            this.getGold( 10000 );
            this.disBtn();
        }
    }

    public disBtn():void{
        this.dialog.btn2.disabled = true;
        this.dialog.btn1.disabled = true;
    }

    public goldFun():void{
        App.getInstance().openScene( MyGameInit.MainScene , false, MyGameInit.SelectStage );
    }
}