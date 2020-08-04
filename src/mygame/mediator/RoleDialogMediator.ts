import Mediator from "../../game/Mediator";
import BattleSession, { EQUIP_TYPE } from "../session/BattleSession";
import RoleDialog from "../scene/RoleDialog";
import BagSession from "../session/BagSession";
import NewerSession from "../session/NewerSession";
import App from "../../game/App";
import MyEvent from "../MyEvent";
import { ui } from "../../ui/layaMaxUI";
import PetSession from "../session/PetSession";
import SdkSession from "../session/SdkSession";
import Tips from "../scene/Tips";
import MyGameInit from "../MyGameInit";
import DataSession from "../session/DataSession";
import LogType from "../session/LogType";

export default class RoleDialogMediator extends Mediator{
    public battleSession:BattleSession = null;
    public bagSession:BagSession = null;
    public newerSession:NewerSession = null;
    public petSession:PetSession = null;
    public sdkSession:SdkSession = null;
    public dataSession:DataSession = null;

    constructor(){
        super();
    }
    
    public dialog:RoleDialog;

    public setSprite(sprite:Laya.Sprite):void{
        this.dialog = <RoleDialog>sprite;
    }

    public init():void{
        this.dialog.setData( this.bagSession.bagMap );
        if( this.newerSession.isNew ){
            Laya.timer.once( 500,this,this.showMove );
            this.dialog.closeBtn.name = "";
            this.dialog.sellBtn.mouseEnabled = false;
            this.dialog.list.getCell(0).mouseEnabled = false;
            this.dialog.list.getCell(1).mouseEnabled = false;
            this.dialog.zhengliBtn.mouseEnabled = false;
            this.dialog.tab.mouseEnabled = false;
            this.dialog.equipBtn.mouseEnabled = false;
            
            this.dataSession.log( LogType.NEWER_OPEN_ROLE );
        }else{
            this.dialog.closeBtn.name = "close";
            this.dialog.sellBtn.mouseEnabled = true;
            this.dialog.list.getCell(0).mouseEnabled = true;
            this.dialog.list.getCell(1).mouseEnabled = true;
            this.dialog.zhengliBtn.mouseEnabled = true;
            this.dialog.tab.mouseEnabled = true;
            this.dialog.equipBtn.mouseEnabled = true;
            this.dialog.list.mouseEnabled = true;
        }
        this.onRED_UPDATE();
        this.onEQUIP_UPDATE();
        this.resetEggNum();
        this.sdkSession.initAdBtn( this.dialog.effBtn , SdkSession.GET_PET );
    }

    public zhengliBtn_click():void{
        this.dialog.zhengliFun();
        //整理完必须
        this.dataSession.saveData();
    }

    /**
     * 新手引导手指头移动
     */
    public showMove():void{
        let v = NewerSession.getHand();
        Laya.stage.addChild( v );
        v.ani1.gotoAndStop(0);
        v.lightClip.stop();
        v.lightClip.visible = false;
        v.zOrder = 100000;
        this.comFun();
    }

    public comFun():void {
        let v = NewerSession.getHand();
        v.ani1.gotoAndStop(0);
        v.lightClip.visible = false;
        let c1 = this.dialog.list.getCell( 2 );
        let c2 = this.dialog.list.getCell( 1 );
        let p1 = c1.localToGlobal( new Laya.Point(0,0) );
        let p2 = c2.localToGlobal( new Laya.Point(0,0) );
        v.x = p1.x + 70;
        v.y = p1.y + 65;

        let t = new Laya.Tween();
        t.to( v ,{ x:p2.x + 70 } , 1000,null, new Laya.Handler(this,this.com2Fun) , 500 );
    }

    public com2Fun():void{
        Laya.timer.once( 500,this,this.com3Fun );
    }

    public com3Fun():void{
        let v = NewerSession.getHand();
        v.ani1.gotoAndStop(0);
        v.lightClip.visible = false;
        let t = new Laya.Tween();
        let c1 = this.dialog.list.getCell( 2 );
        let p1 = c1.localToGlobal( new Laya.Point(0,0) );
        t.to( v ,{x:p1.x + 70} ,100,null,new Laya.Handler(this,this.comFun) );
    }
    
    public onEQUIP_UPDATE():void{
        this.dialog.refreshPlayer();
    }

    public onBAG_UPDATE():void{
        this.dialog.refresh();
    }

    public onMERGE_EQUIP():void{
        if( this.newerSession.isNew == false ){
            return;
        }
        let v = NewerSession.getHand();
        v.removeSelf();
        Laya.Tween.clearAll( v );
        Laya.timer.once( 500 , this, this.mbtnFun );
    }

    public mbtnFun():void{
        this.dialog.list.selectedIndex = 1;
        this.dialog.list.mouseEnabled = false;
        
        this.dialog.equipBtn.mouseEnabled = true;
        let v = NewerSession.getHand();
        Laya.Tween.clearAll( v );
        Laya.stage.addChild( v );
        let p1 = this.dialog.equipBtn.localToGlobal( new Laya.Point(0,0) );
        v.x = p1.x + 81;
        v.y = p1.y + 35;

        v.ani1.play();
        v.lightClip.visible = true;
        v.lightClip.play();

        this.dialog.equipBtn.once(Laya.Event.CLICK , this,this.equipClickFun );

        this.dataSession.log( LogType.NEWER_EQUIP );
    }

    public equipClickFun():void {
        let v = NewerSession.getHand();
        v.removeSelf();
        Laya.timer.once(500,this,this.timr5);
    }

    public timr5():void{
        this.dialog.close();
        this.newerSession.itemnum = 0;
        App.sendEvent(MyEvent.EQUIP_OVER);
    }

    public onATTRIBUTE_UPDATE():void{
        
    }

    public onEGG_UPDATE():void{
        this.resetEggNum();
    }

    public onRED_UPDATE():void {
        this.setType( this.dialog.v0 , EQUIP_TYPE.WEAPON );
        this.setType( this.dialog.v1 , EQUIP_TYPE.HEAD );
        this.setType( this.dialog.v2 , EQUIP_TYPE.BODY );
        this.setType( this.dialog.v3 , EQUIP_TYPE.HORSE );
        this.setType( this.dialog.v4 , EQUIP_TYPE.PET );
    }

    public setType( v:ui.scene.hongtanUI , type:number ):void{
        if( type == EQUIP_TYPE.PET ){
            if( this.petSession.eggNum > 0 ){
                v.visible = true;
                v.ani1.play(0,true);
                return;    
            }
        }
        if( this.bagSession.redMap[type] == null ){
            v.visible = false;
        }else{
            v.visible = true;
            v.ani1.play(0,true);
        }
    }

    public effBtn_click():void{
        if( this.petSession.eggNum == 0 ){
            Tips.show("您没有宠物蛋");
            return;
        }
        if( this.bagSession.isFull( EQUIP_TYPE.PET ) ){
            Tips.show("宠物背包已满");
            return;
        }
        this.sdkSession.playAdVideo( SdkSession.GET_PET ,new Laya.Handler(this,this.aniFun) );
    }

    /**
     * 视频播放完毕 得到宠物蛋 随机1-5级
     */
    public aniFun( stat:number ):void{
        if( stat != 1 ){
            return;
        }
        let arr = this.petSession.getNewPetArr();
        this.bagSession.getEquipDialog( arr ,null,false);
        this.resetEggNum();
    }

    public resetEggNum():void{
        this.dialog.goldFc.value = this.petSession.eggNum + "";
    }
}