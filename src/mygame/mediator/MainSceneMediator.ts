import Mediator from "../../game/Mediator";
import MainScene from "../scene/MainScene";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import BagSession from "../session/BagSession";
import PetSession from "../session/PetSession";
import SdkSession from "../session/SdkSession";
import NewerSession from "../session/NewerSession";
import { ui } from "../../ui/layaMaxUI";
import { SysStageInfo } from "../config/SysConfig";
import BattleSession, { EQUIP_TYPE } from "../session/BattleSession";
import Tips from "../scene/Tips";
import Stage2Mediator from "./Stage2Mediator";
import DataSession from "../session/DataSession";
import LogType from "../session/LogType";
import GirlViewC from "../scene/GirlViewC";
import RotationEffect from "../scene/RotationEffect";
import TimeLogo from "../scene/TimeLogo";
import MyEffect from "../effect/MyEffect";
import TaskSession from "../session/TaskSession";
import TianFuSession from "../session/TianFuSession";

export default class MainSceneMediator extends Mediator{
    
    public bagSession:BagSession = null;
    public petSession:PetSession = null;
    public sdkSession:SdkSession = null;
    public newerSession:NewerSession = null;
    public battleSession:BattleSession = null;
    public dataSession:DataSession = null;
    public taskSession:TaskSession = null;
    public tianFuSession:TianFuSession = null;

    constructor(){
        super();
    }

    public mainScene:ui.scene.MainSceneUI;

    public setSprite(sprite:Laya.Sprite):void{
        this.mainScene = <any>sprite;
        this.mainScene.height = Laya.stage.height;
        this.mainScene.timeLogo.on(Laya.Event.CLICK,this,this.timeLogoFun);
    }

    public timeLogoFun():void{
        App.dialog( MyGameInit.TimeGoldDialog );
    }

    public setParam(param:any):void{
        if( param == MyGameInit.SelectStage ){
            this.battleSession.sys.starID;
            this.battleSession.openSelectStageDialog( this.battleSession.sys.starID);//;Stage2Mediator.STAGE_ID 
        }
    }

    public onEGG_UPDATE():void{
        this.mainScene.eggFc.value = this.petSession.eggNum + "";
    }

    public onRED_UPDATE():void {
        this.btnred( this.mainScene.roleBtn , this.bagSession.haveNewEquip() );
    }

    public onTASK_UPDATE():void{
        this.btnred( this.mainScene.taskBtn , this.taskSession.haveOver() );
    }

    public onTIAN_FU_UPDATE():void{
        this.btnred( this.mainScene.tianFuBtn , this.tianFuSession.check(false) );
    }

    public onTALENT_UPDATE():void{
        this.onTIAN_FU_UPDATE();
    }

    public btnred( btn:Laya.Button , value:boolean ):void{
        let v:ui.scene.hongtanUI = <any>btn.getChildByName("red");
        v.visible = value;
        if( value ){
            v.ani1.play(0,true);
        }else{
            v.visible = false;
        }
    }
    
    public onGOLD_UPDATE():void{
        this.mainScene.goldFc.value = this.bagSession.gold + "";
    }
    
    //public stageArr:Array<Laya.Button> = [];

    public init() {
        //this.mainScene.taskBtn.visible = false;
        this.mainScene.newView.ani1.play( 0,true );
        this.mainScene.new2.ani1.play( 0,true );
        
        this.onEGG_UPDATE();
        this.onGOLD_UPDATE();
        this.onRED_UPDATE();
        this.onTASK_UPDATE();
        this.onTIAN_FU_UPDATE();
        
        RotationEffect.play( this.mainScene.zhuanImg );
        
        let newview:ui.scene.newUI = <any>this.mainScene.stage3.getChildByName("newView");

        this.setStageView( this.mainScene.stage1, 0 );
        
        if( this.setStageView( this.mainScene.stage2, 13 ) ){
            this.mainScene.Stage2Mv.ani1.play(0,true);
        }
        
        if( this.setStageView( this.mainScene.stage3, 25 ) ){
            newview.visible = true;
            newview.ani1.play(0,true);
            this.mainScene.stage3Ani.ani1.play( 0,true );
        }
        
        this.mainScene.stage1.clickHandler = new Laya.Handler(this,this.stageFun,[1001]);
        this.mainScene.stage2.clickHandler = new Laya.Handler(this,this.stageFun,[2001]);
        this.mainScene.stage3.clickHandler = new Laya.Handler(this,this.stageFun,[3001]);

        if( this.newerSession.isNew ){
            this.newerSession.g.toulanFun();
            //this.onCLICK_CITY();
            Laya.timer.once( 800,this,this.onCLICK_CITY );
        }

        //this.mainScene.zhuanBtn.visible = false;

        this.effect();

        let t = new TimeLogo();
        t.setUI( this.mainScene.timeLogo );
    }

    private setStageView( btn:Laya.Button  , target:number ):boolean{
        btn.disabled = (this.battleSession.stageNum < target);
        return !btn.disabled;
    }

    public effect():void{
        let t:number = 600;
        let d:number = 10;
        MyEffect.t2( this.mainScene.bottomBox , "bottom" , -250, t ,d);
        MyEffect.t2( this.mainScene.topBox , "top" , -90, t ,d);
        MyEffect.t2( this.mainScene.rightBox , "right" , -150 ,t,d );
        MyEffect.t2( <any>this.mainScene.timeLogo , "right" , -120  ,t,d );
    }

    public stageFun( stageId:number ):void {
        let id = this.getMinNormalId( stageId ) - 1;
        if( this.battleSession.stageNum < id ){
            Tips.show( "请您先通过前面的关卡" );
            return;
        }
        this.battleSession.openSelectStageDialog( stageId );
    }

    public getMinNormalId( stageId:number ):number {
        let arr:Array<SysStageInfo> = App.getInstance().configManager.getDataArr( MyGameInit.sys_stageinfo );
        let arr1:Array<SysStageInfo> = [];
        for( let i of arr ){
            if( stageId == i.starID && i.stageType == 1 ){
                return i.id;
            }
        }
        return arr1[0].id;
    }

    public Tbtn_click():void{
        if( this.newerSession.isNew ){
            return;
        }
        App.dialog( MyGameInit.TreasureDialog );
    }

    public roleBtn_click():void{
        if( this.newerSession.isNew ){
            return;
        }
        App.dialog( MyGameInit.RoleDialog );
    }

    public goldBtn_click():void{
        if( this.newerSession.isNew ){
            return;
        }
        App.dialog( MyGameInit.TimeGoldDialog );
    }

    public signBtn_click():void{
        if( this.newerSession.isNew ){
            return;
        }
        this.sdkSession.savePlayerData( 1 );
        App.dialog( MyGameInit.SignDialog );
    }

    public settingBtn_click():void{
        if( this.newerSession.isNew ){
            return;
        }
        App.dialog( MyGameInit.SettingDialog );
    }

    public shareBtn_click():void{
        // App.dialog( MyGameInit.NewGetItemDialog , true, [] );
        // return;
        if( this.newerSession.isNew ){
            return;
        }
        this.sdkSession.share( new Laya.Handler(this,this.shareOverFun) );
    }

    public shareOverFun(stat:number):void{
        // return;
        // let arr:Array<any> = [];
        // arr.push(10000);
        // for( let i :number = 0 ;i < 2; i++ ){
        //     if( this.bagSession.isFull( EQUIP_TYPE.PET ) ){
                
        //     }else{
        //         let e = this.petSession.getNewPetNoEgg();
        //         arr.push(e);
        //     }
        // }
        // this.bagSession.getEquipDialog( arr , null, false );
        // this.bagSession.changeGold( 10000 );
    }

    public onCLICK_CITY():void {
        let a = NewerSession.getHand();
        Laya.stage.addChild(a);
        a.ani1.play( 0,true );
        a.visible = true;
        a.zOrder = 1000;
        let p = this.mainScene.stage1.localToGlobal( new Laya.Point(0,0) );
        a.x = p.x + 150;
        a.y = p.y + 190;
        this.dataSession.log( LogType.NEWER_CLICK_CITY );
    }

    public clicknext():void{
        NewerSession.getHand().visible = false;
    }

    public rankBtn_click():void{
        if( this.newerSession.isNew ){
            return;
        }
        App.dialog(MyGameInit.RankDialog);
    }

    public getUrl():Array<any>{
        //let arr:Array<any> = ["sound/alert.mp3","sound/comboEffect1.wav","sound/fx_button.wav","sound/fx_Hit.wav","sound/fx_itemBad.wav","sound/fx_itemGood.wav","sound/fx_itemSelect.wav","sound/fx_lose.wav","sound/fx_move.wav","sound/fx_openBox.wav","sound/fx_success.wav"];
        //arr.push( ui.scene.PrePlayerUI );
        //return arr;
        return [];
    }

    public getPreUrl():Array<any>{
        return [];
        // let arr:Array<any> = ["sound/alert.mp3","sound/comboEffect1.wav","sound/fx_button.wav","sound/fx_Hit.wav","sound/fx_itemBad.wav","sound/fx_itemGood.wav","sound/fx_itemSelect.wav","sound/fx_lose.wav","sound/fx_move.wav","sound/fx_openBox.wav","sound/fx_success.wav"];
        // arr.push( ui.scene.PrePlayerUI );
        // arr.push( "sence/hechengzha.png" );
        // arr.push( "sence/clip_he.png" );
        // return arr;
        // //[ "res/atlas/player/equip.png","res/atlas/player/equip.atlas","res/atlas/player/head.png","res/atlas/player/head.atlas","res/atlas/player/horse.png","res/atlas/player/horse.atlas","res/atlas/player/weapon.png","res/atlas/player/weapon.atlas"];
        // return //["sence/hechengzha.png","sence/clip_he.png", "res/atlas/player/equip.png","res/atlas/player/equip.atlas","res/atlas/player/head.png","res/atlas/player/head.atlas","res/atlas/player/horse.png","res/atlas/player/horse.atlas","res/atlas/player/weapon.png","res/atlas/player/weapon.atlas"];
    }

    public getLoaderUrl():Array<string>{
        let arr:Array<string> = [];
        arr.push("res/atlas/sence.atlas");
        arr.push("res/atlas/mainscene.atlas");
        arr.push("res/atlas/player/all.atlas" );
        return arr;
    }

    public taskBtn_click():void{
        App.dialog(MyGameInit.TASK);
    }

    public tianFuBtn_click():void{
        App.dialog(MyGameInit.TIANFU);
    }

    public zhuanBtn_click():void{
        App.dialog( MyGameInit.ZHUAN );
    }
}